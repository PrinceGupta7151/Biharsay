'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStoryComments, addStoryComment } from '@/lib/db';
import { StoryComment } from '@/types';
import { Clock } from 'lucide-react';
import styles from './ArticleComments.module.css';

interface ArticleCommentsProps {
  storyId: string;
}

export default function ArticleComments({ storyId }: ArticleCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getStoryComments(storyId).then((data) => {
      if (isMounted) {
        setComments(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [storyId]);

  // Pre-fill name and email if user profile is available
  useEffect(() => {
    if (user) {
      if (user.displayName && !name) setName(user.displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      const added = await addStoryComment({
        storyId,
        userId: user?.uid || `guest-${Date.now()}`,
        userName: name.trim(),
        userEmail: email.trim(),
        userWebsite: website.trim() || undefined,
        userPhoto: user?.photoURL || null,
        content: comment.trim(),
      });

      setComments((prev) => [added, ...prev]);
      setComment('');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <section className={styles.commentsSection}>
      <div className={styles.replySection}>
        <h3 className={styles.replyTitle}>Leave a Reply</h3>
        <p className={styles.replySubtitle}>
          Your email address will not be published. Required fields are marked *
        </p>

        <form onSubmit={handleSubmit} className={styles.replyForm}>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
              required
            />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>

          <div className={styles.fullWidthRow}>
            <input
              type="text"
              placeholder="Enter Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <div className={styles.fullWidthRow}>
            <textarea
              placeholder="Enter Comments"
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.textareaField}
              required
            />
          </div>

          <div className={styles.actionRow}>
            <button
              type="submit"
              disabled={submitting || !comment.trim() || !name.trim() || !email.trim()}
              className={styles.submitBtn}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
            {successMessage && (
              <span className={styles.successText}>Comment posted successfully!</span>
            )}
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {loading ? (
          <div className={styles.loadingState}>Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((item, idx) => (
            <div key={item.id || idx} className={styles.commentItem}>
              <div className={styles.commentAvatar}>
                {item.userName ? item.userName.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.authorName}>{item.userName}</span>
                  <span className={styles.commentDate}>
                    <Clock size={11} /> {formatTimestamp(item.createdAt)}
                  </span>
                </div>
                <p className={styles.commentContent}>{item.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyComments}>
            <p>No comments yet. Be the first to share your thoughts on this story!</p>
          </div>
        )}
      </div>
    </section>
  );
}
