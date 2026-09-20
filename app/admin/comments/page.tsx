'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAllComments, deleteComment } from '@/lib/admin';
import { StoryComment } from '@/types';
import {
  Trash2,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState<(StoryComment & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAllComments();
    setComments(data);
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
    if (!confirm('Delete this comment permanently?')) return;
    setActionLoading(id);
    const ok = await deleteComment(id);
    if (ok) {
      showToast('Comment deleted', 'success');
      setComments((prev) => prev.filter((c) => c.id !== id));
    } else {
      showToast('Failed to delete comment', 'error');
    }
    setActionLoading(null);
  };

  const filtered = comments.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.content.toLowerCase().includes(q) ||
      c.userName.toLowerCase().includes(q) ||
      c.storyId.toLowerCase().includes(q)
    );
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
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>
            Comments
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
                placeholder="Search comments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <MessageSquare size={36} />
            <h4>No comments found</h4>
            <p>User comments will appear here as they are posted on articles.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Comment</th>
                  <th>Article ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comment) => (
                  <tr key={comment.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(37, 99, 235, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#60A5FA',
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {comment.userName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                        <span style={{ fontWeight: 600, color: '#E2E8F0', fontSize: 13 }}>
                          {comment.userName}
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comment.content}
                    </td>
                    <td className="meta-cell" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comment.storyId}
                    </td>
                    <td className="meta-cell">
                      <Clock size={11} style={{ marginRight: 4 }} />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="admin-btn danger"
                        onClick={() => handleDelete(comment.id)}
                        disabled={actionLoading === comment.id}
                        title="Delete comment"
                      >
                        <Trash2 size={13} /> Delete
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
