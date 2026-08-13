const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class RAGService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API Key not found. RAG will use mock mode.');
      this.isEnabled = false;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
      });
      this.isEnabled = true;
      console.log('✅ RAG Service enabled with Gemini');
    }
    
    // ໂຟລເດີສຳລັບເກັບ Vector Data
    this.vectorDir = path.join(__dirname, '../../vector_store');
    if (!fs.existsSync(this.vectorDir)) {
      fs.mkdirSync(this.vectorDir, { recursive: true });
    }
    
    // ເກັບຂໍ້ມູນໃນຄວາມຊົງຈຳ (ງ່າຍ ແລະ ໄວ)
    this.documents = {}; // { id: { text, chunks, embeddings, metadata } }
  }

  // ສ້າງ Embedding (Vector) ຈາກຂໍ້ຄວາມ
  async createEmbedding(text) {
    if (!this.isEnabled) {
      // ໃຊ້ Mock ເມື່ອບໍ່ມີ API Key
      return this.getMockEmbedding(text);
    }

    try {
      const result = await this.model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Embedding error:', error);
      return this.getMockEmbedding(text);
    }
  }

  // Mock Embedding (ສຳລັບທົດສອບ)
  getMockEmbedding(text) {
    // ສ້າງ vector ງ່າຍໆ ໂດຍອີງໃສ່ຂໍ້ຄວາມ
    const vector = new Array(128).fill(0);
    for (let i = 0; i < Math.min(text.length, 128); i++) {
      vector[i] = text.charCodeAt(i) / 255;
    }
    return vector;
  }

  // ຄຳນວນ Cosine Similarity ລະຫວ່າງ 2 vectors
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ແບ່ງຂໍ້ຄວາມເປັນ Chunks (ສຳລັບ RAG)
  chunkText(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }

  // ປະມວນຜົນ PDF ແລະ ສ້າງ Vector
  async processPDF(filePath, documentId, title) {
    try {
      console.log(`📄 Processing PDF: ${title}`);
      
      // ອ່ານ PDF
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      const text = data.text;
      
      // ແບ່ງຂໍ້ຄວາມເປັນ Chunks
      const chunks = this.chunkText(text, 500, 50);
      console.log(`📝 Split into ${chunks.length} chunks`);
      
      // ສ້າງ Embeddings ສຳລັບແຕ່ລະ Chunk
      const embeddings = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.createEmbedding(chunk);
        embeddings.push({
          text: chunk,
          embedding: embedding,
          index: i
        });
        console.log(`✅ Chunk ${i+1}/${chunks.length} processed`);
      }
      
      // ບັນທຶກໃນຄວາມຊົງຈຳ
      this.documents[documentId] = {
        id: documentId,
        title: title,
        filePath: filePath,
        fullText: text,
        chunks: chunks,
        embeddings: embeddings,
        metadata: {
          pages: data.numpages,
          size: dataBuffer.length,
          processed: new Date().toISOString()
        }
      };
      
      console.log(`✅ Document indexed: ${documentId}`);
      return {
        success: true,
        documentId: documentId,
        chunks: chunks.length,
        pages: data.numpages
      };
    } catch (error) {
      console.error('Process PDF error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ຄົ້ນຫາຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ
  async search(query, documentIds = null, topK = 5) {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      
      // ສ້າງ Embedding ຂອງຄຳຖາມ
      const queryEmbedding = await this.createEmbedding(query);
      
      // ເລືອກເອົາເອກະສານທີ່ຕ້ອງການ
      const docIds = documentIds || Object.keys(this.documents);
      if (docIds.length === 0) {
        return {
          success: true,
          results: [],
          message: 'No documents available'
        };
      }
      
      // ຄົ້ນຫາໃນແຕ່ລະເອກະສານ
      let allResults = [];
      for (const docId of docIds) {
        const doc = this.documents[docId];
        if (!doc) continue;
        
        for (const chunk of doc.embeddings) {
          const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
          allResults.push({
            documentId: docId,
            title: doc.title,
            chunk: chunk.text,
            similarity: similarity,
            index: chunk.index
          });
        }
      }
      
      // ຮຽງຕາມຄວາມຄ້າຍຄືກັນ (ຫຼາຍສຸດກ່ອນ)
      allResults.sort((a, b) => b.similarity - a.similarity);
      
      // ເອົາ Top K
      const topResults = allResults.slice(0, topK);
      
      console.log(`✅ Found ${topResults.length} relevant chunks`);
      
      return {
        success: true,
        results: topResults,
        total: allResults.length
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ຕອບຄຳຖາມໂດຍໃຊ້ RAG
  async askWithRAG(query, documentIds = null, language = 'both') {
    try {
      console.log(`🤔 Question: "${query}"`);
      
      // 1. ຄົ້ນຫາຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ
      const searchResult = await this.search(query, documentIds, 5);
      if (!searchResult.success || searchResult.results.length === 0) {
        return {
          success: true,
          answer: this.getNoContextAnswer(query),
          context: []
        };
      }
      
      // 2. ສ້າງ Context ຈາກຜົນການຄົ້ນຫາ
      const contextText = searchResult.results.map(r => 
        `[From: ${r.title}] ${r.chunk}`
      ).join('\n\n');
      
      // 3. ສົ່ງໃຫ້ AI ຕອບ
      const answer = await this.getAIAnswer(query, contextText, searchResult.results, language);
      
      return {
        success: true,
        answer: answer,
        context: searchResult.results,
        documents: searchResult.results.map(r => r.title).filter((v, i, a) => a.indexOf(v) === i)
      };
    } catch (error) {
      console.error('RAG ask error:', error);
      return {
        success: false,
        error: error.message,
        answer: 'ຂໍໂທດ, ການຕອບຄຳຖາມມີບັນຫາ. ກະລຸນາລອງໃໝ່.'
      };
    }
  }

  // ເອົາຄຳຕອບຈາກ AI
  async getAIAnswer(query, context, sources, language) {
    if (!this.isEnabled) {
      return this.getMockRAGAnswer(query, context);
    }

    try {
      const langInstruction = language === 'lao' 
        ? 'Please answer in Lao language only.'
        : language === 'english'
          ? 'Please answer in English only.'
          : 'Please answer in both Lao and English. Start with Lao, then English.';

      const prompt = `
You are a helpful university student assistant. Answer the question based on the provided context.

Context from documents:
${context}

Question: ${query}

${langInstruction}

Instructions:
1. Answer based ONLY on the provided context
2. If the context doesn't contain the answer, say so honestly
3. Cite which document the information comes from
4. Be clear, concise, and educational

Sources available: ${sources.map(s => s.title).join(', ')}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI answer error:', error);
      return this.getMockRAGAnswer(query, context);
    }
  }

  // Mock Answers
  getNoContextAnswer(query) {
    return `ຂ້ອຍບໍ່ພົບຂໍ້ມູນທີ່ກ່ຽວຂ້ອງກັບ "${query}" ໃນເອກະສານທີ່ທ່ານອັບໂຫຼດ. ກະລຸນາກວດສອບວ່າທ່ານໄດ້ອັບໂຫຼດເອກະສານທີ່ກ່ຽວຂ້ອງ ຫຼື ລອງຖາມຄຳຖາມໃໝ່.`;
  }

  getMockRAGAnswer(query, context) {
    return `📚 ຄຳຕອບຈາກ RAG (ໂໝດສາທິດ)

ຄຳຖາມ: "${query}"

ອີງຕາມເອກະສານທີ່ທ່ານອັບໂຫຼດ, ຂ້ອຍພົບຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ:

${context ? '📄 ຂໍ້ມູນທີ່ພົບ:\n' + context.substring(0, 500) + '...' : '⚠️ ບໍ່ພົບຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ'}

💡 ໝາຍເຫດ: ກຳລັງໃຊ້ໂໝດສາທິດ. 
ເພື່ອໃຊ້ RAG ແບບຈິງ, ກະລຸນາຕັ້ງຄ່າ GEMINI_API_KEY ໃນໄຟລ໌ .env.

ຄຳຕອບຈະມີຄວາມຊັດເຈນ ແລະ ຖືກຕ້ອງກວ່າເມື່ອຕັ້ງຄ່າ API Key ສຳເລັດ.`;
  }

  // ດຶງລາຍຊື່ເອກະສານທີ່ຖືກ Index
  getIndexedDocuments() {
    return Object.keys(this.documents).map(id => ({
      id: id,
      title: this.documents[id].title,
      chunks: this.documents[id].chunks.length,
      pages: this.documents[id].metadata.pages,
      processed: this.documents[id].metadata.processed
    }));
  }

  // ລຶບເອກະສານອອກຈາກ Index
  removeDocument(documentId) {
    if (this.documents[documentId]) {
      delete this.documents[documentId];
      return { success: true, message: 'Document removed from index' };
    }
    return { success: false, message: 'Document not found' };
  }
}

module.exports = new RAGService();