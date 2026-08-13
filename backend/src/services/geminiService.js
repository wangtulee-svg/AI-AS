const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API Key not found. Using mock responses.');
      this.isEnabled = false;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
      });
      this.isEnabled = true;
      console.log('✅ Gemini AI Service enabled');
    }
  }

  // ສະຫຼຸບເນື້ອຫາ
  async summarize(text, language = 'both') {
    if (!this.isEnabled) {
      return this.getMockSummary(text);
    }

    try {
      const prompt = this.getSummaryPrompt(text, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        success: true,
        summary: response.text(),
        language: language,
      };
    } catch (error) {
      console.error('Gemini Summarize Error:', error);
      return {
        success: false,
        error: error.message,
        summary: 'ຂໍໂທດ, ການສະຫຼຸບມີບັນຫາ. ກະລຸນາລອງໃໝ່.'
      };
    }
  }

  // ຕອບຄຳຖາມກ່ຽວກັບ PDF
  async askQuestion(text, question, language = 'both') {
    if (!this.isEnabled) {
      return this.getMockAnswer(question);
    }

    try {
      const prompt = this.getQAPrompt(text, question, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        success: true,
        answer: response.text(),
        language: language,
      };
    } catch (error) {
      console.error('Gemini QA Error:', error);
      return {
        success: false,
        error: error.message,
        answer: 'ຂໍໂທດ, ບໍ່ສາມາດຕອບຄຳຖາມໄດ້. ກະລຸນາລອງໃໝ່.'
      };
    }
  }

  // ສ້າງຂໍ້ສອບເສັງ
  async generateQuiz(text, numberOfQuestions = 10, language = 'both') {
    if (!this.isEnabled) {
      return this.getMockQuiz(numberOfQuestions);
    }

    try {
      const prompt = this.getQuizPrompt(text, numberOfQuestions, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // ພະຍາຍາມ parse JSON
      try {
        const quizData = JSON.parse(response.text());
        return {
          success: true,
          quiz: quizData,
          language: language,
        };
      } catch (parseError) {
        // ຖ້າ parse ບໍ່ໄດ້, ສົ່ງເປັນຂໍ້ຄວາມ
        return {
          success: true,
          quiz: response.text(),
          language: language,
          raw: true,
        };
      }
    } catch (error) {
      console.error('Gemini Quiz Error:', error);
      return {
        success: false,
        error: error.message,
        quiz: 'ຂໍໂທດ, ການສ້າງຂໍ້ສອບເສັງມີບັນຫາ. ກະລຸນາລອງໃໝ່.'
      };
    }
  }

  // Prompts
  getSummaryPrompt(text, language) {
    const langInstruction = language === 'lao' 
      ? 'Please provide the summary in Lao language only.'
      : language === 'english'
        ? 'Please provide the summary in English only.'
        : 'Please provide the summary in both Lao and English. Start with Lao, then English.';

    return `Please summarize the following text comprehensively:

${text}

${langInstruction}

Make sure the summary is:
1. Clear and easy to understand
2. Covers all main points
3. Well-organized with key sections
4. About 10-15% of the original length
5. Includes key takeaways and important concepts`;
  }

  getQAPrompt(text, question, language) {
    const langInstruction = language === 'lao' 
      ? 'Please answer in Lao language only.'
      : language === 'english'
        ? 'Please answer in English only.'
        : 'Please answer in both Lao and English. Start with Lao, then English.';

    return `Based on the following text, please answer this question:

Text:
${text}

Question: ${question}

${langInstruction}

Please be:
1. Specific and based on the text
2. Clear and easy to understand
3. If the answer is not in the text, say so honestly
4. Include relevant examples from the text if possible`;
  }

  getQuizPrompt(text, numberOfQuestions, language) {
    const langInstruction = language === 'lao' 
      ? 'Create the quiz in Lao language only.'
      : language === 'english'
        ? 'Create the quiz in English only.'
        : 'Create the quiz in both Lao and English.';

    return `Based on the following text, create ${numberOfQuestions} multiple-choice questions:

Text:
${text}

${langInstruction}

Format the output as a JSON array with this structure:
[
  {
    "question": "The question text",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correct": 0, // index of correct answer (0-based)
    "explanation": "Brief explanation of why this is correct"
  }
]

Requirements:
1. Questions should cover main concepts
2. Options should be plausible but only one correct
3. Include a mix of easy and medium difficulty questions
4. Ensure questions are educational and clear`;
  }

  // Mock Responses (ເມື່ອບໍ່ມີ API Key)
  getMockSummary(text) {
    return {
      success: true,
      summary: `📄 ບົດສະຫຼຸບເບື້ອງຕົ້ນ

ນີ້ແມ່ນການສະຫຼຸບຂອງເອກະສານທີ່ທ່ານອັບໂຫຼດ.

⚠️ ໝາຍເຫດ: ກຳລັງໃຊ້ໂໝດສາທິດ (Mock Mode). 
ເພື່ອໃຊ້ການສະຫຼຸບແບບຈິງ, ກະລຸນາຕັ້ງຄ່າ GEMINI_API_KEY ໃນໄຟລ໌ .env.

ຄຳແນະນຳ: ທ່ານສາມາດຮັບບົດສະຫຼຸບທີ່ມີຄຸນນະພາບສູງກວ່າໄດ້ ເມື່ອຕັ້ງຄ່າ API Key ໃຫ້ສຳເລັດ.

📚 ຈຳນວນໜ້າ: ${text.split('\n').length} ໜ້າ (ປະມານ)
🔑 ຄຳສຳຄັນ: ລໍຖ້າການວິເຄາະຈາກ AI

ກະລຸນາຕັ້ງຄ່າ API Key ເພື່ອໃຊ້ງານແບບເຕັມຮູບແບບ!`,
      language: 'both',
    };
  }

  getMockAnswer(question) {
    return {
      success: true,
      answer: `🤔 ຄຳຕອບສຳລັບ: "${question}"

⚠️ ກຳລັງໃຊ້ໂໝດສາທິດ (Mock Mode).

ເພື່ອໃຫ້ໄດ້ຄຳຕອບທີ່ຖືກຕ້ອງ ແລະ ລາຍລະອຽດຈາກເອກະສານ, ກະລຸນາຕັ້ງຄ່າ GEMINI_API_KEY ໃນໄຟລ໌ .env.

ຄຳຕອບຈະອີງໃສ່ເນື້ອຫາໃນ PDF ທີ່ທ່ານອັບໂຫຼດ ແລະ ຈະມີຄວາມຊັດເຈນຫຼາຍຂຶ້ນເມື່ອຕັ້ງຄ່າ API Key ສຳເລັດ.`,
      language: 'both',
    };
  }

  getMockQuiz(numberOfQuestions) {
    const mockQuestions = [
      {
        question: "ຈຸດປະສົງຫຼັກຂອງເອກະສານນີ້ແມ່ນຫຍັງ?",
        options: [
          "A. ອະທິບາຍທິດສະດີ",
          "B. ໃຫ້ຄຳແນະນຳພາກປະຕິບັດ",
          "C. ສະເໜີການວິເຄາະ",
          "D. ທັງໝົດຂ້າງເທິງ"
        ],
        correct: 3,
        explanation: "ເອກະສານສ່ວນໃຫຍ່ມີຈຸດປະສົງຫຼາຍຢ່າງລວມກັນ"
      },
      {
        question: "ຫົວຂໍ້ຫຼັກຂອງເອກະສານນີ້ແມ່ນຫຍັງ?",
        options: [
          "A. ວິທະຍາສາດ",
          "B. ເຕັກໂນໂລຊີ",
          "C. ການສຶກສາ",
          "D. ຂຶ້ນກັບເນື້ອຫາໃນ PDF"
        ],
        correct: 3,
        explanation: "ຄຳຕອບທີ່ຖືກຕ້ອງຈະຂຶ້ນກັບເນື້ອຫາຈິງໃນ PDF"
      }
    ];

    return {
      success: true,
      quiz: mockQuestions.slice(0, Math.min(numberOfQuestions, mockQuestions.length)),
      language: 'both',
      raw: false,
    };
  }
}

module.exports = new GeminiService();