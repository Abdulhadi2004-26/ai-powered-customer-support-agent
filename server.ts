import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db';
import { runAgentConversation } from './server/agent';
import { searchChunks } from './server/rag';
import { evaluateResponseWithJudge } from './server/evaluator';
import { BENCHMARK_TEST_SUITE } from './src/data/mockData';
import { PYTHON_PROJECT_FILES } from './server/pythonRepo';
import { ChatMessage } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// ==========================================
// API ROUTES
// ==========================================

// Auth & Users
app.get('/api/users', (req, res) => {
  res.json({ users: Array.from(db.users.values()) });
});

// Chat Sessions & Conversation
app.get('/api/chat/session', (req, res) => {
  const customerId = (req.query.customerId as string) || 'usr_customer_1';
  const user = db.users.get(customerId) || {
    id: customerId,
    name: 'Customer',
    email: 'customer@example.com',
    role: 'customer' as const,
    avatar: '',
  };
  const session = db.getOrCreateSession(user.id, user.name, user.email);
  res.json({ session });
});

app.post('/api/chat/reset', (req, res) => {
  const { customerId } = req.body;
  const user = db.users.get(customerId || 'usr_customer_1');
  if (user) {
    // Delete existing session and create fresh one
    for (const [id, s] of db.sessions.entries()) {
      if (s.customerId === user.id) {
        db.sessions.delete(id);
      }
    }
    const freshSession = db.getOrCreateSession(user.id, user.name, user.email);
    res.json({ success: true, session: freshSession });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, content, customerId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    let session = db.sessions.get(sessionId);
    if (!session) {
      const user = db.users.get(customerId || 'usr_customer_1');
      session = db.getOrCreateSession(
        user ? user.id : 'usr_customer_1',
        user ? user.name : 'Customer',
        user ? user.email : 'customer@example.com'
      );
    }

    // Append User message
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user' as const,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMsg);
    session.updatedAt = new Date().toISOString();

    // Run AI Agent Orchestration (RAG + Tools + Guardrails)
    const agentResult = await runAgentConversation(content.trim(), session);

    // Save Assistant Message
    const assistantMsg: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant' as const,
      content: agentResult.reply,
      timestamp: new Date().toISOString(),
      toolCalls: agentResult.toolCalls,
      citations: agentResult.citations,
      confidenceScore: agentResult.confidenceScore,
      isEscalated: agentResult.isEscalated,
      escalationReason: agentResult.escalationReason,
    };
    session.messages.push(assistantMsg);

    // Run Judge Evaluation asynchronously/in-line for audit log
    const contextSnippets = agentResult.citations.map(
      (c) => `[${c.chunk.docTitle}]: ${c.chunk.content}`
    );
    const evaluation = await evaluateResponseWithJudge(
      content.trim(),
      contextSnippets,
      agentResult.reply
    );
    assistantMsg.evaluationId = evaluation.id;

    res.json({
      session,
      message: assistantMsg,
      evaluation,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Internal agent error' });
  }
});

// Human Agent Hand-off and Takeover
app.get('/api/escalations', (req, res) => {
  res.json({ escalations: db.getActiveEscalations() });
});

app.post('/api/escalations/reply', (req, res) => {
  const { sessionId, content, agentName } = req.body;
  const session = db.sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const humanMsg = {
    id: `msg_h_${Date.now()}`,
    sender: 'human_agent' as const,
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };
  session.messages.push(humanMsg);
  session.assignedAgent = agentName || 'Marcus Chen (Tier 2)';
  session.updatedAt = new Date().toISOString();

  res.json({ success: true, session, message: humanMsg });
});

app.post('/api/escalations/resolve', (req, res) => {
  const { sessionId } = req.body;
  const session = db.sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.status = 'resolved';
  session.updatedAt = new Date().toISOString();

  // Add system closing note
  session.messages.push({
    id: `msg_sys_${Date.now()}`,
    sender: 'system',
    content: 'This support inquiry has been marked as resolved by the human specialist.',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, session });
});

// RAG Documents Management
app.get('/api/documents', (req, res) => {
  res.json({
    documents: Array.from(db.documents.values()),
    totalChunks: db.chunks.length,
  });
});

app.post('/api/documents', async (req, res) => {
  try {
    const { title, category, fileType, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const newDoc = await db.addDocument(
      title,
      category || 'custom',
      fileType || 'txt',
      content
    );
    res.json({ success: true, document: newDoc, totalChunks: db.chunks.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/documents/:id', (req, res) => {
  const deleted = db.deleteDocument(req.params.id);
  res.json({ success: deleted, totalChunks: db.chunks.length });
});

app.post('/api/rag/test-search', async (req, res) => {
  const { query, topK } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  const results = await searchChunks(query, db.chunks, topK || 4);
  res.json({ query, results });
});

// Orders & Catalog
app.get('/api/orders', (req, res) => {
  res.json({ orders: Array.from(db.orders.values()) });
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

app.get('/api/products', (req, res) => {
  const query = (req.query.q as string) || '';
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const products = db.searchProducts(query, maxPrice);
  res.json({ products });
});

// Support Tickets
app.get('/api/tickets', (req, res) => {
  res.json({ tickets: Array.from(db.tickets.values()) });
});

app.post('/api/tickets', (req, res) => {
  const ticket = db.createTicket(req.body);
  res.json({ ticket });
});

app.patch('/api/tickets/:id', (req, res) => {
  const { status, assignedAgent } = req.body;
  const updated = db.updateTicketStatus(req.params.id, status, assignedAgent);
  if (!updated) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket: updated });
});

// LLM-as-a-Judge Evaluations
app.get('/api/evaluations', (req, res) => {
  res.json({ evaluations: db.evaluations });
});

app.post('/api/evaluations/run', async (req, res) => {
  const { query, retrievedContext, response } = req.body;
  if (!query || !response) {
    return res.status(400).json({ error: 'Query and response are required' });
  }
  const evaluation = await evaluateResponseWithJudge(
    query,
    retrievedContext || [],
    response
  );
  res.json({ evaluation });
});

app.post('/api/evaluations/batch-benchmark', async (req, res) => {
  try {
    const results = [];
    for (const testCase of BENCHMARK_TEST_SUITE) {
      const dummySession = {
        id: `sess_bench_${Date.now()}`,
        customerName: 'Benchmark Tester',
        customerEmail: 'tester@internal.bench',
        messages: [],
      };
      const agentRes = await runAgentConversation(testCase.query, dummySession);
      const context = agentRes.citations.map((c) => c.chunk.content);
      const evalRes = await evaluateResponseWithJudge(
        testCase.query,
        context,
        agentRes.reply
      );
      results.push({
        testCase,
        agentResponse: agentRes.reply,
        evaluation: evalRes,
      });
    }
    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Operations & Analytics
app.get('/api/analytics', (req, res) => {
  res.json({ metrics: db.getAnalytics() });
});

// Python Codebase Artifacts API
app.get('/api/python-codebase', (req, res) => {
  res.json({ files: PYTHON_PROJECT_FILES });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Customer Support Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
