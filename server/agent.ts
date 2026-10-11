import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from './db';
import { searchChunks } from './rag';
import { ChatMessage, RetrievalResult, ToolCallExecution } from '../src/types';

const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('GenAI initialization warning:', err);
  }
}

// Tool Definitions for Gemini API
export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'check_order_status',
    description: 'Fetch real-time delivery status, tracking number, carrier, and items for an order ID (e.g. ORD-9821, ORD-7742).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        order_id: {
          type: Type.STRING,
          description: 'The order identifier, usually starting with ORD- followed by 4 digits.',
        },
      },
      required: ['order_id'],
    },
  },
  {
    name: 'search_product_catalog',
    description: 'Search available hardware, specifications, pricing, inventory availability, and ratings.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Keywords to search products by, e.g. "headphones", "4k monitor", "mechanical keyboard".',
        },
        max_price: {
          type: Type.NUMBER,
          description: 'Optional maximum price budget filter in USD.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_support_ticket',
    description: 'Escalate an issue and create an official support ticket for complex or unresolved complaints.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          description: 'Brief summary of the issue.',
        },
        description: {
          type: Type.STRING,
          description: 'Detailed explanation of the customer complaint or problem.',
        },
        priority: {
          type: Type.STRING,
          description: 'Priority level: low, medium, high, or urgent.',
        },
        category: {
          type: Type.STRING,
          description: 'Category: Billing, Technical, Shipping, Returns, General.',
        },
      },
      required: ['subject', 'description'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Trigger immediate live transfer to a human customer support agent when the customer requests a person or for sensitive issues.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'Why the conversation is being escalated (e.g. explicit customer request, payment issue, frustration).',
        },
        urgency: {
          type: Type.STRING,
          description: 'Urgency level: normal, high, or critical.',
        },
      },
      required: ['reason'],
    },
  },
];

// Tool Executor Functions
export function executeTool(name: string, args: Record<string, any>, context: { session: any }): Record<string, any> {
  const { session } = context;

  switch (name) {
    case 'check_order_status': {
      const orderId = String(args.order_id || '').trim();
      const order = db.getOrder(orderId);
      if (!order) {
        return {
          found: false,
          error: `Order with ID '${orderId}' was not found in our fulfillment database. Please check the order number or ensure you are logged into the matching account.`,
        };
      }
      return {
        found: true,
        orderId: order.id,
        customerName: order.customerName,
        status: order.status,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        shippingAddress: order.shippingAddress,
        items: order.items,
        totalAmount: `$${order.totalAmount.toFixed(2)}`,
      };
    }

    case 'search_product_catalog': {
      const query = String(args.query || '');
      const maxPrice = args.max_price !== undefined ? Number(args.max_price) : undefined;
      const products = db.searchProducts(query, maxPrice);
      return {
        count: products.length,
        results: products.map((p) => ({
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: `$${p.price.toFixed(2)}`,
          inStock: p.inStock,
          stockRemaining: p.stockCount,
          rating: `${p.rating}/5.0`,
          keyFeatures: p.features,
        })),
      };
    }

    case 'create_support_ticket': {
      const ticket = db.createTicket({
        conversationId: session.id,
        customerName: session.customerName,
        customerEmail: session.customerEmail,
        subject: args.subject,
        description: args.description,
        priority: args.priority || 'medium',
        category: args.category || 'General',
      });
      return {
        success: true,
        ticketId: ticket.id,
        status: ticket.status,
        slaDeadline: ticket.slaDeadline,
        message: `Support ticket ${ticket.id} created successfully. A Tier 1 or Tier 2 specialist will follow up via ${session.customerEmail}.`,
      };
    }

    case 'escalate_to_human': {
      session.status = 'escalated';
      session.escalationReason = args.reason || 'Customer requested live human support';
      return {
        escalated: true,
        queuePosition: 1,
        reason: session.escalationReason,
        notice: 'Live transfer activated. Connecting to the next available representative in our Tier 2 Support Queue.',
      };
    }

    default:
      return { error: `Tool '${name}' is not recognized.` };
  }
}

/**
 * Intelligent Rule-Based Fallback Agent for when Gemini API key is missing or quota-limited
 */
