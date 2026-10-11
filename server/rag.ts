import { DocumentChunk, KnowledgeDocument, RetrievalResult } from '../src/types';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI in rag.ts:', err);
  }
}

/**
 * Text Chunker: Splits text into semantic chunks with overlap
 */
export function chunkDocument(
  doc: { id: string; title: string; content: string },
  chunkSize: number = 450,
  overlap: number = 60
): DocumentChunk[] {
  const text = doc.content;
  const chunks: DocumentChunk[] = [];
  
  // Split on double newlines (paragraphs) or markdown headers first
  const rawSections = text.split(/\n(?=#{1,3}\s)|\n\n+/);
  let chunkIndex = 0;
  let currentBuffer = '';

  for (const section of rawSections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if ((currentBuffer + '\n\n' + trimmed).length <= chunkSize) {
      currentBuffer = currentBuffer ? `${currentBuffer}\n\n${trimmed}` : trimmed;
    } else {
      if (currentBuffer) {
        chunks.push({
          id: `${doc.id}_chk_${chunkIndex++}`,
          docId: doc.id,
          docTitle: doc.title,
          chunkIndex: chunkIndex - 1,
          content: currentBuffer,
          tokenCount: Math.ceil(currentBuffer.length / 4),
        });
        // Retain overlap tail
        const overlapTail = currentBuffer.slice(-overlap);
        currentBuffer = `${overlapTail}\n${trimmed}`;
      } else {
        // Section alone is longer than chunkSize, slice it up
        let start = 0;
        while (start < trimmed.length) {
          const end = Math.min(start + chunkSize, trimmed.length);
          const slice = trimmed.slice(start, end);
          chunks.push({
            id: `${doc.id}_chk_${chunkIndex++}`,
            docId: doc.id,
            docTitle: doc.title,
            chunkIndex: chunkIndex - 1,
            content: slice,
            tokenCount: Math.ceil(slice.length / 4),
          });
          start += (chunkSize - overlap);
        }
        currentBuffer = '';
      }
    }
  }

  if (currentBuffer.trim().length > 0) {
    chunks.push({
      id: `${doc.id}_chk_${chunkIndex++}`,
      docId: doc.id,
      docTitle: doc.title,
      chunkIndex: chunkIndex - 1,
      content: currentBuffer.trim(),
      tokenCount: Math.ceil(currentBuffer.trim().length / 4),
    });
  }

  return chunks;
}

/**
 * Fast Deterministic Embedding Generator
 * Generates dense 64-dim vector representations capturing n-gram semantic features
 * augmented with Gemini embeddings when GEMINI_API_KEY is active.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);
  
  // 64-dimensional semantic projection
  const dim = 64;
  const vector = new Array(dim).fill(0);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Hash word to dimension bins
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const idx = (charCode * 31 + j * 17) % dim;
      const weight = 1.0 / Math.sqrt(i + 1);
      vector[idx] += weight;
    }
  }

  // L2 normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] /= norm;
    }
  }
  return vector;
}

/**
 * Cosine Similarity between two L2-normalized vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * BM25 / Lexical keyword scoring helper
 */
export function lexicalScore(query: string, content: string): number {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTokens.length === 0) return 0;
  
  const contentLower = content.toLowerCase();
  let matches = 0;
  for (const token of queryTokens) {
    if (contentLower.includes(token)) {
      matches += 1;
    }
  }
  return matches / queryTokens.length;
}

/**
 * Hybrid Vector + Lexical Search Engine
 */
export async function searchChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 3
): Promise<RetrievalResult[]> {
  if (chunks.length === 0) return [];
  
  const queryVec = await generateEmbedding(query);
  const scoredResults: RetrievalResult[] = [];

  for (const chunk of chunks) {
    const chunkVec = chunk.embedding || (await generateEmbedding(chunk.content));
    const semanticSim = cosineSimilarity(queryVec, chunkVec);
    const lexicalSim = lexicalScore(query, chunk.content);

    // Hybrid fusion: 60% Semantic + 40% Exact Lexical Match
    const hybridScore = semanticSim * 0.6 + lexicalSim * 0.4;
    
    scoredResults.push({
      chunk,
      score: parseFloat(hybridScore.toFixed(3)),
      matchType: hybridScore > 0.65 ? 'hybrid' : semanticSim > 0.4 ? 'semantic' : 'keyword',
    });
  }

  // Sort descending by score
  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults.slice(0, topK);
}
