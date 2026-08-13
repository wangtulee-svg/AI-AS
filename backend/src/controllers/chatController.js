// backend/src/controllers/chatController.js

const prisma = require('../lib/prisma');
const aiService = require('../services/aiService');
const fileService = require('../services/fileService');
const { validationResult } = require('express-validator');

// ============================================
// Session Management
// ============================================

// ສ້າງ Session ໃໝ່
exports.createSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { title = 'New Chat' } = req.body;

    console.log(`📝 Creating session for user: ${userId}`);

    // ກວດສອບວ່າມີ Session ທີ່ບໍ່ມີຂໍ້ຄວາມບໍ່
    const emptySession = await prisma.chatSession.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        messages: {
          none: {},
        },
      },
    });

    // ຖ້າມີ Session ທີ່ຫວ່າງ, ໃຊ້ອັນເກົ່າ
    if (emptySession) {
      return res.json({
        success: true,
        data: {
          session_id: emptySession.id,
          title: emptySession.title,
          created_at: emptySession.created_at,
        },
        message: 'Using existing empty session',
      });
    }

    const session = await prisma.chatSession.create({
      data: {
        title: title,
        user_id: userId,
        is_active: true,
      },
    });

    console.log(`✅ Session created: ${session.id}`);

    res.json({
      success: true,
      data: {
        session_id: session.id,
        title: session.title,
        created_at: session.created_at,
      },
      message: 'New chat session created',
    });
  } catch (error) {
    console.error('❌ Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message,
    });
  }
};

// ດຶງລາຍຊື່ Sessions ທັງໝົດ
exports.getSessions = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`📝 Fetching sessions for user: ${userId}`);

    const sessions = await prisma.chatSession.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        messages: {
          orderBy: { created_at: 'asc' },
          take: 1,
          select: {
            message: true,
            created_at: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    console.log(`📝 Found ${sessions.length} sessions`);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title || 'New Chat',
      preview: session.messages[0]?.message || 'No messages',
      lastMessageTime: session.messages[0]?.created_at || session.created_at,
      messageCount: session._count.messages || 0,
      created_at: session.created_at,
      updated_at: session.updated_at,
    }));

    res.json({
      success: true,
      data: formattedSessions,
    });
  } catch (error) {
    console.error('❌ Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      error: error.message,
    });
  }
};

// ອັບເດດຊື່ Session
exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const session = await prisma.chatSession.update({
      where: {
        id: sessionId,
        user_id: userId,
      },
      data: {
        title: title.trim(),
      },
    });

    res.json({
      success: true,
      data: session,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('❌ Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session',
      error: error.message,
    });
  }
};

// ລຶບ Session
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    console.log(`🗑️ Deleting session: ${sessionId} for user: ${userId}`);

    // ລຶບຂໍ້ຄວາມທັງໝົດໃນ Session ກ່ອນ
    await prisma.chatMessage.deleteMany({
      where: {
        session_id: sessionId,
        user_id: userId,
      },
    });

    // ລຶບ Session
    await prisma.chatSession.delete({
      where: {
        id: sessionId,
        user_id: userId,
      },
    });

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message,
    });
  }
};

// ============================================
// Message Management
// ============================================

