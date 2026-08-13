// backend/src/__tests__/setup.js

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = 5001;
process.env.DATABASE_URL = 'mysql://root:test@localhost:3306/test_db';

// ✅ ແກ້ໄຂ path ໃຫ້ຖືກຕ້ອງ
// ຈາກ '../../services/aiService' ເປັນ '../services/aiService'
jest.mock('../../services/aiService', () => ({
  chat: jest.fn().mockResolvedValue({
    success: true,
    message: 'Mock AI response',
    provider: 'test',
    usage: { total_tokens: 10 },
  }),
  generateQuiz: jest.fn().mockResolvedValue({
    success: true,
    questions: [
      {
        question: 'What is Machine Learning?',
        options: ['A. AI', 'B. Database', 'C. Programming', 'D. Network'],
        correct_answer: 'A',
        explanation: 'Machine Learning is a branch of AI',
      },
    ],
    totalQuestions: 1,
  }),
  generateStudyPlan: jest.fn().mockResolvedValue({
    success: true,
    plan: [
      {
        day: 1,
        date: '2024-01-01',
        tasks: [
          {
            subject: 'Test Subject',
            topic: 'Test Topic',
            duration: 60,
            startTime: '09:00',
            endTime: '10:00',
            priority: 'high',
          },
        ],
      },
    ],
    days: 1,
    totalTasks: 1,
  }),
}));

// ✅ ແກ້ໄຂ path ສຳລັບ Prisma
jest.mock('../../lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  quiz: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  question: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  quizAttempt: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  studyPlan: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  studyTask: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  fileUpload: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  enrollment: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  document: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  chatMessage: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  pdfDocument: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

global.mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  quiz: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};