// backend/src/services/visionService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class VisionService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-pro-vision',
      });
      this.isEnabled = true;
      console.log('✅ Vision Service enabled');
    } else {
      console.warn('⚠️ Vision Service disabled (no API key)');
      this.isEnabled = false;
    }
  }

  // ============================================
  // ວິເຄາະຮູບພາບດ້ວຍ Gemini Vision
  // ============================================
  async analyzeImage(imagePath, prompt = 'Describe this image in detail') {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Vision Service is not configured. Please add GEMINI_API_KEY to .env',
      };
    }

    try {
      // ອ່ານຮູບພາບ
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // ສ້າງ prompt ສຳລັບ Vision
      const fullPrompt = `
        ${prompt}
        
        If this is a document, textbook, or has text, please extract and summarize the content.
        If this is a diagram or chart, explain what it shows.
        If this is a photo, describe what you see.
      `;

      // ສົ່ງໃຫ້ Gemini Vision
      const result = await this.model.generateContent([
        fullPrompt,
        { inlineData: { data: imageBase64, mimeType: 'image/png' } }
      ]);

      const response = result.response;
      const text = response.text();

      return {
        success: true,
        description: text,
        provider: 'gemini-vision',
      };
    } catch (error) {
      console.error('Vision analysis error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to analyze image',
      };
    }
  }

  // ============================================
  // ອ່ານຂໍ້ຄວາມຈາກຮູບ (ດ້ວຍ AI ໂດຍກົງ)
  // ============================================
  async extractTextFromImageWithAI(imagePath) {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Vision Service is not configured',
      };
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const prompt = `
        Please extract all text from this image.
        If there is any text (in Lao or English), transcribe it exactly.
        If there are diagrams, charts, or formulas, describe them.
        Return the extracted content in a clear, organized format.
      `;

      const result = await this.model.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: 'image/png' } }
      ]);

      return {
        success: true,
        text: result.response.text(),
        provider: 'gemini-vision',
      };
    } catch (error) {
      console.error('AI Text extraction error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new VisionService();