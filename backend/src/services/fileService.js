// backend/src/services/fileService.js

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');

class FileService {
  constructor() {
    // ສ້າງໂຟລເດີສຳລັບອັບໂຫຼດ
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.pdfDir = path.join(this.uploadDir, 'pdf');
    this.imageDir = path.join(this.uploadDir, 'images');
    
    [this.uploadDir, this.pdfDir, this.imageDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // ============================================
  // ອ່ານຂໍ້ຄວາມຈາກ PDF
  // ============================================
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text || '',
        pages: data.numpages || 0,
        info: data.info || {},
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // ============================================
  // ອ່ານຂໍ້ຄວາມຈາກຮູບພາບ (OCR) - ແກ້ໄຂແລ້ວ
  // ============================================
  async extractTextFromImage(filePath) {
    try {
      console.log('🔍 Running OCR on image...');
      
      const result = await Tesseract.recognize(
        filePath,
        'lao+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log('✅ OCR completed');
      
      // ✅ ກວດສອບວ່າ result ມີຄ່າຖືກຕ້ອງ
      const extractedText = result.data?.text || '';
      const confidence = result.data?.confidence || 0;
      const wordCount = result.data?.words?.length || 0;
      
      console.log(`📝 Extracted ${wordCount} words with confidence ${Math.round(confidence)}%`);
      
      // ✅ ຖ້າບໍ່ມີຂໍ້ຄວາມ, ສົ່ງຄືນຂໍ້ມູນວ່າບໍ່ພົບ
      if (!extractedText || extractedText.trim().length === 0) {
        console.log('⚠️ No text found in image');
        return {
          text: '',
          confidence: 0,
          words: 0,
          message: 'No text detected in the image'
        };
      }
      
      return {
        text: extractedText,
        confidence: confidence,
        words: wordCount,
        message: 'Text extracted successfully'
      };
    } catch (error) {
      console.error('OCR error:', error);
      // ✅ ສົ່ງຄືນວ່າບໍ່ພົບຂໍ້ຄວາມ ແທນທີ່ຈະ throw error
      return {
        text: '',
        confidence: 0,
        words: 0,
        message: 'Failed to extract text from image'
      };
    }
  }

  // ============================================
  // ປະມວນຜົນໄຟລ໌ (ຫຼັກ)
  // ============================================
  async processFile(file, userId) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const fileType = file.mimetype;
      
      // ກວດສອບປະເພດໄຟລ໌
      const isPDF = fileType === 'application/pdf' || fileExtension === '.pdf';
      const isImage = fileType.startsWith('image/') || 
                     ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(fileExtension);

      if (!isPDF && !isImage) {
        throw new Error('Unsupported file type. Please upload PDF or Image.');
      }

      // ກຳນົດຊື່ໄຟລ໌ ແລະ ທີ່ຢູ່
      const uniqueId = uuidv4();
      const newFilename = `${uniqueId}-${file.originalname}`;
      const filePath = path.join(
        isPDF ? this.pdfDir : this.imageDir,
        newFilename
      );

      // ບັນທຶກໄຟລ໌
      fs.writeFileSync(filePath, file.buffer);

      // ດຶງຂໍ້ຄວາມຂຶ້ນມາ
      let extractedText = '';
      let pages = 0;
      let metadata = {};
      
      if (isPDF) {
        const result = await this.extractTextFromPDF(filePath);
        extractedText = result.text || '';
        pages = result.pages || 0;
        metadata = result.info || {};
      } else if (isImage) {
        const result = await this.extractTextFromImage(filePath);
        extractedText = result.text || '';
        metadata = {
          confidence: result.confidence || 0,
          words: result.words || 0,
          message: result.message || ''
        };
        // ✅ ຖ້າບໍ່ພົບຂໍ້ຄວາມ, ໃຊ້ຂໍ້ຄວາມເຕືອນ
        if (!extractedText || extractedText.trim().length === 0) {
          extractedText = 'No text detected in this image. Please upload an image with clear text.';
        }
      }

      // ບັນທຶກລົງຖານຂໍ້ມູນ
      const fileRecord = await prisma.fileUpload.create({
        data: {
          filename: file.originalname,
          file_path: filePath,
          file_type: isPDF ? 'pdf' : 'image',
          mime_type: fileType,
          file_size: file.size,
          extracted_text: extractedText,
          summary: isImage && (!extractedText || extractedText === 'No text detected in this image. Please upload an image with clear text.') ? 'No text detected' : null,
          processed: true,
          user_id: userId,
        },
      });

      return {
        success: true,
        fileId: fileRecord.id,
        filename: file.originalname,
        fileType: isPDF ? 'pdf' : 'image',
        extractedText: extractedText.substring(0, 1000),
        pages: pages,
        metadata: metadata,
        record: fileRecord,
      };
    } catch (error) {
      console.error('File processing error:', error);
      throw error;
    }
  }

  // ============================================
  // ດຶງຂໍ້ມູນໄຟລ໌ທີ່ເກັບໄວ້
  // ============================================
  async getFile(fileId, userId) {
    const file = await prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        user_id: userId,
      },
    });
    return file;
  }

  // ============================================
  // ດຶງລາຍຊື່ໄຟລ໌ທັງໝົດຂອງຜູ້ໃຊ້
  // ============================================
  async getUserFiles(userId) {
    const files = await prisma.fileUpload.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return files;
  }

  // ============================================
  // ລຶບໄຟລ໌
  // ============================================
  async deleteFile(fileId, userId) {
    const file = await prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        user_id: userId,
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // ລຶບໄຟລ໌ອອກຈາກລະບົບ
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // ລຶບຂໍ້ມູນຈາກຖານຂໍ້ມູນ
    await prisma.fileUpload.delete({
      where: { id: fileId },
    });

    return { success: true };
  }
}

module.exports = new FileService();