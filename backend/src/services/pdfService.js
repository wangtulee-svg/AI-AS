const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PDFService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    fs.ensureDirSync(this.uploadDir);
  }

  async saveFile(file) {
    try {
      const fileId = uuidv4();
      const ext = path.extname(file.originalname);
      const filename = `${fileId}${ext}`;
      const filepath = path.join(this.uploadDir, filename);

      await fs.move(file.path, filepath, { overwrite: true });

      return {
        id: fileId,
        filename: file.originalname,
        filepath: filepath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      console.error('Save file error:', error);
      throw error;
    }
  }

  async extractText(filepath) {
    try {
      // ອ່ານໄຟລ໌ເປັນ Buffer
      const dataBuffer = fs.readFileSync(filepath);
      
      // ໃຊ້ dynamic import ສຳລັບ pdf-parse
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
      };
    } catch (error) {
      console.error('Extract text error:', error);
      throw error;
    }
  }

  async deleteFile(filepath) {
    try {
      await fs.remove(filepath);
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  getFileInfo(filepath) {
    const stats = fs.statSync(filepath);
    return {
      filename: path.basename(filepath),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }
}

module.exports = new PDFService();