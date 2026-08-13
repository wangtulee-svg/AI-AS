// backend/src/controllers/fileController.js

const fileService = require('../services/fileService');
const visionService = require('../services/visionService');
const aiService = require('../services/aiService');

// ອັບໂຫຼດ ແລະ ປະມວນຜົນໄຟລ໌
exports.uploadFile = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    console.log(`📤 Uploading file: ${req.file.originalname} (${req.file.mimetype})`);

    // ປະມວນຜົນໄຟລ໌
    const result = await fileService.processFile(req.file, userId);

    // ✅ ຖ້າເປັນຮູບພາບ ແລະ ບໍ່ມີຂໍ້ຄວາມ, ສົ່ງເຕືອນ
    if (result.fileType === 'image' && (!result.extractedText || result.extractedText.includes('No text detected'))) {
      return res.json({
        success: true,
        data: {
          ...result,
          warning: 'No text detected in the image. The AI may not be able to answer questions about it.',
        },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
};

// ຖາມຄຳຖາມກ່ຽວກັບໄຟລ໌
exports.askFile = async (req, res) => {
  try {
    const { fileId, question, language = 'both' } = req.body;
    const userId = req.userId;

    if (!fileId || !question) {
      return res.status(400).json({
        success: false,
        message: 'File ID and question are required',
      });
    }

    // ດຶງຂໍ້ມູນໄຟລ໌
    const file = await fileService.getFile(fileId, userId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // ກຽມ Context ຈາກເນື້ອຫາໄຟລ໌
    let context = '';
    if (file.extracted_text) {
      context = file.extracted_text;
    } else {
      return res.status(400).json({
        success: false,
        message: 'File has no extracted text to analyze',
      });
    }

    // ✅ ກວດສອບວ່າມີຂໍ້ຄວາມຈິງ
    if (context.includes('No text detected')) {
      return res.status(400).json({
        success: false,
        message: 'No text detected in the file. Please upload a file with clear text content.',
      });
    }

    // ສ້າງ Prompt ສຳລັບ AI
    const prompt = `
      You are an AI assistant analyzing a document.
      
      Document content:
      ${context.substring(0, 8000)}
      
      Question: ${question}
      
      Answer based on the document content.
      ${language === 'lao' ? 'Answer in Lao language.' : language === 'english' ? 'Answer in English.' : 'Answer in both Lao and English.'}
      
      If the answer is not in the document, say "I couldn't find the answer in the document."
    `;

    // ເອີ້ນ AI
    const aiResponse = await aiService.chat(prompt, []);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: aiResponse.message || 'Failed to get AI response',
      });
    }

    res.json({
      success: true,
      data: {
        question: question,
        answer: aiResponse.message,
        fileId: fileId,
        filename: file.filename,
        provider: aiResponse.provider || 'unknown',
      },
    });
  } catch (error) {
    console.error('Ask file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message,
    });
  }
};

// ວິເຄາະຮູບພາບ
exports.analyzeImage = async (req, res) => {
  try {
    const { fileId, prompt } = req.body;
    const userId = req.userId;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    // ດຶງຂໍ້ມູນໄຟລ໌
    const file = await fileService.getFile(fileId, userId);
    if (!file || file.file_type !== 'image') {
      return res.status(404).json({
        success: false,
        message: 'Image file not found',
      });
    }

    // ວິເຄາະຮູບພາບດ້ວຍ Vision AI
    const result = await visionService.analyzeImage(
      file.file_path,
      prompt || 'Describe this image in detail'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to analyze image',
      });
    }

    res.json({
      success: true,
      data: {
        description: result.description,
        provider: result.provider,
      },
    });
  } catch (error) {
    console.error('Analyze image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message,
    });
  }
};

// ດຶງລາຍຊື່ໄຟລ໌ທັງໝົດ
exports.getFiles = async (req, res) => {
  try {
    const userId = req.userId;
    const files = await fileService.getUserFiles(userId);
    
    res.json({
      success: true,
      data: files.map(f => ({
        id: f.id,
        filename: f.filename,
        file_type: f.file_type,
        file_size: f.file_size,
        processed: f.processed,
        created_at: f.created_at,
        has_text: f.extracted_text && f.extracted_text.length > 0 && !f.extracted_text.includes('No text detected'),
      })),
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get files',
      error: error.message,
    });
  }
};

// ລຶບໄຟລ໌
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const result = await fileService.deleteFile(fileId, userId);
    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
};