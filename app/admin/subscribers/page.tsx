'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getNewsletterSubscribers, deleteSubscriber } from '@/lib/admin';
import { NewsletterSubscriber } from '@/types';
import {
  Users,
  Trash2,
  Search,
  Copy,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
} from 'lucide-react';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getNewsletterSubscribers();
    setSubscribers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    const ok = await deleteSubscriber(id);
    if (ok) {
      showToast('Subscriber removed', 'success');
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } else {
      showToast('Failed to remove subscriber', 'error');
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((s) =>
      `${s.contact},${s.channel},${s.subscribedAt || ''}`
    );
    const csv = `Contact,Channel,Subscribed At\n${rows.join('\n')}`;
    navigator.clipboard.writeText(csv).then(() => {
      showToast(`Copied ${filtered.length} subscribers as CSV`, 'success');
    });
  };

  const filtered = subscribers.filter((s) => {
    if (channelFilter !== 'all' && s.channel !== channelFilter) return false;
    if (search) return s.contact.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="stat-card purple" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="stat-icon" style={{ marginBottom: 0 }}>
              <Users size={18} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>{subscribers.length}</div>
              <div className="stat-label">Total Subscribers</div>
            </div>
          </div>
        </div>
        <div className="stat-card blue" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="stat-icon" style={{ marginBottom: 0 }}>
              <Mail size={18} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {subscribers.filter((s) => s.channel === 'email').length}
              </div>
              <div className="stat-label">Email</div>
            </div>
          </div>
        </div>
        <div className="stat-card green" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="stat-icon" style={{ marginBottom: 0 }}>
              <Phone size={18} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {subscribers.filter((s) => s.channel === 'whatsapp').length}
              </div>
              <div className="stat-label">WhatsApp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-filter-tabs">
        {(['all', 'email', 'whatsapp'] as const).map((tab) => (
          <button
            key={tab}
            className={channelFilter === tab ? 'active' : ''}
            onClick={() => setChannelFilter(tab)}
          >
            {tab === 'all' ? 'All' : tab === 'email' ? 'Email' : 'WhatsApp'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>
            Subscribers
            <span className="table-count">{filtered.length}</span>
          </h3>
          <div className="admin-table-controls">
            <button className="admin-btn ghost" onClick={handleExportCSV} title="Copy as CSV">
              <Copy size={13} /> Export CSV
            </button>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#475569',
                }}
              />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search subscribers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <Users size={36} />
            <h4>No subscribers found</h4>
            <p>Newsletter subscribers will appear here.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Channel</th>
                  <th>Subscribed</th>
                  <th style={{ minWidth: 80, textAlign: 'right', paddingRight: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600, color: '#E2E8F0', whiteSpace: 'nowrap' }}>{sub.contact}</td>
                    <td>
                      <span className={`status-badge ${sub.channel === 'email' ? 'new' : 'approved'}`}>
                        {sub.channel === 'email' ? <Mail size={11} /> : <Phone size={11} />}
                        {sub.channel}
                      </span>
                    </td>
                    <td className="meta-cell">
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <button
                        className="admin-btn danger"
                        onClick={() => handleDelete(sub.id!)}
                        title="Remove subscriber"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={16} color="#34D399" />
          ) : (
            <XCircle size={16} color="#FB7185" />
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}
