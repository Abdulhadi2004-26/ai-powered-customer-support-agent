import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  FileText,
  Layers,
  Database,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Sliders,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import { KnowledgeDocument, RetrievalResult } from '../types';

export const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Doc Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeDocument['category']>('policy');
  const [newFileType, setNewFileType] = useState<KnowledgeDocument['fileType']>('txt');
  const [newContent, setNewContent] = useState('');
  const [savingDoc, setSavingDoc] = useState(false);

  // Search Playground
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RetrievalResult[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
      setTotalChunks(data.totalChunks || 0);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || savingDoc) return;
    setSavingDoc(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          fileType: newFileType,
          content: newContent.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTitle('');
        setNewContent('');
        fetchDocs();
      }
    } catch (err) {
      console.error('Failed to create doc:', err);
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and remove its chunks from the vector database?')) return;
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      fetchDocs();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;
    setSearching(true);

    try {
      const res = await fetch('/api/rag/test-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), topK: 3 }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>RAG Knowledge Base & Ingestion Pipeline</span>
              <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                Hybrid Retrieval
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Chunking • Vector Embeddings (Gemini) • Cosine Similarity • BM25 Lexical Keyword Matching
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            Total Vector Chunks:{' '}
            <strong className="text-cyan-400">{totalChunks} Chunks</strong>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Document</span>
          </button>
        </div>
      </div>

      {/* Two-Column Layout: Documents on Left, Search Tester on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Document Ingestion & Storage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Indexed Company Documents ({documents.length})</span>
            </h2>
            <button
              onClick={fetchDocs}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm">{doc.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.fileType}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Indexed into <strong className="text-cyan-300">{doc.chunksCount} chunks</strong> • Last updated{' '}
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                    title="Delete document and re-index vector store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Snippet preview */}
                <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 font-mono line-clamp-3">
                  {doc.content.slice(0, 220)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vector Retrieval Tester Playground */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Semantic & Hybrid Search Tester</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Test queries against the active vector database to inspect chunk rankings, cosine similarity scores, and keyword match quality before agent invocation.
            </p>

            <form onSubmit={handleTestSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Can I return opened headphones?"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <span>{searching ? 'Computing Similarity...' : 'Execute Vector Search'}</span>
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Results Display */}
            {searchResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Top Retrieved Chunks:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Ranked by Cosine Similarity</span>
                </div>

                <div className="space-y-2.5">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-300 truncate max-w-[200px]">
                          {res.chunk.docTitle}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {res.matchType}
                          </span>
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                              res.score >= 0.7
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {(res.score * 100).toFixed(1)}% Sim
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-300 italic text-[11.5px] leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        "{res.chunk.content}"
                      </p>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Chunk #{res.chunk.chunkIndex}</span>
                        <span>{res.chunk.tokenCount} estimated tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Ingest New Document */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-cyan-400" />
                <span>Ingest Document into Vector Store</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. International Shipping & Customs Policy"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-white outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="policy">Policy & Returns</option>
                    <option value="shipping">Shipping & Logistics</option>
                    <option value="warranty">Warranty & Repairs</option>
                    <option value="catalog">Product Specifications</option>
                    <option value="troubleshooting">Troubleshooting FAQ</option>
                    <option value="custom">Custom Internal Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Source Format
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="txt">Plain Text (.txt)</option>
                    <option value="md">Markdown Article (.md)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Body / Text Content
                </label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste article, guidelines, FAQ questions and answers, or warranty clauses here..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs sm:text-sm text-white font-mono outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50 shadow-md shadow-cyan-500/20"
                >
                  <span>{savingDoc ? 'Chunking & Indexing...' : 'Save & Generate Chunks'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
