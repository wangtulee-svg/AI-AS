// backend/src/__tests__/services/fileService.test.js

const fileService = require('../../services/fileService');
const fs = require('fs');

// Mock fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('FileService', () => {
  const mockFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test'),
  };

  describe('processFile', () => {
    it('should process PDF file', async () => {
      const result = await fileService.processFile(mockFile, 'user-id');
      
      expect(result.success).toBe(true);
      expect(result.fileType).toBe('pdf');
      expect(result.fileId).toBeDefined();
    });

    it('should handle unsupported file type', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'video/mp4',
      };
      
      await expect(fileService.processFile(invalidFile, 'user-id'))
        .rejects
        .toThrow('Unsupported file type');
    });
  });
});