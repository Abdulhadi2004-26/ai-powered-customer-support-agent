export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding?: number[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'policy' | 'shipping' | 'warranty' | 'catalog' | 'troubleshooting' | 'custom';
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  content: string;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'indexed' | 'indexing' | 'failed';
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number; // 0.0 to 1.0 similarity
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string; // e.g. "ORD-9821"
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Returned' | 'Cancelled';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  description: string;
  features: string[];
}

export interface SupportTicket {
  id: string; // e.g. "TCK-1042"
  conversationId?: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: 'Billing' | 'Technical' | 'Shipping' | 'Returns' | 'General';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
}

export interface ToolCallExecution {
  name: string;
  input: Record<string, any>;
  output: Record<string, any>;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'human_agent' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallExecution[];
  citations?: RetrievalResult[];
  confidenceScore?: number;
  isEscalated?: boolean;
  escalationReason?: string;
  evaluationId?: string;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'active' | 'escalated' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  assignedAgent?: string;
  escalationReason?: string;
  csatRating?: number; // 1-5
  csatFeedback?: string;
}

export interface LLMEvaluation {
  id: string;
  timestamp: string;
  query: string;
  retrievedContext: string[];
  response: string;
  groundedness: {
    score: number; // 1-5
    explanation: string;
  };
  relevance: {
    score: number; // 1-5
    explanation: string;
  };
  faithfulness: {
    score: number; // 1-5
    explanation: string;
  };
  taskCompletion: {
    score: number; // 1-5
    explanation: string;
  };
  averageScore: number;
  verdict: 'PASS' | 'WARN' | 'FAIL';
  latencyMs: number;
  model: string;
}

export interface AnalyticsMetrics {
  totalConversations: number;
  aiDeflectionRate: number; // e.g. 87.5%
  humanEscalationRate: number; // e.g. 12.5%
  averageCsat: number; // e.g. 4.8
  averageResponseTimeMs: number;
  openTicketsCount: number;
  activeEscalationsCount: number;
  evaluationPassRate: number;
  queryTopics: { topic: string; count: number; percentage: number }[];
  dailyVolume: { date: string; aiResolved: number; humanHandled: number }[];
}

export interface BenchmarkTestCase {
  id: string;
  name: string;
  category: 'RAG Knowledge' | 'Tool Calling' | 'Out of Domain' | 'Sensitive Escalation' | 'Edge Case';
  query: string;
  expectedBehavior: string;
}
