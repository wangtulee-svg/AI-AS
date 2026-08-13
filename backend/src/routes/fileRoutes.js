// backend/src/routes/fileRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/auth');

// ຕັ້ງຄ່າ Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/tiff',
      'image/bmp',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF or Image.'), false);
    }
  },
});

// Routes
router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);
router.post('/ask', authMiddleware, fileController.askFile);
router.post('/analyze-image', authMiddleware, fileController.analyzeImage);
router.get('/list', authMiddleware, fileController.getFiles);
router.delete('/:fileId', authMiddleware, fileController.deleteFile);

module.exports = router;