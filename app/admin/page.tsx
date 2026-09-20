'use client';

import React, { useState, useEffect } from 'react';
import { getSiteStats, SiteStats, getAllSubmissions, getAllComments } from '@/lib/admin';
import { StorySubmission, StoryComment } from '@/types';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Users,
  Briefcase,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [recentSubs, setRecentSubs] = useState<StorySubmission[]>([]);
  const [recentComments, setRecentComments] = useState<(StoryComment & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, subs, comments] = await Promise.all([
          getSiteStats(),
          getAllSubmissions(),
          getAllComments(),
        ]);
        setStats(s);
        setRecentSubs(subs.slice(0, 5));
        setRecentComments(comments.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Published Stories',
      value: stats?.totalStories ?? 0,
      icon: <BookOpen size={20} />,
      color: 'blue',
      href: '/admin/stories',
    },
    {
      label: 'Pending Submissions',
      value: stats?.pendingSubmissions ?? 0,
      icon: <FileText size={20} />,
      color: 'amber',
      href: '/admin/submissions',
    },
    {
      label: 'Total Comments',
      value: stats?.totalComments ?? 0,
      icon: <MessageSquare size={20} />,
      color: 'green',
      href: '/admin/comments',
    },
    {
      label: 'Newsletter Subscribers',
      value: stats?.totalSubscribers ?? 0,
      icon: <Users size={20} />,
      color: 'purple',
      href: '/admin/subscribers',
    },
    {
      label: 'Business Inquiries',
      value: stats?.totalInquiries ?? 0,
      icon: <Briefcase size={20} />,
      color: 'rose',
      href: '/admin/inquiries',
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div className={`stat-card ${card.color}`}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Submissions */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ marginBottom: 0 }}>Recent Submissions</h3>
            <Link href="/admin/submissions" className="admin-btn ghost" style={{ fontSize: 12 }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          {recentSubs.length === 0 ? (
            <div className="admin-empty" style={{ padding: '32px 16px' }}>
              <FileText size={28} />
              <p>No submissions yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentSubs.map((sub) => (
                <div
                  key={sub.id || sub.createdAt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: 10,
                    border: '1px solid rgba(148, 163, 184, 0.04)',
                  }}
                >
                  {sub.status === 'pending' ? (
                    <AlertCircle size={16} color="#FBBF24" />
                  ) : (
                    <CheckCircle size={16} color="#34D399" />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#F1F5F9',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {sub.authorName} · {sub.category}
                    </div>
                  </div>
                  <span className={`status-badge ${sub.status}`}>
                    <span className={`status-dot ${sub.status}`} />
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ marginBottom: 0 }}>Recent Comments</h3>
            <Link href="/admin/comments" className="admin-btn ghost" style={{ fontSize: 12 }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          {recentComments.length === 0 ? (
            <div className="admin-empty" style={{ padding: '32px 16px' }}>
              <MessageSquare size={28} />
              <p>No comments yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentComments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: 10,
                    border: '1px solid rgba(148, 163, 184, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(37, 99, 235, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60A5FA',
                      fontSize: 10,
                      fontWeight: 700,
                    }}>
                      {comment.userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1' }}>
                      {comment.userName}
                    </span>
                    <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>
                      <Clock size={11} style={{ marginRight: 3 }} />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12.5,
                    color: '#94A3B8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    margin: 0,
                  }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive grid fix */}
      <style>{`
        @media (max-width: 768px) {
          .admin-content > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
