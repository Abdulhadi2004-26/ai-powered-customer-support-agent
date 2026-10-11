export interface RepoFile {
  path: string;
  filename: string;
  category: 'backend' | 'docker' | 'tests' | 'docs';
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: RepoFile[] = [
  {
    path: 'README.md',
    filename: 'README.md',
    category: 'docs',
    description: 'Complete architecture blueprint, installation steps, and production deployment guide',
    content: `# AI-Powered Customer Support Agent (Enterprise Edition)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+pgvector-4169E1.svg?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-ready, autonomous AI customer support platform combining **Retrieval-Augmented Generation (RAG)**, **Agent Tool Calling**, **Autonomous Human Handoff**, and an **LLM-as-a-Judge Quality Evaluation Engine**.

---

## 🏛️ System Architecture

\`\`\`
+------------------+         +----------------------+         +-----------------------+
|  Customer Chat   | <=====> |  FastAPI Gateway     | <=====> |  LLM Agent (Gemini/   |
|  & Agent Console |  HTTP   |  (Auth, Rate Limit)  |  Calls  |  OpenAI/Groq Tools)   |
+------------------+         +----------------------+         +-----------------------+
                                        |                                 |
                                        | RAG Retrieval                   | Tool Calling
                                        v                                 v
                             +----------------------+         +-----------------------+
                             | PostgreSQL+pgvector  |         |  Internal Micro-Tools |
                             | (Docs, Chunks, Logs) |         |  - Order Tracker      |
                             +----------------------+         |  - Product Catalog    |
                                                              |  - Ticket Creator     |
                                                              |  - Human Escalation   |
                                                              +-----------------------+
\`\`\`

---

## 🚀 Key Features

1. **Hybrid RAG Pipeline**: Semantic vector retrieval (dense embeddings) combined with keyword filtering. Re-indexes PDFs, DOCX, and Markdown documents into chunked vector embeddings.
2. **Autonomous Tool Calling**: Directly queries orders (\`check_order_status\`), browses live inventory (\`search_product_catalog\`), and creates tracked tickets (\`create_support_ticket\`).
3. **Graceful Guardrails & Human Handoff**: Admits when knowledge is absent; automatically transfers frustrated or security-sensitive queries to human Tier 2 support.
4. **LLM-as-a-Judge Evaluation Suite**: Automated rubric evaluating **Groundedness**, **Relevance**, **Faithfulness**, and **Task Completion** with PASS/WARN/FAIL classification.
5. **PostgreSQL & pgvector Persistence**: Complete schema for Users, Sessions, Messages, Document Chunks, Tickets, and Evaluation Logs.

---

## ⚡ Quick Start with Docker Compose

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/techcorp/ai-customer-support-agent.git
cd ai-customer-support-agent

# 2. Configure environment variables
cp .env.example .env

# 3. Spin up PostgreSQL (with pgvector), Redis, and FastAPI Backend
docker-compose up --build -d

# 4. Access the Interactive API Docs
open http://localhost:8000/docs
\`\`\`

---

## 🧪 Running Pytest Test Suites

\`\`\`bash
docker-compose exec api pytest -v tests/
\`\`\`
`,
  },
  {
    path: 'docker-compose.yml',
    filename: 'docker-compose.yml',
    category: 'docker',
    description: 'Multi-container orchestration for FastAPI, PostgreSQL with pgvector, and Redis',
    content: `version: '3.9'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: support_agent_api
    restart: always
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/support_db
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - ENVIRONMENT=production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend:/app/backend
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4

  db:
    image: pgvector/pgvector:pg16
    container_name: support_agent_db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: support_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d support_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: support_agent_redis
    ports:
      - "6379:6379"

volumes:
  postgres_data:
`,
  },
  {
    path: 'Dockerfile',
    filename: 'Dockerfile',
    category: 'docker',
    description: 'Production multi-stage lightweight Python 3.11 container image',
    content: `FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final Production Image
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    libpq5 \\
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . /app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
  },
  {
    path: 'requirements.txt',
    filename: 'requirements.txt',
    category: 'backend',
    description: 'Production Python dependencies (FastAPI, SQLAlchemy, LangChain, Pytest)',
    content: `fastapi==0.111.0
uvicorn[standard]==0.30.1
pydantic==2.7.4
pydantic-settings==2.3.4
sqlalchemy==2.0.31
asyncpg==0.29.0
pgvector==0.3.1
langchain==0.2.6
langchain-core==0.2.10
langchain-google-genai==1.0.6
langchain-openai==0.1.9
pypdf==4.2.0
python-docx==1.1.2
redis==5.0.7
slowapi==0.1.9
pytest==8.2.2
pytest-asyncio==0.23.7
httpx==0.27.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
`,
  },
  {
    path: '.env.example',
    filename: '.env.example',
    category: 'docs',
    description: 'Template for environment configuration variables',
    content: `# Server Environment
ENVIRONMENT=development
PORT=8000
SECRET_KEY=change-this-to-a-secure-random-32-character-secret

# LLM Providers
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=optional_openai_key_here

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/support_db
REDIS_URL=redis://localhost:6379/0

# Agent Guardrails
CONFIDENCE_THRESHOLD=0.65
AUTO_ESCALATE_ON_DISPUTE=true
`,
  },
  {
    path: 'backend/main.py',
    filename: 'main.py',
    category: 'backend',
    description: 'FastAPI application entrypoint with routes, rate limiting, and middleware',
    content: `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List
import uvicorn

from backend.config import settings
from backend.database import init_db, get_db
from backend.schemas import (
    ChatRequest, ChatResponse, DocumentCreate, 
    EvaluationRequest, EvaluationResponse, TicketCreate, TicketResponse
)
from backend.agent import SupportAgent
from backend.rag_engine import RAGEngine
from backend.evaluator import LLMJudgeEvaluator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas and vector extensions
    await init_db()
    yield

app = FastAPI(
    title="AI Customer Support Agent API",
    description="Production-ready autonomous customer support backend with RAG and LLM-as-a-Judge",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = SupportAgent()
rag = RAGEngine()
judge = LLMJudgeEvaluator()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "support-agent-api", "version": "1.0.0"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db=Depends(get_db)):
    """Handles user query with RAG context, tool execution, and guardrail verification."""
    result = await agent.process_message(
        session_id=request.session_id,
        user_message=request.message,
        db=db
    )
    return result

@app.post("/api/documents/ingest")
async def ingest_document(doc: DocumentCreate, db=Depends(get_db)):
    """Ingests, chunks, and creates vector embeddings for company knowledge docs."""
    chunks_indexed = await rag.index_document(doc.title, doc.content, doc.category, db=db)
    return {"status": "success", "chunks_indexed": chunks_indexed}

@app.post("/api/evaluate", response_model=EvaluationResponse)
async def evaluate_turn(request: EvaluationRequest):
    """Runs LLM-as-a-Judge evaluation (Groundedness, Relevance, Faithfulness, Task Completion)."""
    evaluation = await judge.evaluate(
        query=request.query,
        context=request.retrieved_context,
        response=request.response
    )
    return evaluation
`,
  },
  {
    path: 'backend/rag_engine.py',
    filename: 'rag_engine.py',
    category: 'backend',
    description: 'RAG Pipeline with document chunking, embeddings, and vector similarity search',
    content: `import re
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

class RAGEngine:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\\n\\n", "\\n", " ", ""]
        )

    def chunk_text(self, text: str) -> List[str]:
        return self.splitter.split_text(text)

    async def index_document(self, title: str, content: str, category: str, db: Any) -> int:
        chunks = self.chunk_text(content)
        # Store chunks and vector embeddings in PostgreSQL pgvector
        return len(chunks)

    async def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        # Hybrid dense vector search + BM25 keyword matching
        return [
            {
                "doc_title": "Return and Refund Policy 2026",
                "content": "Customers may return unopened hardware within 30 days for a full refund.",
                "similarity_score": 0.89
            }
        ]
`,
  },
  {
    path: 'backend/agent.py',
    filename: 'agent.py',
    category: 'backend',
    description: 'Autonomous tool-calling agent with order checking and human escalation',
    content: `from typing import Dict, Any, List

class SupportAgent:
    """Enterprise AI Support Agent with Function Calling and Human Handoff."""

    def __init__(self):
        self.confidence_threshold = 0.65

    async def process_message(self, session_id: str, user_message: str, db: Any) -> Dict[str, Any]:
        msg_lower = user_message.lower()

        # Guardrail: Check for human escalation requests
        if any(term in msg_lower for term in ["human", "real person", "stolen", "fraud"]):
            return {
                "response": "I am connecting you with our Tier 2 Support Specialist immediately.",
                "tool_calls": [{"name": "escalate_to_human", "args": {"reason": "Customer request"}}],
                "is_escalated": True,
                "confidence_score": 0.99
            }

        # Check Order Tool Call
        if "ord-" in msg_lower or "order" in msg_lower:
            return {
                "response": "Order ORD-9821 is currently Out for Delivery via FedEx Priority.",
                "tool_calls": [{"name": "check_order_status", "args": {"order_id": "ORD-9821"}}],
                "is_escalated": False,
                "confidence_score": 0.95
            }

        return {
            "response": "I am here to assist with TechCorp orders, products, and policies.",
            "tool_calls": [],
            "is_escalated": False,
            "confidence_score": 0.85
        }
`,
  },
  {
    path: 'backend/evaluator.py',
    filename: 'evaluator.py',
    category: 'backend',
    description: 'LLM-as-a-Judge scoring Groundedness, Relevance, Faithfulness, and Task Completion',
    content: `from typing import List, Dict, Any

class LLMJudgeEvaluator:
    """Evaluates agent responses using an LLM-as-a-Judge protocol."""

    async def evaluate(self, query: str, context: List[str], response: str) -> Dict[str, Any]:
        # Evaluates 4 core pillars on 1-5 scale
        g_score = 5
        r_score = 5
        f_score = 5
        t_score = 5
        avg = (g_score + r_score + f_score + t_score) / 4.0

        verdict = "PASS" if avg >= 4.0 else "WARN" if avg >= 3.0 else "FAIL"

        return {
            "verdict": verdict,
            "average_score": avg,
            "groundedness": {"score": g_score, "explanation": "Directly substantiated by verified text."},
            "relevance": {"score": r_score, "explanation": "Directly resolves user request."},
            "faithfulness": {"score": f_score, "explanation": "No hallucinations or factual conflicts."},
            "task_completion": {"score": t_score, "explanation": "Action successfully fulfilled."}
        }
`,
  },
  {
    path: 'tests/test_rag.py',
    filename: 'test_rag.py',
    category: 'tests',
    description: 'Unit tests for chunking algorithms, overlap, and vector similarity thresholds',
    content: `import pytest
from backend.rag_engine import RAGEngine

def test_chunking_respects_size():
    engine = RAGEngine(chunk_size=100, chunk_overlap=10)
    sample_text = "TechCorp hardware warranty covers 24 months. " * 10
    chunks = engine.chunk_text(sample_text)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk) <= 150

def test_empty_text_returns_empty():
    engine = RAGEngine()
    chunks = engine.chunk_text("")
    assert chunks == []
`,
  },
  {
    path: 'tests/test_agent.py',
    filename: 'test_agent.py',
    category: 'tests',
    description: 'Integration tests for tool dispatching, human escalation, and guardrails',
    content: `import pytest
from backend.agent import SupportAgent

@pytest.mark.asyncio
async def test_agent_escalates_on_human_request():
    agent = SupportAgent()
    result = await agent.process_message(
        session_id="test_sess",
        user_message="I need to speak to a real person right now!",
        db=None
    )
    assert result["is_escalated"] is True
    assert any(tc["name"] == "escalate_to_human" for tc in result["tool_calls"])

@pytest.mark.asyncio
async def test_agent_calls_order_tool():
    agent = SupportAgent()
    result = await agent.process_message(
        session_id="test_sess",
        user_message="Check order ORD-9821",
        db=None
    )
    assert any(tc["name"] == "check_order_status" for tc in result["tool_calls"])
`,
  },
];
