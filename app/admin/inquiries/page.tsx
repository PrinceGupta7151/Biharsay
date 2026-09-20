'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getBusinessInquiries, markInquiryResolved, deleteInquiry } from '@/lib/admin';
import { BusinessInquiry } from '@/types';
import {
  Briefcase,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type FilterTab = 'all' | 'new' | 'contacted' | 'resolved';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getBusinessInquiries();
    setInquiries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResolve = async (id: string) => {
    setActionLoading(id);
    const ok = await markInquiryResolved(id);
    if (ok) {
      showToast('Inquiry marked as resolved', 'success');
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'resolved' as const } : i))
      );
    } else {
      showToast('Failed to update inquiry', 'error');
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    setActionLoading(id);
    const ok = await deleteInquiry(id);
    if (ok) {
      showToast('Inquiry deleted', 'success');
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } else {
      showToast('Failed to delete inquiry', 'error');
    }
    setActionLoading(null);
  };

  const filtered = inquiries.filter((i) => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (i.service || '').toLowerCase().includes(q) ||
        (i.name || '').toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q) ||
        (i.company || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    resolved: inquiries.filter((i) => i.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="admin-filter-tabs">
        {(['all', 'new', 'contacted', 'resolved'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            className={filter === tab ? 'active' : ''}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>
            Business Inquiries
            <span className="table-count">{filtered.length}</span>
          </h3>
          <div className="admin-table-controls">
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
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <Briefcase size={36} />
            <h4>No inquiries found</h4>
            <p>Business and partnership inquiries will appear here.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr>
                      <td className="title-cell">{inquiry.service}</td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          {inquiry.name && (
                            <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{inquiry.name}</div>
                          )}
                          <div style={{ color: '#94A3B8', fontSize: 12 }}>
                            {inquiry.email || inquiry.phone || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="meta-cell">{inquiry.company || '—'}</td>
                      <td>
                        <span className={`status-badge ${inquiry.status}`}>
                          <span className={`status-dot ${inquiry.status}`} />
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="meta-cell">
                        <Clock size={11} style={{ marginRight: 4 }} />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-btn ghost"
                            onClick={() =>
                              setExpandedId(expandedId === inquiry.id ? null : (inquiry.id || null))
                            }
                            title="View details"
                          >
                            {expandedId === inquiry.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                          {inquiry.status !== 'resolved' && (
                            <button
                              className="admin-btn success"
                              onClick={() => handleResolve(inquiry.id!)}
                              disabled={actionLoading === inquiry.id}
                              title="Mark resolved"
                            >
                              <CheckCircle size={13} /> Resolve
                            </button>
                          )}
                          <button
                            className="admin-btn danger"
                            onClick={() => handleDelete(inquiry.id!)}
                            disabled={actionLoading === inquiry.id}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === inquiry.id && (
                      <tr>
                        <td colSpan={6}>
                          <div className="admin-preview-panel">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                              <div>
                                <strong style={{ color: '#94A3B8', fontSize: 11, textTransform: 'uppercase' }}>
                                  Service
                                </strong>
                                <div style={{ color: '#E2E8F0', marginTop: 2 }}>{inquiry.service}</div>
                              </div>
                              {inquiry.budget && (
                                <div>
                                  <strong style={{ color: '#94A3B8', fontSize: 11, textTransform: 'uppercase' }}>
                                    Budget
                                  </strong>
                                  <div style={{ color: '#E2E8F0', marginTop: 2 }}>{inquiry.budget}</div>
                                </div>
                              )}
                            </div>
                            {inquiry.message && (
                              <div>
                                <strong style={{ color: '#94A3B8', fontSize: 11, textTransform: 'uppercase' }}>
                                  Message
                                </strong>
                                <p style={{ color: '#CBD5E1', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                                  {inquiry.message}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
