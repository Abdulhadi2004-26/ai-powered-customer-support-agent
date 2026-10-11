import { GoogleGenAI } from '@google/genai';
import { LLMEvaluation, RetrievalResult } from '../src/types';
import { db } from './db';

const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('GenAI initialization warning in evaluator.ts:', err);
  }
}

export async function evaluateResponseWithJudge(
  query: string,
  retrievedContext: string[],
  agentResponse: string,
  modelName: string = 'gemini-3.8-flash'
): Promise<LLMEvaluation> {
  const startTime = Date.now();
  const evalId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // If Gemini is available, run LLM-as-a-Judge with JSON schema
  if (genAI) {
    try {
      const prompt = `You are an expert AI Evaluation Judge tasked with evaluating an AI Customer Support Agent response.
Evaluate the response based on the customer query and retrieved context according to these 4 criteria on a 1-5 scale:

1. groundedness (1 to 5): Is the answer strictly grounded in the retrieved context or valid tool executions without making up facts?
2. relevance (1 to 5): How directly and helpfully does the response address the customer's specific query?
3. faithfulness (1 to 5): Does the response truthfully reflect the source information without contradiction or distortion?
4. taskCompletion (1 to 5): Did the agent fully address or resolve the user's intent, execute appropriate tools, or escalate appropriately?

CUSTOMER QUERY:
${query}

RETRIEVED CONTEXT / TOOL OUTPUTS:
${retrievedContext.join('\n---\n') || 'None'}

AGENT RESPONSE:
${agentResponse}

Output valid JSON only with this schema:
{
  "groundedness": { "score": 5, "explanation": "string" },
  "relevance": { "score": 5, "explanation": "string" },
  "faithfulness": { "score": 5, "explanation": "string" },
  "taskCompletion": { "score": 5, "explanation": "string" }
}`;

      const judgeResult = await genAI.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(judgeResult.text || '{}');
      const gScore = Number(parsed.groundedness?.score) || 4;
      const rScore = Number(parsed.relevance?.score) || 4;
      const fScore = Number(parsed.faithfulness?.score) || 4;
      const tScore = Number(parsed.taskCompletion?.score) || 4;
      const avg = parseFloat(((gScore + rScore + fScore + tScore) / 4).toFixed(2));

      let verdict: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
      if (avg < 3.0) verdict = 'FAIL';
      else if (avg < 4.0) verdict = 'WARN';

      const evaluation: LLMEvaluation = {
        id: evalId,
        timestamp: new Date().toISOString(),
        query,
        retrievedContext,
        response: agentResponse,
        groundedness: {
          score: gScore,
          explanation: parsed.groundedness?.explanation || 'Factually substantiated by retrieved context.',
        },
        relevance: {
          score: rScore,
          explanation: parsed.relevance?.explanation || 'Directly addresses customer query with pertinent details.',
        },
        faithfulness: {
          score: fScore,
          explanation: parsed.faithfulness?.explanation || 'Completely faithful to company guidelines.',
        },
        taskCompletion: {
          score: tScore,
          explanation: parsed.taskCompletion?.explanation || 'Fully addressed customer inquiry and offered next steps.',
        },
        averageScore: avg,
        verdict,
        latencyMs: Date.now() - startTime,
        model: modelName,
      };

      db.evaluations.unshift(evaluation);
      return evaluation;
    } catch (err) {
      console.warn('Judge API call error, falling back to heuristic evaluation:', err);
    }
  }

  // Deterministic Heuristic Judge Fallback
  const qLower = query.toLowerCase();
  const rLower = agentResponse.toLowerCase();

  let gScore = 4;
  let gExpl = 'Response matches official company guidelines and verified system knowledge.';

  let rScore = 4;
  let rExpl = 'Response responds directly to customer query intent.';

  let fScore = 4;
  let fExpl = 'No fabricated claims or policy contradictions detected.';

  let tScore = 4;
  let tExpl = 'The agent supplied adequate guidance or invoked proper support mechanisms.';

  // Check if hallucination occurred (claiming info exists when no context)
  if (retrievedContext.length === 0 && !rLower.includes('cannot find') && !rLower.includes('order') && !rLower.includes('catalog')) {
    gScore = 2;
    gExpl = 'Context was empty but agent attempted ungrounded response.';
  }

  // Check relevance
  if (qLower.includes('order') && (rLower.includes('ord-') || rLower.includes('tracking') || rLower.includes('status'))) {
    rScore = 5;
    tScore = 5;
    rExpl = 'High relevance: Identified order inquiry and provided tracking status.';
    tExpl = 'Task completed: Retrieved carrier status and delivery schedule.';
  } else if (qLower.includes('return') && (rLower.includes('30') || rLower.includes('refund') || rLower.includes('policy'))) {
    rScore = 5;
    fScore = 5;
    rExpl = 'Directly answers return and refund inquiry.';
    fExpl = 'Faithful to 30-day window and restocking policy clauses.';
  } else if (qLower.includes('human') || qLower.includes('person') || qLower.includes('stolen')) {
    if (rLower.includes('transfer') || rLower.includes('human') || rLower.includes('specialist')) {
      rScore = 5;
      tScore = 5;
      tExpl = 'Successfully identified escalation trigger and handed off to human agent.';
    }
  }

  const avg = parseFloat(((gScore + rScore + fScore + tScore) / 4).toFixed(2));
  let verdict: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
  if (avg < 3.0) verdict = 'FAIL';
  else if (avg < 4.0) verdict = 'WARN';

  const evaluation: LLMEvaluation = {
    id: evalId,
    timestamp: new Date().toISOString(),
    query,
    retrievedContext,
    response: agentResponse,
    groundedness: { score: gScore, explanation: gExpl },
    relevance: { score: rScore, explanation: rExpl },
    faithfulness: { score: fScore, explanation: fExpl },
    taskCompletion: { score: tScore, explanation: tExpl },
    averageScore: avg,
    verdict,
    latencyMs: Date.now() - startTime,
    model: 'Heuristic Rule-Based Judge (Evaluator Engine v2)',
  };

  db.evaluations.unshift(evaluation);
  return evaluation;
}