export async function runLocalFallbackAgent(
  userQuery: string,
  history: ChatMessage[],
  session: any,
  retrievedContext: RetrievalResult[]
): Promise<{
  reply: string;
  toolCalls: ToolCallExecution[];
  isEscalated: boolean;
  escalationReason?: string;
  confidenceScore: number;
}> {
  const queryLower = userQuery.toLowerCase();
  const toolCalls: ToolCallExecution[] = [];
  let isEscalated = false;
  let escalationReason: string | undefined;

  // 1. Check for explicit escalation triggers
  const humanKeywords = ['speak to human', 'human agent', 'talk to person', 'representative', 'operator', 'real person', 'supervisor', 'manager', 'i want a person'];
  const sensitiveKeywords = ['stolen', 'fraud', 'compromised', 'lawsuit', 'attorney', 'illegal', 'chargeback'];
  
  if (humanKeywords.some((k) => queryLower.includes(k)) || sensitiveKeywords.some((k) => queryLower.includes(k))) {
    isEscalated = true;
    escalationReason = sensitiveKeywords.some((k) => queryLower.includes(k))
      ? 'High severity security or dispute trigger'
      : 'Customer requested human representative';
    
    const output = executeTool('escalate_to_human', { reason: escalationReason, urgency: 'high' }, { session });
    toolCalls.push({
      name: 'escalate_to_human',
      input: { reason: escalationReason },
      output,
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    return {
      reply: `I understand completely. I am transferring your session to our live Human Support Specialist right away. Our support team has received your chat history and will respond directly in this window shortly.`,
      toolCalls,
      isEscalated: true,
      escalationReason,
      confidenceScore: 0.98,
    };
  }

  // 2. Check for Order Tracking Intent (e.g. ORD-9821, ORD-7742)
  const orderMatch = userQuery.match(/\bORD-?\d{4}\b/i);
  if (orderMatch || queryLower.includes('order') || queryLower.includes('tracking') || queryLower.includes('package') || queryLower.includes('status')) {
    const orderId = orderMatch ? orderMatch[0].toUpperCase().replace('ORD', 'ORD-').replace('--', '-') : 'ORD-9821';
    const output = executeTool('check_order_status', { order_id: orderId }, { session });
    toolCalls.push({
      name: 'check_order_status',
      input: { order_id: orderId },
      output,
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    if (output.found) {
      return {
        reply: `Here are the tracking details for order **${output.orderId}**:\n\n- **Status:** ${output.status} 🚚\n- **Carrier:** ${output.carrier}\n- **Tracking #:** \`${output.trackingNumber}\`\n- **Estimated Delivery:** ${output.estimatedDelivery}\n- **Destination:** ${output.shippingAddress}\n- **Total Amount:** ${output.totalAmount}\n\nItems included: ${output.items.map((i: any) => `${i.name} (Qty: ${i.quantity})`).join(', ')}. Please let me know if you need to make changes to your delivery address!`,
        toolCalls,
        isEscalated: false,
        confidenceScore: 0.99,
      };
    } else {
      return {
        reply: output.error,
        toolCalls,
        isEscalated: false,
        confidenceScore: 0.85,
      };
    }
  }

  // 3. Check for Product Search Intent
  const productKeywords = ['buy', 'product', 'catalog', 'headphones', 'keyboard', 'monitor', 'display', 'charger', 'specs', 'price', 'cost', 'recommend'];
  if (productKeywords.some((k) => queryLower.includes(k))) {
    const priceMatch = userQuery.match(/under\s*\$?(\d+)/i) || userQuery.match(/\$?(\d+)\s*budget/i);
    const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;
    const output = executeTool('search_product_catalog', { query: userQuery, max_price: maxPrice }, { session });
    
    toolCalls.push({
      name: 'search_product_catalog',
      input: { query: userQuery, max_price: maxPrice },
      output,
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    if (output.count > 0) {
      const prodList = output.results
        .map(
          (p: any) =>
            `### 🎧 **${p.name}** (${p.sku})\n- **Price:** ${p.price}\n- **Availability:** ${p.inStock ? `In Stock (${p.stockRemaining} units)` : 'Out of Stock'}\n- **Rating:** ${p.rating} ⭐\n- **Highlights:** ${p.keyFeatures.join(', ')}`
        )
        .join('\n\n');

      return {
        reply: `I searched our catalog for you and found the following matches:\n\n${prodList}\n\nWould you like more technical details or help placing an order?`,
        toolCalls,
        isEscalated: false,
        confidenceScore: 0.95,
      };
    }
  }

  // 4. Grounded RAG Knowledge Retrieval
  const topDoc = retrievedContext[0];
  if (topDoc && topDoc.score >= 0.35) {
    // Generate grounded answer from retrieved context
    return {
      reply: `Based on our official company documentation (**${topDoc.chunk.docTitle}**):\n\n${topDoc.chunk.content}\n\nDoes this help answer your question, or would you like me to clarify any specifics?`,
      toolCalls,
      isEscalated: false,
      confidenceScore: topDoc.score,
    };
  }

  // 5. Out of domain / Unanswerable guardrail
  return {
    reply: `I cannot find information regarding this inquiry in our official company knowledge base. To ensure you receive accurate guidance, would you like me to open a support ticket or connect you with a human specialist?`,
    toolCalls,
    isEscalated: false,
    confidenceScore: 0.3,
  };
}

/**
 * Main Autonomous Agent Orchestrator
 */
export async function runAgentConversation(
  userQuery: string,
  session: any,
  options?: { modelName?: string }
): Promise<{
  reply: string;
  toolCalls: ToolCallExecution[];
  citations: RetrievalResult[];
  isEscalated: boolean;
  escalationReason?: string;
  confidenceScore: number;
}> {
  // 1. Retrieve Knowledge Base Chunks
  const retrievedCitations = await searchChunks(userQuery, db.chunks, 3);
  
  // Format context for prompt
  const contextText = retrievedCitations.length > 0
    ? retrievedCitations
        .map(
          (c, idx) =>
            `[Source ${idx + 1}: ${c.chunk.docTitle} (Score: ${(c.score * 100).toFixed(0)}%)]\n${c.chunk.content}`
        )
        .join('\n\n---\n\n')
    : 'No company documentation found for this query.';

  // If Gemini API is available, invoke with tool calling
  if (genAI) {
    try {
      const modelName = options?.modelName || 'gemini-3.8-flash';
      
      const systemInstruction = `You are the lead AI Customer Support Agent for TechCorp, an enterprise electronics and hardware company.
Your guidelines:
1. Ground your answers strictly in the provided RETRIEVED COMPANY KNOWLEDGE.
2. If the user asks about an order, ALWAYS call the 'check_order_status' tool.
3. If the user asks about product inventory, specs, or pricing, call the 'search_product_catalog' tool.
4. If the user wants to file a complaint or escalate an unresolved issue, call 'create_support_ticket'.
5. If the user explicitly asks for a human, expresses severe anger, or mentions fraud/theft/legal issues, immediately call 'escalate_to_human'.
6. If the required information is NOT in the retrieved context and cannot be answered by your tools, politely admit that you do not have that information in company policies instead of making up answers. Offer to connect them to a human agent.
7. Be polite, concise, professional, and helpful. Use clear markdown formatting.

RETRIEVED COMPANY KNOWLEDGE:
${contextText}`;

      // Build conversation history
      const formattedHistory = session.messages.slice(-6).map((m: ChatMessage) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // Call Gemini model
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: userQuery }] },
        ],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          temperature: 0.2,
        },
      });

      const toolCallsExecuted: ToolCallExecution[] = [];
      let isEscalated = false;
      let escalationReason: string | undefined;

      // Check if model called function(s)
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const toolOutputs: any[] = [];
        for (const call of functionCalls) {
          const callName = call.name || 'unknown_tool';
          const callArgs = (call.args || {}) as Record<string, any>;
          const toolResult = executeTool(callName, callArgs, { session });
          toolCallsExecuted.push({
            name: callName,
            input: callArgs,
            output: toolResult,
            timestamp: new Date().toISOString(),
            status: 'success',
          });

          if (callName === 'escalate_to_human') {
            isEscalated = true;
            escalationReason = typeof callArgs.reason === 'string' ? callArgs.reason : 'Customer request';
          }

          toolOutputs.push({
            name: callName,
            response: toolResult,
          });
        }

        // Send tool results back to Gemini for final user-facing response
        const secondTurn = await genAI.models.generateContent({
          model: modelName,
          contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: userQuery }] },
            {
              role: 'model',
              parts: functionCalls.map((fc) => ({
                functionCall: { name: fc.name, args: fc.args },
              })),
            },
            {
              role: 'user',
              parts: toolOutputs.map((to) => ({
                functionResponse: {
                  name: to.name,
                  response: { result: to.response },
                },
              })),
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const reply = secondTurn.text || 'I have completed that action for you.';
        return {
          reply,
          toolCalls: toolCallsExecuted,
          citations: retrievedCitations,
          isEscalated,
          escalationReason,
          confidenceScore: 0.96,
        };
      }

      // No function call was made, return standard grounded answer
      const reply = response.text || 'I am ready to help you with your inquiry.';
      const highestScore = retrievedCitations[0]?.score || 0.5;

      return {
        reply,
        toolCalls: toolCallsExecuted,
        citations: retrievedCitations,
        isEscalated: false,
        confidenceScore: highestScore,
      };
    } catch (apiError) {
      console.warn('Gemini API call encountered an issue, falling back to local reasoning engine:', apiError);
    }
  }

  // Graceful Local Fallback Agent
  const fallback = await runLocalFallbackAgent(userQuery, session.messages, session, retrievedCitations);
  return {
    reply: fallback.reply,
    toolCalls: fallback.toolCalls,
    citations: retrievedCitations,
    isEscalated: fallback.isEscalated,
    escalationReason: fallback.escalationReason,
    confidenceScore: fallback.confidenceScore,
  };
}
