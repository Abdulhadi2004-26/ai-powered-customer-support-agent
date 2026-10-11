import {
  KnowledgeDocument,
  DocumentChunk,
  Order,
  Product,
  SupportTicket,
  ChatSession,
  ChatMessage,
  LLMEvaluation,
  AnalyticsMetrics,
  User,
} from '../src/types';
import {
  SEED_DOCUMENTS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_TICKETS,
  SEED_USERS,
} from '../src/data/mockData';
import { chunkDocument, generateEmbedding } from './rag';

class DatabaseStore {
  public users: Map<string, User> = new Map();
  public documents: Map<string, KnowledgeDocument> = new Map();
  public chunks: DocumentChunk[] = [];
  public orders: Map<string, Order> = new Map();
  public products: Map<string, Product> = new Map();
  public tickets: Map<string, SupportTicket> = new Map();
  public sessions: Map<string, ChatSession> = new Map();
  public evaluations: LLMEvaluation[] = [];

  constructor() {
    this.seed();
  }

  public async seed() {
    // Seed Users
    for (const u of SEED_USERS) {
      this.users.set(u.id, u);
    }

    // Seed Orders
    for (const ord of SEED_ORDERS) {
      this.orders.set(ord.id.toUpperCase(), ord);
    }

    // Seed Products
    for (const p of SEED_PRODUCTS) {
      this.products.set(p.sku.toUpperCase(), p);
    }

    // Seed Tickets
    for (const t of SEED_TICKETS) {
      this.tickets.set(t.id, t);
    }

    // Seed Documents and Chunks
    for (const docData of SEED_DOCUMENTS) {
      const generatedChunks = chunkDocument(docData, 450, 60);
      
      // Calculate embeddings for chunks
      for (const chk of generatedChunks) {
        chk.embedding = await generateEmbedding(chk.content);
        this.chunks.push(chk);
      }

      const fullDoc: KnowledgeDocument = {
        ...docData,
        chunksCount: generatedChunks.length,
      };
      this.documents.set(fullDoc.id, fullDoc);
    }

    // Seed initial demo session
    const demoSessionId = 'sess_demo_1';
    this.sessions.set(demoSessionId, {
      id: demoSessionId,
      customerId: 'usr_customer_1',
      customerName: 'Alice Johnson',
      customerEmail: 'alice.johnson@example.com',
      status: 'active',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_1',
          sender: 'assistant',
          content: 'Hello Alice! I am your TechCorp AI Support Assistant. I can help you check orders, find products, answer warranty and return questions, or connect you with our human specialists. How can I help you today?',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          confidenceScore: 1.0,
        },
      ],
    });

    console.log(`[DatabaseStore] Seeded ${this.documents.size} documents, ${this.chunks.length} chunks, ${this.orders.size} orders, and ${this.tickets.size} tickets.`);
  }

  // Document management
  public async addDocument(
    title: string,
    category: KnowledgeDocument['category'],
    fileType: KnowledgeDocument['fileType'],
    content: string
  ): Promise<KnowledgeDocument> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: KnowledgeDocument = {
      id,
      title,
      category,
      fileType,
      content,
      chunksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'indexing',
    };

    const newChunks = chunkDocument({ id, title, content }, 450, 60);
    for (const chk of newChunks) {
      chk.embedding = await generateEmbedding(chk.content);
      this.chunks.push(chk);
    }

    newDoc.chunksCount = newChunks.length;
    newDoc.status = 'indexed';
    this.documents.set(id, newDoc);
    return newDoc;
  }

  public deleteDocument(id: string): boolean {
    if (!this.documents.has(id)) return false;
    this.documents.delete(id);
    this.chunks = this.chunks.filter((c) => c.docId !== id);
    return true;
  }

  // Order management
  public getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId.trim().toUpperCase());
  }

  // Product catalog
  public searchProducts(query: string, maxPrice?: number): Product[] {
    const qLower = query.toLowerCase().trim();
    const all = Array.from(this.products.values());
    return all.filter((p) => {
      const matchText =
        !qLower ||
        p.name.toLowerCase().includes(qLower) ||
        p.sku.toLowerCase().includes(qLower) ||
        p.category.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower);
      const matchPrice = maxPrice === undefined || p.price <= maxPrice;
      return matchText && matchPrice;
    });
  }

  // Ticket management
  public createTicket(data: {
    conversationId?: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    description: string;
    category?: SupportTicket['category'];
    priority?: SupportTicket['priority'];
  }): SupportTicket {
    const nextNum = 1050 + this.tickets.size;
    const ticketId = `TCK-${nextNum}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      conversationId: data.conversationId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      subject: data.subject,
      description: data.description,
      category: data.category || 'General',
      priority: data.priority || 'medium',
      status: 'Open',
      assignedAgent: 'Unassigned (Tier 1)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
    };
    this.tickets.set(ticketId, newTicket);
    return newTicket;
  }

  public updateTicketStatus(
    id: string,
    status: SupportTicket['status'],
    assignedAgent?: string
  ): SupportTicket | null {
    const t = this.tickets.get(id);
    if (!t) return null;
    t.status = status;
    if (assignedAgent) t.assignedAgent = assignedAgent;
    t.updatedAt = new Date().toISOString();
    return t;
  }

  // Session management
  public getOrCreateSession(customerId: string, name: string, email: string): ChatSession {
    // Check if customer already has an active session
    for (const sess of this.sessions.values()) {
      if (sess.customerId === customerId && sess.status !== 'closed') {
        return sess;
      }
    }
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const session: ChatSession = {
      id: newId,
      customerId,
      customerName: name,
      customerEmail: email,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'assistant',
          content: `Hello ${name}! Welcome to TechCorp Customer Care. I am your autonomous AI assistant. How can I assist you today?`,
          timestamp: new Date().toISOString(),
          confidenceScore: 1.0,
        },
      ],
    };
    this.sessions.set(newId, session);
    return session;
  }

  // Escalations queue
  public getActiveEscalations(): ChatSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'escalated');
  }

  // Analytics Metrics Calculation
  public getAnalytics(): AnalyticsMetrics {
    const allSessions = Array.from(this.sessions.values());
    const totalSessions = Math.max(1, allSessions.length + 142); // Combined with simulated historical baseline
    const escalatedSessions = allSessions.filter((s) => s.status === 'escalated').length + 18;
    const aiDeflectionRate = parseFloat((((totalSessions - escalatedSessions) / totalSessions) * 100).toFixed(1));
    const humanEscalationRate = parseFloat(((escalatedSessions / totalSessions) * 100).toFixed(1));

    const totalEvals = this.evaluations.length;
    const passedEvals = this.evaluations.filter((e) => e.verdict === 'PASS').length;
    const evalPassRate = totalEvals > 0 ? parseFloat(((passedEvals / totalEvals) * 100).toFixed(1)) : 94.2;

    const openTickets = Array.from(this.tickets.values()).filter(
      (t) => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Escalated'
    ).length;

    return {
      totalConversations: totalSessions,
      aiDeflectionRate,
      humanEscalationRate,
      averageCsat: 4.82,
      averageResponseTimeMs: 460,
      openTicketsCount: openTickets,
      activeEscalationsCount: this.getActiveEscalations().length,
      evaluationPassRate: evalPassRate,
      queryTopics: [
        { topic: 'Order Tracking & Delivery', count: 68, percentage: 42 },
        { topic: 'Returns & Refund Requests', count: 41, percentage: 25 },
        { topic: 'Hardware Warranty & Specs', count: 32, percentage: 20 },
        { topic: 'Account & Billing Inquiries', count: 21, percentage: 13 },
      ],
      dailyVolume: [
        { date: 'Mon', aiResolved: 28, humanHandled: 4 },
        { date: 'Tue', aiResolved: 35, humanHandled: 3 },
        { date: 'Wed', aiResolved: 42, humanHandled: 5 },
        { date: 'Thu', aiResolved: 39, humanHandled: 6 },
        { date: 'Fri', aiResolved: 45, humanHandled: 4 },
        { date: 'Sat', aiResolved: 31, humanHandled: 2 },
        { date: 'Sun', aiResolved: 24, humanHandled: 3 },
      ],
    };
  }
}

export const db = new DatabaseStore();
