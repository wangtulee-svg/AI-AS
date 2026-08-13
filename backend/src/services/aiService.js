// backend/src/services/aiService.js

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class AIService {
  constructor() {
    console.log('🔧 Initializing AI Service...');
    console.log('📋 Environment check:');
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log(`   AI_PROVIDER: ${process.env.AI_PROVIDER || 'openai (default)'}`);

    this.provider = process.env.AI_PROVIDER || 'openai';
    
    // ຕັ້ງຄ່າ OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY.trim(),
          timeout: 30000,
        });
        this.openaiEnabled = true;
        console.log('✅ OpenAI API is configured successfully');
      } catch (error) {
        console.error('❌ OpenAI initialization error:', error.message);
        this.openaiEnabled = false;
      }
    } else {
      this.openaiEnabled = false;
      console.warn('⚠️ OpenAI API Key not found');
    }

    // ຕັ້ງຄ່າ Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const apiKey = process.env.GEMINI_API_KEY.trim();
        console.log(`📋 Gemini API Key (first 15 chars): ${apiKey.substring(0, 15)}...`);
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
        console.log(`📋 Gemini Model: ${modelName}`);
        
        this.geminiModel = this.genAI.getGenerativeModel({
          model: modelName,
        });
        this.geminiEnabled = true;
        console.log('✅ Gemini API is configured successfully');
      } catch (error) {
        console.error('❌ Gemini initialization error:', error.message);
        this.geminiEnabled = false;
      }
    } else {
      this.geminiEnabled = false;
      console.warn('⚠️ Gemini API Key not found');
    }

    if (!this.openaiEnabled && !this.geminiEnabled) {
      console.error('❌ No AI provider is configured!');
      console.error('   Please add OPENAI_API_KEY or GEMINI_API_KEY to .env');
    }
  }

  // ============================================
  // Chat Methods
  // ============================================
  async chat(message, context = []) {
    console.log(`🤖 Chat request (provider: ${this.provider})`);
    console.log(`📝 Message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

    if (!this.openaiEnabled && !this.geminiEnabled) {
      return {
        success: false,
        message: '⚠️ AI service is not configured. Please contact administrator.',
      };
    }

    try {
      if (this.provider === 'gemini' && this.geminiEnabled) {
        return await this.chatWithGemini(message, context);
      }
      
      if (this.openaiEnabled) {
        return await this.chatWithOpenAI(message, context);
      }

      if (this.geminiEnabled) {
        console.log('🔄 Falling back to Gemini');
        return await this.chatWithGemini(message, context);
      }

      if (this.openaiEnabled) {
        console.log('🔄 Falling back to OpenAI');
        return await this.chatWithOpenAI(message, context);
      }

      return {
        success: false,
        message: '⚠️ No AI service available. Please check configuration.',
      };
    } catch (error) {
      console.error('❌ Chat error:', error.message);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
      };
    }
  }

  async chatWithOpenAI(message, context = []) {
    try {
      console.log('🤖 Sending request to OpenAI...');

      const messages = [
        {
          role: 'system',
          content: `You are an AI University Student Assistant. You help students with their academic questions.
          Always be helpful, friendly, and educational. If you don't know something, say so honestly.
          You can respond in both English and Lao language if the user asks.`
        },
        ...context,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        temperature: parseFloat(process.env.AI_TEMPERATURE || 0.7),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || 1000),
      });

      console.log('✅ OpenAI response received');
      
      return {
        success: true,
        message: response.choices[0].message.content,
        provider: 'openai',
      };
    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      if (error.status === 429) {
        return {
          success: false,
          message: '⚠️ OpenAI rate limit exceeded. Please try again later.',
        };
      }
      if (error.code === 'insufficient_quota') {
        return {
          success: false,
          message: '⚠️ OpenAI quota exhausted. Please check your billing.',
        };
      }
      throw error;
    }
  }

  async chatWithGemini(message, context = []) {
    try {
      console.log('🤖 Sending request to Gemini...');

      const history = context.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = this.geminiModel.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || 1000),
          temperature: parseFloat(process.env.AI_TEMPERATURE || 0.7),
        },
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      
      console.log('✅ Gemini response received');
      
      return {
        success: true,
        message: response.text(),
        provider: 'gemini',
      };
    } catch (error) {
      console.error('❌ Gemini Error:', error);
      
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        return {
          success: false,
          message: '⚠️ Gemini model not found. Please check your model name in .env (use: gemini-pro)',
        };
      }
      if (error.message?.includes('API key not valid')) {
        return {
          success: false,
          message: '⚠️ Invalid Gemini API key. Please check your .env file and get a new key from https://aistudio.google.com/app/apikey',
        };
      }
      if (error.message?.includes('quota')) {
        return {
          success: false,
          message: '⚠️ Gemini API quota exceeded. Please try again later.',
        };
      }
      if (error.status === 429) {
        return {
          success: false,
          message: '⚠️ Too many requests. Please try again later.',
        };
      }
      if (error.status === 403) {
        return {
          success: false,
          message: '⚠️ Access denied. Please check your API key permissions.',
        };
      }
      if (error.message?.includes('blocked')) {
        return {
          success: false,
          message: '⚠️ Content blocked by safety filters. Please rephrase your question.',
        };
      }
      
      throw error;
    }
  }

  // ============================================
  // AI Quiz Generator
  // ============================================
  async generateQuiz(topic, difficulty = 'medium', numQuestions = 5, subjectId = null, pdfId = null) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Generating quiz (attempt ${attempt}/${maxRetries})...`);
        console.log(`📝 Topic: "${topic}", Difficulty: ${difficulty}, Questions: ${numQuestions}`);

        // ດຶງຂໍ້ມູນຈາກ PDF ຖ້າມີ
        let context = '';
        if (pdfId) {
          try {
            const prisma = require('../lib/prisma');
            const pdf = await prisma.pDFDocument.findUnique({
              where: { id: pdfId },
              select: { summary: true, summary_lao: true, summary_eng: true }
            });
            if (pdf) {
              context = pdf.summary || pdf.summary_eng || pdf.summary_lao || '';
            }
          } catch (error) {
            console.warn('Could not fetch PDF context:', error.message);
          }
        }

        // ດຶງຂໍ້ມູນຈາກ Subject ຖ້າມີ
        let subjectInfo = '';
        if (subjectId) {
          try {
            const prisma = require('../lib/prisma');
            const subject = await prisma.subject.findUnique({
              where: { id: subjectId },
              select: { name: true, description: true }
            });
            if (subject) {
              subjectInfo = `Subject: ${subject.name}\nDescription: ${subject.description || ''}`;
            }
          } catch (error) {
            console.warn('Could not fetch subject context:', error.message);
          }
        }

        const prompt = `
          Generate ${numQuestions} multiple choice questions about "${topic}".
          Difficulty level: ${difficulty} (easy, medium, hard).
          
          ${subjectInfo ? `Subject context: ${subjectInfo}` : ''}
          ${context ? `Additional context from PDF: ${context.substring(0, 2000)}` : ''}
          
          IMPORTANT: Return ONLY a JSON array with the following structure:
          [
            {
              "question": "What is the question?",
              "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
              "correct_answer": "A",
              "explanation": "Explanation of why this is correct"
            }
          ]
          
          Make sure:
          1. Questions are educational and accurate
          2. All options are plausible
          3. Correct answer is clearly indicated
          4. Explanations are helpful
          5. Return ONLY the JSON array, no other text
        `;

        let response;
        if (this.provider === 'gemini' && this.geminiEnabled) {
          try {
            const result = await this.geminiModel.generateContent(prompt);
            response = result.response.text();
          } catch (error) {
            if (error.status === 429 || error.message?.includes('quota')) {
              console.warn(`⚠️ Rate limit hit (attempt ${attempt}), waiting...`);
              const waitTime = attempt * 10000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
              throw error;
            }
            throw error;
          }
        } else if (this.openaiEnabled) {
          const result = await this.openai.chat.completions.create({
            model: this.model || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an AI that generates educational quiz questions. Return ONLY valid JSON.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          });
          response = result.choices[0].message.content;
        } else {
          throw new Error('No AI provider available');
        }

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('Failed to parse quiz questions');
        }

        const questions = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated ${questions.length} questions`);

        return {
          success: true,
          questions: questions,
          totalQuestions: questions.length,
        };
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (error.status === 429 || error.message?.includes('quota')) {
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 5} seconds...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 5000));
            continue;
          }
        }
        break;
      }
    }

    console.error('❌ All attempts failed');
    return {
      success: false,
      error: lastError?.message || 'Failed to generate quiz after multiple attempts',
      questions: [],
    };
  }

  // ============================================
  // AI Study Planner (ແກ້ໄຂແລ້ວ)
  // ============================================
  async generateStudyPlan(subjects, examDate, availableHours = 2, startDate = null) {
    try {
      console.log(`📝 Generating study plan for ${subjects.length} subjects...`);
      
      const today = startDate ? new Date(startDate) : new Date();
      const exam = new Date(examDate);
      const daysUntilExam = Math.max(1, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));
      
      const subjectList = subjects.map(s => `- ${s.name} (Priority: ${s.priority || 'medium'}, ${s.credits || 3} credits)`).join('\n');
      
      const prompt = `
        You are an AI Study Planner for university students.
        
        Today's date: ${today.toLocaleDateString()}
        Exam date: ${exam.toLocaleDateString()}
        Days remaining: ${daysUntilExam} days
        Available study hours per day: ${availableHours} hours
        
        Subjects to study:
        ${subjectList}
        
        Create a detailed study plan that:
        1. Covers all subjects before the exam
        2. Allocates more time to subjects with higher priority
        3. Includes breaks (15 minutes after every 45 minutes of study)
        4. Is realistic and achievable
        
        Return ONLY a JSON array with the following structure:
        [
          {
            "day": 1,
            "date": "2024-01-01",
            "tasks": [
              {
                "subject": "Subject Name",
                "topic": "Specific topic to study",
                "duration": 60,
                "startTime": "09:00",
                "endTime": "10:00",
                "priority": "high"
              }
            ]
          }
        ]
        
        Generate a plan for ${Math.min(daysUntilExam, 14)} days.
        Each day should have ${Math.floor(availableHours)} hours of study.
        Return ONLY the JSON array, no other text.
      `;

      let response;
      if (this.provider === 'gemini' && this.geminiEnabled) {
        const result = await this.geminiModel.generateContent(prompt);
        response = result.response.text();
      } else if (this.openaiEnabled) {
        const result = await this.openai.chat.completions.create({
          model: this.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an AI Study Planner. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 3000,
          temperature: 0.7,
        });
        response = result.choices[0].message.content;
      } else {
        throw new Error('No AI provider available');
      }

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse study plan');
      }

      const plan = JSON.parse(jsonMatch[0]);
      console.log(`✅ Generated study plan for ${plan.length} days`);

      return {
        success: true,
        plan: plan,
        days: plan.length,
        totalTasks: plan.reduce((sum, day) => sum + day.tasks.length, 0),
      };
    } catch (error) {
      console.error('Generate study plan error:', error);
      
      // ✅ Fallback ໃຊ້ Mock Data ຖ້າ AI ລົ້ມເຫຼວ
      console.log('🔄 Using mock study plan (fallback)...');
      const mockPlan = this.getMockStudyPlan(subjects, examDate, availableHours);
      
      return {
        success: true,
        plan: mockPlan,
        days: mockPlan.length,
        totalTasks: mockPlan.reduce((sum, day) => sum + day.tasks.length, 0),
        usedFallback: true,
      };
    }
  }

  // ============================================
  // Mock Data (Fallback)
  // ============================================
  getMockStudyPlan(subjects, examDate, availableHours) {
    const days = 7;
    const plan = [];
    
    for (let i = 0; i < days; i++) {
      const dayTasks = [];
      const startHour = 9;
      
      for (let j = 0; j < subjects.length; j++) {
        const subject = subjects[j];
        const hour = startHour + (j * 2);
        dayTasks.push({
          subject: subject.name,
          topic: `Chapter ${j + 1}: ${subject.name} Fundamentals`,
          duration: 60,
          startTime: `${hour}:00`,
          endTime: `${hour + 1}:00`,
          priority: subject.priority || 'medium',
        });
      }
      
      plan.push({
        day: i + 1,
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        tasks: dayTasks,
      });
    }
    
    return plan;
  }
}

module.exports = new AIService();