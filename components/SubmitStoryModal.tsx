'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitStory } from '@/lib/db';
import { CATEGORIES } from '@/data/seedStories';
import { CategorySlug } from '@/types';
import { X, Send, CheckCircle, FileText, Tag, User } from 'lucide-react';
import styles from './SubmitStoryModal.module.css';

interface SubmitStoryModalProps {
  onStorySubmitted?: () => void;
}

export default function SubmitStoryModal({ onStorySubmitted }: SubmitStoryModalProps) {
  const { isSubmitModalOpen, closeSubmitModal, user } = useAuth();

  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState<CategorySlug>('culture-heritage');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSubmitModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both the story title and content.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const categoryObj = CATEGORIES.find(c => c.slug === categorySlug);
    const categoryName = categoryObj ? categoryObj.name : 'Culture & Heritage';

    try {
      await submitStory({
        title,
        category: categoryName,
        categorySlug,
        content,
        authorName: authorName.trim() || user?.displayName || 'Community Voice',
        authorEmail: user?.email || 'contributor@biharsay.com',
        userId: user?.uid,
      });

      setSuccess(true);
      if (onStorySubmitted) {
        onStorySubmitted();
      }
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setContent('');
        closeSubmitModal();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to submit story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeSubmitModal}>
      <div className={`modal-card ${styles.wideModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3>Share Your Bihar Story</h3>
            <p className={styles.subtext}>Contribute grassroots innovation, heritage, or inspiring stories.</p>
          </div>
          <button className={styles.closeBtn} onClick={closeSubmitModal} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <CheckCircle size={44} color="#10B981" />
            <h4>Story Published Successfully!</h4>
            <p>Your contribution is now live in the Bihar Say community feed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.field}>
              <label>Story Headline *</label>
              <input
                type="text"
                placeholder="e.g. How Solar Cold Storage is Transforming Muzaffarpur Litchi Farmers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Category</label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value as CategorySlug)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Author / Contributor Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Story Content *</label>
              <textarea
                rows={6}
                placeholder="Write the details of the story, key figures, locations in Bihar, and impact..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className={styles.footer}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={closeSubmitModal}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting}
              >
                <Send size={16} />
                <span>{submitting ? 'Publishing...' : 'Publish to Bihar Say'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
