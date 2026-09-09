import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getStoryById, getStoriesByCategory } from '@/lib/db';
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import StoryCard from '@/components/StoryCard';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import ShareBar from '@/components/ShareBar';
import ArticleReactions from '@/components/ArticleReactions';
import ArticleComments from '@/components/ArticleComments';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import styles from './Article.module.css';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    return {
      title: 'Story Not Found — Bihar Say',
    };
  }

  return {
    title: `${story.title} — Bihar Say`,
    description: story.summary || 'Read inspiring stories from Bihar on Bihar Say.',
    openGraph: {
      title: story.title,
      description: story.summary,
      url: `https://biharsay.com/article/${story.id}`,
      siteName: 'Bihar Say',
      images: story.imageUrl ? [{ url: story.imageUrl }] : undefined,
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    notFound();
  }

  const relatedStories = (await getStoriesByCategory(story.categorySlug))
    .filter(s => s.id !== story.id)
    .slice(0, 3);

  return (
    <>
      {/* Scroll Reading Progress Bar */}
      <ReadingProgressBar />

      <article className={styles.container}>
        {/* Breadcrumb / Back button */}
        <div className={styles.backRow}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to All Stories</span>
          </Link>
          <span className={styles.crumbDivider}>/</span>
          <span className={styles.crumbCat}>{story.category}</span>
        </div>

        {/* Article Header */}
        <header className={styles.articleHeader}>
          <div className={styles.badgeRow}>
            <span className={styles.categoryBadge}>{story.category}</span>
            {story.readTime && (
              <span className={styles.readTime}>
                <Clock size={13} /> {story.readTime}
              </span>
            )}
          </div>

          <h1 className={styles.headline}>{story.title}</h1>

          {story.summary && (
            <p className={styles.leadSummary}>{story.summary}</p>
          )}

          <div className={styles.bylineRow}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>
                {story.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.authorName}>{story.author}</div>
                <div className={styles.publishDate}>Published {story.date}</div>
              </div>
            </div>

            <div className={styles.articleStats}>
              {story.views && (
                <span className={styles.statItem}>
                  <Eye size={14} /> {story.views.toLocaleString()} reads
                </span>
              )}
            </div>
          </div>

          {/* Social Share Bar (Top) */}
          <ShareBar title={story.title} url={`https://biharsay.com/article/${story.id}`} />
        </header>

        {/* Hero Image */}
        {story.imageUrl && (
          <div className={styles.heroImageWrap}>
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 900px"
              className={styles.heroImg}
            />
          </div>
        )}

        {/* Article Body */}
        <div className={styles.bodyContent}>
          {story.content ? (
            story.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={styles.paragraph}>
                {paragraph}
              </p>
            ))
          ) : (
            <p className={styles.paragraph}>
              Read the latest developments and inspiring progress in this report from Bihar Say.
            </p>
          )}
        </div>

        {/* In-Article Google AdSense / Sponsor Slot */}
        <GoogleAdSlot format="inArticle" />

        {/* Applause Reactions (Firestore) */}
        <ArticleReactions storyId={story.id} />

        {/* Social Share Bar (Bottom) */}
        <ShareBar title={story.title} url={`https://biharsay.com/article/${story.id}`} />

        {/* Community Callout Box */}
        <div className={styles.communityCallout}>
          <div className={styles.calloutText}>
            <h3>Have a Bihar story to share?</h3>
            <p>
              Bihar Say is powered by grassroots contributors, founders, and changemakers like you. Join the community today.
            </p>
          </div>
          <Link href="/" className="btn-primary">
            Explore More Stories
          </Link>
        </div>

        {/* Article Comments Discussion (Firestore) */}
        <ArticleComments storyId={story.id} />

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="section-head">
              <h2>More in {story.category}</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedStories.map((relStory) => (
                <StoryCard key={relStory.id} story={relStory} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
