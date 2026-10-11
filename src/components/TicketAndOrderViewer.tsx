import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  LifeBuoy,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Order, Product, SupportTicket } from '../types';

export const TicketAndOrderViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products' | 'tickets'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // New ticket modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [category, setCategory] = useState<SupportTicket['category']>('General');

  const fetchData = async () => {
    try {
      const [ordRes, prodRes, tckRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/tickets'),
      ]);
      const [ordData, prodData, tckData] = await Promise.all([
        ordRes.json(),
        prodRes.json(),
        tckRes.json(),
      ]);
      setOrders(ordData.orders || []);
      setProducts(prodData.products || []);
      setTickets(tckData.tickets || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          customerEmail: custEmail,
          subject,
          description: desc,
          priority,
          category,
        }),
      });
      const data = await res.json();
      if (data.ticket) {
        setShowNewTicketModal(false);
        setCustName('');
        setCustEmail('');
        setSubject('');
        setDesc('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: SupportTicket['status']) => {
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders Store ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'products'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catalog Items ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'tickets'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Tickets ({tickets.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeSubTab === 'tickets' && (
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Ticket</span>
            </button>
          )}
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-base text-cyan-400">{ord.id}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ord.status === 'Out for Delivery'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Customer:</span>
                    <span className="text-white font-medium">{ord.customerName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Carrier:</span>
                    <span className="text-white font-medium">{ord.carrier}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tracking:</span>
                    <span className="text-cyan-300 font-mono">{ord.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Est. Delivery:</span>
                    <span className="text-emerald-400 font-medium">{ord.estimatedDelivery}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total:</span>
                    <span className="text-white font-bold">${ord.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <p className="font-semibold text-slate-300 mb-1">Items in shipment:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {ord.items.map((i) => (
                      <li key={i.id}>
                        {i.name} (Qty: {i.quantity}) - ${i.price}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Catalog Tab */}
      {activeSubTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((prod) => (
            <div
              key={prod.sku}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {prod.sku}
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    ★ {prod.rating}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{prod.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    ${prod.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      prod.inStock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {prod.inStock ? `${prod.stockCount} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Features:</p>
                {prod.features.map((f, idx) => (
                  <p key={idx} className="flex items-center space-x-1">
                    <span className="text-cyan-400">•</span>
                    <span>{f}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeSubTab === 'tickets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">SLA Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-cyan-400">{t.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{t.customerName}</div>
                      <div className="text-[10px] text-slate-400">{t.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200 line-clamp-1">{t.subject}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                          t.priority === 'urgent' || t.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : t.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                      {new Date(t.slaDeadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Ticket */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Create Support Ticket</h3>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Shipping">Shipping</option>
                    <option value="Returns">Returns</option>
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Issue Description</label>
                <textarea
                  rows={4}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-semibold"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
