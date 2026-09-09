'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStoryComments, addStoryComment } from '@/lib/db';
import { StoryComment } from '@/types';
import { MessageSquare, Send, User, Sparkles, Clock } from 'lucide-react';
import styles from './ArticleComments.module.css';

interface ArticleCommentsProps {
  storyId: string;
}

export default function ArticleComments({ storyId }: ArticleCommentsProps) {
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setSubmitting(true);
    try {
      const added = await addStoryComment({
        storyId,
        userId: user.uid,
        userName: user.displayName || 'Bihari Voice',
        userPhoto: user.photoURL,
        content: newComment.trim(),
      });

      setComments((prev) => [added, ...prev]);
      setNewComment('');
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
      <div className={styles.sectionHeader}>
        <div className={styles.titleRow}>
          <MessageSquare size={22} color="#2563EB" />
          <h3>Community Discussion</h3>
          <span className={styles.countBadge}>{comments.length}</span>
        </div>
        <p className={styles.sectionSub}>
          Share your reflections, local context, or congratulate the changemakers featured in this story.
        </p>
      </div>

      {/* Post Comment Box */}
      <div className={styles.formCard}>
        {user ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.userBanner}>
              <div className={styles.avatar}>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
              </div>
              <span className={styles.postingAs}>
                Commenting as <strong>{user.displayName}</strong>
              </span>
            </div>

            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts on this story? Leave a comment..."
              className={styles.textarea}
              required
            />

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="btn-primary"
              >
                <Send size={15} />
                <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.guestPrompt}>
            <Sparkles size={24} color="#1D6FD8" />
            <div className={styles.promptText}>
              <h4>Join the Discussion</h4>
              <p>Sign in or create your profile to leave thoughts on this story.</p>
            </div>
            <button className="btn-primary" onClick={openAuthModal}>
              Sign In to Comment
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {loading ? (
          <div className={styles.loadingState}>Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment, idx) => (
            <div key={comment.id || idx} className={styles.commentItem}>
              <div className={styles.commentAvatar}>
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.authorName}>{comment.userName}</span>
                  <span className={styles.commentDate}>
                    <Clock size={11} /> {formatTimestamp(comment.createdAt)}
                  </span>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
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
