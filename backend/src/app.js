// backend/src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const prisma = require('./lib/prisma');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger'); // ✅ ເພີ່ມ
const { sanitizeInput } = require('./middleware/validate'); // ✅ ເພີ່ມ

const app = express();
const chatRoutes = require('./routes/chat');
const pdfRoutes = require('./routes/pdf');
const ragRoutes = require('./routes/rag');
const subjectRoutes = require('./routes/subjects');
const quizRoutes = require('./routes/quizzes');
const adminRoutes = require('./routes/admin');
const studyPlannerRoutes = require('./routes/studyPlanner');
const timetableRoutes = require('./routes/timetable');
const notificationRoutes = require('./routes/notifications');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analytics');
const studentRoutes = require('./routes/student');

// ============================================
// Security Middleware
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // ອະນຸຍາດ requests ທີ່ບໍ່ມີ origin (ເຊັ່ນ: mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Total-Pages'],
  maxAge: 86400, // 24 ຊົ່ວໂມງ
}));

// ============================================
// Rate Limiting (ປັບປຸງ)
// ============================================
// Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 ນາທີ
  max: 100, // 100 ຄຳຮ້ອງຂໍຕໍ່ IP
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter ສຳລັບ API ທີ່ສຳຄັນ
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ຊົ່ວໂມງ
  max: 20, // 20 ຄຳຮ້ອງຂໍ
  message: {
    success: false,
    message: 'Too many requests for this endpoint. Please try again later.',
  },
});

// AI limiter ສຳລັບ AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ຊົ່ວໂມງ
  max: 10, // 10 ຄຳຮ້ອງຂໍ
  message: {
    success: false,
    message: 'AI request limit exceeded. Please try again later.',
  },
});

// ນຳໃຊ້ Rate Limiting
app.use('/api', globalLimiter);
app.use('/api/chat/send', strictLimiter);
app.use('/api/quiz/generate', aiLimiter);
app.use('/api/study-planner/ai/generate', aiLimiter);
app.use('/api/files/upload', strictLimiter);
app.use('/api/rag/ask', aiLimiter);

// ============================================
// Body Parsing
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Sanitize Input (ປ້ອງກັນ XSS)
// ============================================
app.use(sanitizeInput);

// ============================================
// Compression
// ============================================
app.use(compression({
  level: 6, // ລະດັບການບີບອັດ
  threshold: 1024, // ບີບອັດສຳລັບຂະໜາດ > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// ============================================
// Logging
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Logger (Winston)
app.use(logger.requestLogger);

// ============================================
// Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/study-planner', studyPlannerRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/student', studentRoutes);

// ============================================
// Health Check
// ============================================
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'Degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
  });
});

// ============================================
// Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📊 API available at: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  logger.info('✅ Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  logger.info('✅ Database disconnected');
  process.exit(0);
});

// ============================================
// Uncaught Exception Handler
// ============================================
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // ໃນ production, ສາມາດ restart server
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

module.exports = app;