'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitStory, cleanArticleContent } from '@/lib/db';
import { uploadStoryThumbnail } from '@/lib/storage';
import { CATEGORIES } from '@/data/seedStories';
import { CategorySlug } from '@/types';
import { 
  X, 
  Send, 
  CheckCircle, 
  UploadCloud, 
  Trash2, 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Quote, 
  Heading1, 
  Heading2, 
  List, 
  Eye, 
  Edit3,
  Sparkles
} from 'lucide-react';
import styles from './SubmitStoryModal.module.css';

interface SubmitStoryModalProps {
  onStorySubmitted?: () => void;
}

const FONT_OPTIONS = [
  { label: 'Modern Sans (Outfit / Inter)', value: "'Inter', -apple-system, sans-serif" },
  { label: 'Editorial Serif (Playfair Display)', value: "'Playfair Display', Georgia, serif" },
  { label: 'Hindi / Devanagari (Noto Sans)', value: "'Noto Sans Devanagari', 'Mangal', sans-serif" },
  { label: 'Literary (Merriweather / Georgia)', value: "'Merriweather', Georgia, serif" },
  { label: 'Monospace (Code / Data)', value: "Consolas, 'Courier New', monospace" },
];

export default function SubmitStoryModal({ onStorySubmitted }: SubmitStoryModalProps) {
  const { isSubmitModalOpen, closeSubmitModal, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState<CategorySlug>('culture-heritage');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

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

  const applyFontToSelection = (fontValue: string) => {
    setSelectedFont(fontValue);
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    if (selected) {
      const replacement = `<span style="font-family: ${fontValue};">${selected}</span>`;
      const newContent = content.slice(0, start) + replacement + content.slice(end);
      setContent(newContent);
    } else {
      const fontName = FONT_OPTIONS.find(f => f.value === fontValue)?.label.split(' ')[0] || 'Styled';
      const replacement = `\n<p style="font-family: ${fontValue};">Write ${fontName} text here...</p>\n`;
      const newContent = content.slice(0, start) + replacement + content.slice(end);
      setContent(newContent);
    }
    setTimeout(() => textarea.focus(), 50);
  };

  const applyTagFormat = (tag: 'h1' | 'h2' | 'quote' | 'b' | 'i' | 'u' | 'list') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    let replacement = '';
    const fontStyle = ` style="font-family: ${selectedFont};"`;

    switch (tag) {
      case 'h1':
        replacement = selected 
          ? `<h1${fontStyle}>${selected}</h1>` 
          : `\n<h1${fontStyle}>Main Section Title</h1>\n`;
        break;
      case 'h2':
        replacement = selected 
          ? `<h2${fontStyle}>${selected}</h2>` 
          : `\n<h2${fontStyle}>Subheading Title</h2>\n`;
        break;
      case 'quote':
        replacement = selected 
          ? `<blockquote${fontStyle}>${selected}</blockquote>` 
          : `\n<blockquote${fontStyle}>“Inspiring quote or key takeaway...”</blockquote>\n`;
        break;
      case 'b':
        replacement = selected ? `<strong>${selected}</strong>` : `<strong>bold text</strong>`;
        break;
      case 'i':
        replacement = selected ? `<em>${selected}</em>` : `<em>italic text</em>`;
        break;
      case 'u':
        replacement = selected ? `<u>${selected}</u>` : `<u>underlined text</u>`;
        break;
      case 'list':
        replacement = selected 
          ? `\n<ul>\n  <li>${selected}</li>\n</ul>\n` 
          : `\n<ul>\n  <li>Key point 1</li>\n  <li>Key point 2</li>\n</ul>\n`;
        break;
    }

    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
    }, 50);
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

      // Upload/compress thumbnail
      if (thumbnailFile) {
        imageUrl = await uploadStoryThumbnail(thumbnailFile);
      }

      // Safe timeout guard so the submission never stays stuck indefinitely
      const submissionPromise = submitStory({
        title: title.trim(),
        category: categoryName,
        categorySlug,
        content: content.trim(),
        authorName: authorName.trim() || user?.displayName || 'Community Voice',
        authorEmail: user?.email || 'contributor@biharsay.com',
        userId: user?.uid,
        imageUrl,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Submission connection timed out. Please check your internet and try again.')), 10000)
      );

      await Promise.race([submissionPromise, timeoutPromise]);

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
      console.error('Submit story error:', err);
      setError(err?.message || 'Failed to submit story. Please try again.');
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ margin: 0 }}>Story Content & Typography *</label>
                <div className={styles.tabSwitch}>
                  <button
                    type="button"
                    className={`${styles.tabSwitchBtn} ${editorTab === 'write' ? styles.activeTab : ''}`}
                    onClick={() => setEditorTab('write')}
                  >
                    <Edit3 size={11} style={{ marginRight: 4, display: 'inline' }} />
                    Write
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabSwitchBtn} ${editorTab === 'preview' ? styles.activeTab : ''}`}
                    onClick={() => setEditorTab('preview')}
                  >
                    <Eye size={11} style={{ marginRight: 4, display: 'inline' }} />
                    Preview
                  </button>
                </div>
              </div>

              <div className={styles.editorContainer}>
                {/* Font & Formatting Toolbar */}
                <div className={styles.editorToolbar}>
                  <div className={styles.fontSelectGroup}>
                    <Type size={13} style={{ color: '#0284C7' }} />
                    <select
                      className={styles.fontSelect}
                      value={selectedFont}
                      onChange={(e) => applyFontToSelection(e.target.value)}
                      title="Choose font for current line or selected text"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          Font: {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.toolbarDivider} />

                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('h1')}
                    title="Heading 1 (Main Title)"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('h2')}
                    title="Heading 2 (Sub-section)"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('quote')}
                    title="Quote Block"
                  >
                    <Quote size={12} />
                  </button>

                  <div className={styles.toolbarDivider} />

                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('b')}
                    title="Bold"
                  >
                    <Bold size={12} />
                  </button>
                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('i')}
                    title="Italic"
                  >
                    <Italic size={12} />
                  </button>
                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('u')}
                    title="Underline"
                  >
                    <Underline size={12} />
                  </button>
                  <button
                    type="button"
                    className={styles.formatBtn}
                    onClick={() => applyTagFormat('list')}
                    title="Bullet List"
                  >
                    <List size={12} />
                  </button>
                </div>

                {editorTab === 'write' ? (
                  <textarea
                    ref={contentRef}
                    className={styles.editorTextarea}
                    rows={6}
                    placeholder="Write your story details here. Highlight any sentence to change its font or apply H1/H2 headings..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                ) : (
                  <div className={styles.previewPanel}>
                    {content.trim() ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: cleanArticleContent(content),
                        }}
                      />
                    ) : (
                      <div className={styles.previewEmpty}>
                        Start writing your story in the Write tab to see live preview with chosen fonts!
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className={styles.helperText}>
                <Sparkles size={12} color="#D97706" />
                Select any text or line and click a font or heading to style it individually.
              </span>
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
