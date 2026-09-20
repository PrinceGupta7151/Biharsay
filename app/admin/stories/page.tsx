'use client';

import React, { useState, useEffect } from 'react';
import { getAllStories } from '@/lib/db';
import { Story } from '@/types';
import Link from 'next/link';
import { Search, ExternalLink, BookOpen, Eye } from 'lucide-react';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllStories();
        setStories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = Array.from(new Set(stories.map((s) => s.category).filter(Boolean)));

  const filtered = stories.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        (s.author || '').toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
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
      {/* Header Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        <div className="stat-card blue" style={{ padding: '16px 20px', flex: '0 0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="stat-icon" style={{ marginBottom: 0 }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>{stories.length}</div>
              <div className="stat-label">Total Stories</div>
            </div>
          </div>
        </div>
        <div className="stat-card green" style={{ padding: '16px 20px', flex: '0 0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="stat-icon" style={{ marginBottom: 0 }}>
              <Eye size={18} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>
            All Published Stories
            <span className="table-count">{filtered.length}</span>
          </h3>
          <div className="admin-table-controls">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#E2E8F0',
                fontSize: 13,
                outline: 'none',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
                placeholder="Search stories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <BookOpen size={36} />
            <h4>No stories found</h4>
            <p>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Read Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((story) => (
                  <tr key={story.id}>
                    <td className="title-cell">{story.title}</td>
                    <td>
                      <span className="category-tag">{story.category}</span>
                    </td>
                    <td style={{ color: '#94A3B8', fontSize: 13 }}>
                      {story.author || 'Bihar Say Desk'}
                    </td>
                    <td className="meta-cell">{story.date || '—'}</td>
                    <td className="meta-cell">{story.readTime || '—'}</td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          href={`/article/${story.id}`}
                          target="_blank"
                          className="admin-btn ghost"
                          title="View on site"
                        >
                          <ExternalLink size={13} /> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 50 && (
          <div style={{
            padding: '14px 22px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: 13,
            borderTop: '1px solid rgba(148, 163, 184, 0.06)',
          }}>
            Showing 50 of {filtered.length} stories. Use search to narrow results.
          </div>
        )}
      </div>
    </>
  );
}