// ສົ່ງຂໍ້ຄວາມ ແລະ ຮັບຄຳຕອບ
exports.sendMessage = async (req, res) => {
  try {
    console.log('📝 Received chat request:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { message, session_id, subject_id, file_id } = req.body;
    const userId = req.userId;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // ============================================
    // ຈັດການ Session
    // ============================================
    let sessionId = session_id;

    if (!sessionId) {
      // ຖ້າບໍ່ມີ session_id, ສ້າງ Session ໃໝ່
      const newSession = await prisma.chatSession.create({
        data: {
          title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
          user_id: userId,
          is_active: true,
        },
      });
      sessionId = newSession.id;
      console.log(`📝 Created new session: ${sessionId}`);
    } else {
      // ກວດສອບວ່າ session ມີຢູ່ບໍ່
      const existingSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          user_id: userId,
        },
      });
      
      if (!existingSession) {
        // ຖ້າບໍ່ມີ, ສ້າງໃໝ່
        const newSession = await prisma.chatSession.create({
          data: {
            title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            user_id: userId,
            is_active: true,
          },
        });
        sessionId = newSession.id;
        console.log(`📝 Created new session (fallback): ${sessionId}`);
      }
    }

    // ============================================
    // ຈັດການ subject_id
    // ============================================
    let finalSubjectId = null;
    if (subject_id) {
      if (Array.isArray(subject_id) && subject_id.length > 0) {
        finalSubjectId = subject_id[0];
      } else if (typeof subject_id === 'string') {
        finalSubjectId = subject_id;
      }
    }

    // ============================================
    // ດຶງຂໍ້ມູນໄຟລ໌ (ຖ້າມີ)
    // ============================================
    let fileContent = '';
    let fileInfo = null;
    if (file_id) {
      const file = await fileService.getFile(file_id, userId);
      if (file && file.extracted_text) {
        fileContent = file.extracted_text;
        fileInfo = {
          filename: file.filename,
          file_type: file.file_type,
          file_size: file.file_size,
        };
        console.log(`📄 Loaded file: ${file.filename} (${fileContent.length} chars)`);
      } else {
        console.warn(`⚠️ File ${file_id} not found or has no extracted text`);
      }
    }

    // ============================================
    // ດຶງປະຫວັດການສົນທະນາ (Context)
    // ============================================
    let chatHistory = [];
    try {
      chatHistory = await prisma.chatMessage.findMany({
        where: {
          user_id: userId,
          session_id: sessionId,
        },
        orderBy: {
          created_at: 'asc',
        },
        take: 10,
        select: {
          message: true,
          response: true,
        },
      });
    } catch (dbError) {
      console.warn('⚠️ Could not fetch chat history:', dbError.message);
    }

    const context = chatHistory.flatMap(msg => [
      { role: 'user', content: msg.message },
      { role: 'assistant', content: msg.response || '' },
    ]);

    // ============================================
    // ກຽມຂໍ້ຄວາມສຳລັບ AI
    // ============================================
    let finalMessage = message;
    if (fileContent) {
      const filePrompt = `
        The user has uploaded a file named "${fileInfo.filename}" (${fileInfo.file_type}).
        Here is the content of the file:
        
        ${fileContent.substring(0, 8000)}
        
        The user's question is: "${message}"
        
        Please answer based on the file content above.
        If the answer is not in the file, say so honestly.
      `;
      finalMessage = filePrompt;
    }

    // ============================================
    // ເອີ້ນ AI Service
    // ============================================
    console.log('🤖 Calling AI service...');
    const aiResponse = await aiService.chat(finalMessage, context);
    console.log('✅ AI response received');

    // ============================================
    // ບັນທຶກຂໍ້ຄວາມ
    // ============================================
    try {
      const chatMessage = await prisma.chatMessage.create({
        data: {
          user_id: userId,
          session_id: sessionId,
          message: message,
          response: aiResponse.message || 'No response from AI',
          subject_id: finalSubjectId,
          context: {
            tokens: aiResponse.usage?.total_tokens || 0,
            model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          },
        },
      });

      // ອັບເດດເວລາຂອງ Session
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updated_at: new Date() },
      });

      // ຖ້າເປັນຂໍ້ຄວາມທຳອິດ, ອັບເດດຊື່ Session
      const messageCount = await prisma.chatMessage.count({
        where: { session_id: sessionId },
      });

      if (messageCount === 1) {
        const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { title: title },
        });
      }

      return res.json({
        success: true,
        data: {
          id: chatMessage.id,
          message: chatMessage.message,
          response: aiResponse.message,
          session_id: sessionId,
          usage: aiResponse.usage,
        },
      });
    } catch (dbError) {
      console.error('❌ Database save error:', dbError);
      
      return res.json({
        success: true,
        data: {
          response: aiResponse.message,
          session_id: sessionId,
          usage: aiResponse.usage,
          saved: false,
        },
      });
    }
  } catch (error) {
    console.error('❌ Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ດຶງປະຫວັດການສົນທະນາ
exports.getChatHistory = async (req, res) => {
  try {
    const { session_id } = req.query;
    const userId = req.userId;

    const where = { user_id: userId };
    if (session_id) {
      where.session_id = session_id;
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: {
        created_at: 'asc',
      },
      select: {
        id: true,
        message: true,
        response: true,
        created_at: true,
        subject_id: true,
        session_id: true,
      },
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
    });
  }
};

// ລຶບປະຫວັດການສົນທະນາ
exports.clearHistory = async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.userId;

    const where = {
      user_id: userId,
    };
    if (session_id) {
      where.session_id = session_id;
    }

    const result = await prisma.chatMessage.deleteMany({
      where,
    });

    res.json({
      success: true,
      message: `Chat history cleared (${result.count} messages deleted)`,
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
    });
  }
};