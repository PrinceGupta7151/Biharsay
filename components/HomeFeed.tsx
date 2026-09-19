'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Story, CategorySlug } from '@/types';
import { CATEGORIES } from '@/data/seedStories';
import SearchBar from './SearchBar';
import HeroPicks from './HeroPicks';
import CategorySection from './CategorySection';
import CommunityStrip from './CommunityStrip';
import WidgetStrip from './WidgetStrip';
import StoryCard from './StoryCard';
import BrandAdsStrip from './BrandAdsStrip';
import ServicesShowcase from './ServicesShowcase';
import AboutImpact from './AboutImpact';
import PartnerFloatingFAB from './PartnerFloatingFAB';
import BusinessInquiryModal from './BusinessInquiryModal';
import NewsletterStrip from './NewsletterStrip';
import GoogleAdSlot from './GoogleAdSlot';
import PartnerBrandsTicker from './PartnerBrandsTicker';
import RecentPostsSection from './RecentPostsSection';
import MsmeCommunityBanner from './MsmeCommunityBanner';
import { hasValidImage } from '@/lib/imageUtils';
import Link from 'next/link';
import { Sparkles, FileSearch, ArrowRight } from 'lucide-react';

interface HomeFeedProps {
  initialStories: Story[];
}

export default function HomeFeed({ initialStories }: HomeFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState('makhana-sample');

  const handleOpenInquiry = (serviceId: string = 'founder-story') => {
    setInquiryService(serviceId);
    setIsInquiryModalOpen(true);
  };

  const handleSearchChange = (query: string, category: CategorySlug | 'all') => {
    setSearchQuery(query);
    setSelectedCategory(category);
  };

  useEffect(() => {
    const scrollToElement = (id: string) => {
      let attempts = 0;
      const maxAttempts = 15;

      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          const headerOffset = 84;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryScroll, 40);
        }
      };

      tryScroll();
    };

    const handleNavigation = (slug: string) => {
      if (!slug || slug === 'home') {
        setSearchQuery('');
        setSelectedCategory('all');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Reset filters so that all category sections are mounted in DOM
      setSearchQuery('');
      setSelectedCategory('all');

      // Scroll to element with retry
      scrollToElement(slug);
    };

    const onCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      if (customEvent.detail && customEvent.detail.slug) {
        handleNavigation(customEvent.detail.slug);
      }
    };

    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        handleNavigation(hash);
      }
    };

    window.addEventListener('biharsay:navigate', onCustomNav);
    window.addEventListener('hashchange', onHashChange);

    // Initial check on mount if URL already has a hash
    if (window.location.hash) {
      const initialHash = window.location.hash.replace('#', '');
      setTimeout(() => {
        handleNavigation(initialHash);
      }, 100);
    }

    return () => {
      window.removeEventListener('biharsay:navigate', onCustomNav);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Filtered stories memoized for performance
  const filteredStories = useMemo(() => {
    return initialStories.filter((story) => {
      const matchesCategory = selectedCategory === 'all' || story.categorySlug === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      if (q.includes('makhana') && (story.title.toLowerCase().includes('litchi') || story.id.toLowerCase().includes('litchi'))) {
        return false;
      }

      const matchesQuery =
        story.title.toLowerCase().includes(q) ||
        (story.summary && story.summary.toLowerCase().includes(q)) ||
        (story.content && story.content.toLowerCase().includes(q)) ||
        (story.author && story.author.toLowerCase().includes(q)) ||
        (story.category && story.category.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [initialStories, searchQuery, selectedCategory]);

  const isFiltering = Boolean(searchQuery.trim() || selectedCategory !== 'all');

  // Split all stories into two groups per requirement:
  // articlesWithImages -> Existing image cards
  // articlesWithoutImages -> Title-only "Recent Posts" list
  const articlesWithImages = useMemo(() => {
    return initialStories.filter((story) => hasValidImage(story));
  }, [initialStories]);

  const articlesWithoutImages = useMemo(() => {
    return initialStories.filter((story) => !hasValidImage(story));
  }, [initialStories]);

  // Community spotlight stories with valid images
  const communityStories = useMemo(() => {
    return articlesWithImages.filter((s) => s.id.startsWith('user-story') || s.id.startsWith('local'));
  }, [articlesWithImages]);

  // Featured story for hero - prefers article with valid image, falls back safely
  const featuredStory = useMemo(() => {
    return (
      articlesWithImages.find((s) => s.isFeatured) ||
      articlesWithImages[0] ||
      initialStories.find((s) => s.isFeatured) ||
      initialStories[0]
    );
  }, [articlesWithImages, initialStories]);

  const sideStories = useMemo(() => {
    const pool = articlesWithImages.length >= 4 ? articlesWithImages : initialStories;
    const customSide = pool
      .filter((s) => s.featuredOrder !== undefined && s.id !== featuredStory?.id)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
      .slice(0, 3);
    if (customSide.length > 0) return customSide;
    return pool.filter((s) => s.id !== featuredStory?.id).slice(0, 3);
  }, [articlesWithImages, initialStories, featuredStory]);

  // Set of story IDs featured in Hero to prevent repeating them immediately in categories
  const heroStoryIds = useMemo(() => {
    const ids = new Set<string>();
    if (featuredStory?.id) ids.add(featuredStory.id);
    sideStories.forEach((s) => {
      if (s?.id) ids.add(s.id);
    });
    return ids;
  }, [featuredStory, sideStories]);

  // Group stories by category slug, strictly using articlesWithImages
  const getCategoryStories = (slug: CategorySlug) => {
    const categoryArticles = articlesWithImages.filter((s) => s.categorySlug === slug);
    const filtered = categoryArticles.filter((s) => !heroStoryIds.has(s.id));
    return filtered.length > 0 ? filtered : categoryArticles;
  };

  const getCategoryMeta = (slug: CategorySlug) => CATEGORIES.find((c) => c.slug === slug)!;

  // Non-hero stories for widgets
  const nonHeroStories = useMemo(() => {
    const rest = articlesWithImages.filter((s) => !heroStoryIds.has(s.id));
    return rest.length > 0 ? rest : articlesWithImages;
  }, [articlesWithImages, heroStoryIds]);

  // Top & popular entries for widgets
  const topStories = useMemo(() => {
    return [...nonHeroStories].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  }, [nonHeroStories]);

  const popularStories = useMemo(() => {
    return [...nonHeroStories].slice(0, 5);
  }, [nonHeroStories]);

  // When filtering or searching, partition matching stories:
  // 1. Articles WITH image -> Image card
  // 2. Articles WITHOUT image -> Title only bullet list
  const searchResultsWithImages = useMemo(() => {
    return filteredStories.filter((story) => hasValidImage(story));
  }, [filteredStories]);

  const searchResultsWithoutImages = useMemo(() => {
    return filteredStories.filter((story) => !hasValidImage(story));
  }, [filteredStories]);

  return (
    <>
      {/* Interactive Search & Category Filter Chips */}
      <SearchBar
        query={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={handleSearchChange}
        resultCount={filteredStories.length}
        isFiltering={isFiltering}
      />

      {isFiltering ? (
        <section style={{ padding: '16px 0 64px' }}>
          {filteredStories.length > 0 ? (
            <div>
              {/* 1. Articles WITH valid image -> Existing search card design */}
              {searchResultsWithImages.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px',
                  marginBottom: searchResultsWithoutImages.length > 0 ? '40px' : '0',
                }}>
                  {searchResultsWithImages.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              )}

              {/* 2. Articles WITHOUT image -> Simple title-only list */}
              {searchResultsWithoutImages.length > 0 && (
                <div style={{
                  marginTop: searchResultsWithImages.length > 0 ? '32px' : '0',
                  padding: '24px',
                  background: 'var(--bg-subtle, #F9FAFB)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  border: '1px solid var(--line, #E5E7EB)',
                }}>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--ink, #111827)',
                      margin: 0,
                    }}>
                      Articles & Updates
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--bg-card, #FFFFFF)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid var(--line, #E5E7EB)',
                      color: 'var(--ink-muted, #6B7280)',
                    }}>
                      {searchResultsWithoutImages.length}
                    </span>
                  </div>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {searchResultsWithoutImages.map((story) => (
                      <li key={story.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--primary, #2563EB)', fontSize: '18px', lineHeight: 1.4, flexShrink: 0 }}>•</span>
                        <Link
                          href={`/article/${story.id}`}
                          style={{
                            color: 'var(--ink, #1F2937)',
                            fontSize: '15px',
                            fontWeight: 500,
                            lineHeight: 1.5,
                            textDecoration: 'none',
                            wordBreak: 'break-word',
                          }}
                        >
                          {story.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              margin: '20px 0',
            }}>
              <FileSearch size={48} color="#2563EB" style={{ marginBottom: '16px', opacity: 0.85 }} />
              <h3 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                No stories found
              </h3>
              <p style={{ color: 'var(--ink-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '14px' }}>
                We couldn&apos;t find any stories matching &ldquo;{searchQuery}&rdquo;. Try searching for terms like <em>litchi</em>, <em>stadium</em>, <em>AI</em>, or <em>makhana</em>.
              </p>
              <button
                className="btn-primary"
                onClick={() => handleSearchChange('', 'all')}
              >
                View All Stories
              </button>
            </div>
          )}
        </section>
      ) : (
        /* Default Editorial Layout */
        <>
          {/* Top Picks Hero */}
          <HeroPicks
            featuredStory={featuredStory}
            sideStories={sideStories}
          />

          {/* Associated Brands Moving Ticker (Infinite Banner) */}
          <PartnerBrandsTicker />

          {/* Top Leaderboard Google AdSense / Sponsor Unit */}
          <GoogleAdSlot format="leaderboard" onInquire={handleOpenInquiry} />

          {/* Community Spotlight (Shown whenever user stories are published) */}
          {communityStories.length > 0 && (
            <section style={{ padding: '24px 0 44px', borderTop: '1px solid var(--line)' }}>
              <div className="section-head">
                <h2>
                  <span className="dot startup" style={{ background: '#10B981' }} />
                  <span>Community Stories · Just Published</span>
                </h2>
                <div className="sub">Direct contributions from Biharis and changemakers worldwide.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {communityStories.map((story) => (
                  <StoryCard key={story.id} story={story} isLead={true} />
                ))}
              </div>
            </section>
          )}

          {/* Category: Culture & Heritage */}
          <CategorySection
            category={getCategoryMeta('culture-heritage')}
            stories={getCategoryStories('culture-heritage')}
          />

          {/* Category: Education & Social */}
          <CategorySection
            category={getCategoryMeta('education-social')}
            stories={getCategoryStories('education-social')}
          />

          {/* Mid-Feed Display Google AdSense / Native Sponsor Unit */}
          <GoogleAdSlot format="inFeed" onInquire={handleOpenInquiry} />

          {/* Featured Brand Ads & Sourcing Catalog Strip */}
          <BrandAdsStrip onInquire={handleOpenInquiry} />

          {/* Community Video Highlight Strip */}
          <CommunityStrip />

          {/* Category: Entrepreneurship & Startups */}
          <CategorySection
            category={getCategoryMeta('entrepreneurship-startups')}
            stories={getCategoryStories('entrepreneurship-startups')}
          />

          {/* Flagship MSME Business Community Banner (seller.frootex.com) */}
          <MsmeCommunityBanner onInquire={handleOpenInquiry} />

          {/* Category: Industry & Innovation */}
          <CategorySection
            category={getCategoryMeta('industry-innovation')}
            stories={getCategoryStories('industry-innovation')}
          />

          {/* Category: Sports */}
          <CategorySection
            category={getCategoryMeta('sports')}
            stories={getCategoryStories('sports')}
          />

          {/* Category: Investments & Economic */}
          <CategorySection
            category={getCategoryMeta('investments-economic')}
            stories={getCategoryStories('investments-economic')}
          />

          {/* Title-Only "Recent Posts" Section for Articles Without Valid Images */}
          <RecentPostsSection stories={articlesWithoutImages} />

          {/* Commercial Solutions & Services Showcase */}
          <ServicesShowcase onInquire={handleOpenInquiry} />

          {/* 1-Click Weekly Intelligence Briefing (Newsletter & WhatsApp) */}
          <NewsletterStrip />

          {/* About Bihar Say: Traffic, Impressions & Founder Card */}
          <AboutImpact onInquire={handleOpenInquiry} />

          {/* Sidebar Widget Strip */}
          <WidgetStrip
            topStories={topStories}
            popularStories={popularStories}
          />
        </>
      )}

      {/* Floating Action Button for Brand Partnerships */}
      <PartnerFloatingFAB onOpen={() => handleOpenInquiry('founder-story')} />

      {/* Interactive Business Lead Generation Modal */}
      <BusinessInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultService={inquiryService}
      />
    </>
  );
}
