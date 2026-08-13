// backend/src/__tests__/api/quiz.test.js

const request = require('supertest');
const app = require('../../app');

describe('Quiz API', () => {
  let authToken = '';

  beforeAll(async () => {
    // Login ເພື່ອໃຫ້ໄດ້ Token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456',
      });
    authToken = response.body.data.token;
  });

  describe('POST /api/quizzes/generate', () => {
    it('should generate quiz with valid topic', async () => {
      const response = await request(app)
        .post('/api/quizzes/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          topic: 'Machine Learning',
          difficulty: 'medium',
          numQuestions: 3,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toBeInstanceOf(Array);
    });

    it('should return error without topic', async () => {
      const response = await request(app)
        .post('/api/quizzes/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          difficulty: 'medium',
          numQuestions: 3,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});