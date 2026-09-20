'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitStory } from '@/lib/db';
import { uploadStoryThumbnail } from '@/lib/storage';
import { CATEGORIES } from '@/data/seedStories';
import { CategorySlug } from '@/types';
import { X, Send, CheckCircle, UploadCloud, ImageIcon, Trash2 } from 'lucide-react';
import styles from './SubmitStoryModal.module.css';

interface SubmitStoryModalProps {
  onStorySubmitted?: () => void;
}

export default function SubmitStoryModal({ onStorySubmitted }: SubmitStoryModalProps) {
  const { isSubmitModalOpen, closeSubmitModal, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState<CategorySlug>('culture-heritage');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSubmitModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB.');
      return;
    }

    setError(null);
    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both the story title and content.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const categoryObj = CATEGORIES.find((c) => c.slug === categorySlug);
    const categoryName = categoryObj ? categoryObj.name : 'Culture & Heritage';

    try {
      let imageUrl: string | undefined = undefined;

      // Upload thumbnail to Firebase Storage if selected
      if (thumbnailFile) {
        imageUrl = await uploadStoryThumbnail(thumbnailFile);
      }

      await submitStory({
        title: title.trim(),
        category: categoryName,
        categorySlug,
        content: content.trim(),
        authorName: authorName.trim() || user?.displayName || 'Community Voice',
        authorEmail: user?.email || 'contributor@biharsay.com',
        userId: user?.uid,
        imageUrl,
      });

      setSuccess(true);
      if (onStorySubmitted) {
        onStorySubmitted();
      }
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setContent('');
        handleRemoveThumbnail();
        closeSubmitModal();
      }, 2000);
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
            <h4>Story Submitted for Review!</h4>
            <p>
              Thank you for contributing! Our editorial team reviews every submission to ensure journalistic quality.
              Your story will appear once approved.
            </p>
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
                rows={5}
                placeholder="Write the details of the story, key figures, locations in Bihar, and impact..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Thumbnail Upload Section */}
            <div className={styles.field}>
              <label>Story Cover / Thumbnail (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {thumbnailPreview ? (
                <div className={styles.previewCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removeThumbBtn}
                    onClick={handleRemoveThumbnail}
                    title="Remove Image"
                    aria-label="Remove thumbnail"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={28} className={styles.uploadIcon} />
                  <span className={styles.uploadText}>Click to upload thumbnail</span>
                  <span className={styles.uploadHint}>PNG, JPG, or WebP up to 10MB</span>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button type="button" className="btn-secondary" onClick={closeSubmitModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <Send size={16} />
                <span>{submitting ? 'Uploading & Publishing...' : 'Publish to Bihar Say'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
