export type CategorySlug = 
  | 'investments-economic'
  | 'culture-heritage'
  | 'education-social'
  | 'entrepreneurship-startups'
  | 'industry-innovation'
  | 'sports';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  subtitle?: string;
  tagline?: string;
  dotClass?: string;
  color?: string;
  iconName?: string;
  accentColor?: string;
}

export type CategoryMeta = CategoryInfo;

export interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  categorySlug: CategorySlug;
  date?: string;
  author?: string;
  imageUrl?: string;
  isLead?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  readTime?: string;
  views?: number;
  legacyId?: number;
  createdAt?: string;

  // Additional fields from seed stories & scrapers
  publishedDate?: string;
  readingTimeMinutes?: number;
  authorName?: string;
  categoryName?: string;
  likesCount?: number;
  viewsCount?: number;
  url?: string;
  isHero?: boolean;
  isTrending?: boolean;
  isEditorPick?: boolean;
  [key: string]: any;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  createdAt?: string;
}

export interface StorySubmission {
  id?: string;
  title: string;
  category: string;
  categorySlug: CategorySlug;
  content: string;
  authorName: string;
  authorEmail: string;
  userId?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface StoryComment {
  id?: string;
  storyId: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  content: string;
  createdAt: string;
}

export interface StoryReactions {
  storyId: string;
  likesCount: number;
  likedBy: string[];
}
