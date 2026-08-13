// backend/src/__tests__/services/aiService.test.js

const aiService = require('../../services/aiService');

describe('AIService', () => {
  describe('chat', () => {
    it('should return a chat response', async () => {
      const result = await aiService.chat('Hello');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('provider');
    });

    it('should handle empty message', async () => {
      const result = await aiService.chat('');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error');
    });
  });

  describe('generateQuiz', () => {
    it('should generate quiz questions', async () => {
      const result = await aiService.generateQuiz('Machine Learning', 'medium', 5);
      
      expect(result.success).toBe(true);
      expect(result.questions).toBeInstanceOf(Array);
      expect(result.totalQuestions).toBeGreaterThan(0);
    });

    it('should handle invalid topic', async () => {
      const result = await aiService.generateQuiz('', 'medium', 5);
      
      expect(result.success).toBe(false);
      expect(result.questions).toEqual([]);
    });
  });
});