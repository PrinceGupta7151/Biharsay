import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { INITIAL_STORIES } from '@/data/seedStories';
import { Story, StorySubmission, CategorySlug, StoryComment, StoryReactions } from '@/types';

const STORIES_COLLECTION = 'stories';
const SUBMISSIONS_COLLECTION = 'submissions';
const BOOKMARKS_COLLECTION = 'bookmarks';
const COMMENTS_COLLECTION = 'comments';
const REACTIONS_COLLECTION = 'story_reactions';

// In-memory fallback for user submissions when running offline/demo
let localSubmissions: StorySubmission[] = [];
let localComments: StoryComment[] = [];
let localReactions: Record<string, { likesCount: number; likedBy: string[] }> = {};

const BROKEN_IMG_MAP: Record<string, string> = {
  'photo-1523050854058-8df90110c9f1': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  'Bihar-Say-Website-40.png': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  'photo-1508098682722-e99c43a406b2': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
};

export function sanitizeStory(story: Story): Story {
  if (!story) return story;
  let img = story.imageUrl || '';
  for (const [broken, replacement] of Object.entries(BROKEN_IMG_MAP)) {
    if (img.includes(broken)) {
      img = replacement;
      break;
    }
  }
  let title = story.title ? story.title.replace(/13[kK]/g, '15K').replace(/13,000/g, '15,000') : story.title;
  let summary = story.summary ? story.summary.replace(/13[kK]/g, '15K').replace(/13,000/g, '15,000') : story.summary;
  return { ...story, title, summary, imageUrl: img };
}

/**
 * Fetch all stories from Firestore, falling back to rich local seed data.
 */
export async function getAllStories(): Promise<Story[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, STORIES_COLLECTION));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const rawStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        const stories = rawStories.map(sanitizeStory);
        
        // Sort stories chronologically
        return stories.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      }
      // If Firestore collection is empty, seed it
      await seedFirestoreStories();
    } catch (err) {
      console.warn('Firestore fetch failed, using curated seed stories:', err);
    }
  }
  return INITIAL_STORIES.map(sanitizeStory);
}

/**
 * Seed Firestore with initial rich stories if empty.
 */
export async function seedFirestoreStories(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const colRef = collection(db, STORIES_COLLECTION);
    for (const story of INITIAL_STORIES) {
      const docRef = doc(colRef, story.id);
      await setDoc(docRef, {
        ...story,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }
    console.log('Seeded Firestore with initial Bihar Say stories.');
  } catch (err) {
    console.error('Error seeding stories to Firestore:', err);
  }
}

/**
 * Get single story by ID.
 */
export async function getStoryById(id: string): Promise<Story | null> {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, STORIES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return sanitizeStory({ id: snapshot.id, ...snapshot.data() } as Story);
      }
    } catch (err) {
      console.warn(`Firestore getStoryById(${id}) fallback:`, err);
    }
  }
  const found = INITIAL_STORIES.find(s => s.id === id);
  return found ? sanitizeStory(found) : null;
}

/**
 * Get stories by category.
 */
export async function getStoriesByCategory(categorySlug: CategorySlug): Promise<Story[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, STORIES_COLLECTION),
        where('categorySlug', '==', categorySlug)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const rawStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        const stories = rawStories.map(sanitizeStory);
        return stories.sort((a, b) => {
          const isUserA = a.id.startsWith('user-story') || a.id.startsWith('local');
          const isUserB = b.id.startsWith('user-story') || b.id.startsWith('local');
          if (isUserA && !isUserB) return -1;
          if (!isUserA && isUserB) return 1;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      }
    } catch (err) {
      console.warn(`Firestore category query for ${categorySlug} fallback:`, err);
    }
  }
  return INITIAL_STORIES.filter(s => s.categorySlug === categorySlug).map(sanitizeStory);
}

/**
 * Submit a community story to Firestore.
 * Submissions default to 'pending' and require editorial approval before appearing in public feeds.
 */
export async function submitStory(submission: Omit<StorySubmission, 'createdAt' | 'status'>): Promise<string> {
  const fullSubmission: StorySubmission = {
    ...submission,
    createdAt: new Date().toISOString(),
    status: 'pending', // Pending editorial moderation before publishing
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
        ...fullSubmission,
        serverTimestamp: serverTimestamp(),
      });
      // Story stays in SUBMISSIONS_COLLECTION with status 'pending'
      // until reviewed and approved by Bihar Say editorial moderation.
      return docRef.id;
    } catch (err) {
      console.warn('Failed saving submission to Firestore, saving to local state:', err);
    }
  }

  // Fallback local persistence (held in pending submissions list)
  localSubmissions.push(fullSubmission);
  const localId = `pending-local-${Date.now()}`;
  return localId;
}

/**
 * Editorial helper: Approve a pending community submission and publish it to the live feed.
 */
export async function approveStorySubmission(submissionId: string): Promise<boolean> {
  if (isFirebaseConfigured() && db) {
    try {
      const subDocRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      const subSnap = await getDoc(subDocRef);
      if (!subSnap.exists()) return false;

      const data = subSnap.data() as StorySubmission;
      const storyId = `story-${submissionId}`;

      // Mark submission as approved
      await updateDoc(subDocRef, { status: 'approved' });

      // Publish to public stories collection
      await setDoc(doc(db, STORIES_COLLECTION, storyId), {
        id: storyId,
        title: data.title,
        summary: data.content.slice(0, 160) + '...',
        content: data.content,
        category: data.category,
        categorySlug: data.categorySlug,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: data.authorName,
        readTime: '3 min read',
        views: 1,
        imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error('Error approving story submission:', err);
      return false;
    }
  }
  return false;
}

/**
 * Toggle bookmark for an authenticated user.
 */
export async function toggleBookmark(userId: string, storyId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  // Local storage cache for instant UI feedback
  const storageKey = `biharsay_bookmarks_${userId}`;
  const raw = localStorage.getItem(storageKey);
  const bookmarks: string[] = raw ? JSON.parse(raw) : [];
  const exists = bookmarks.includes(storyId);
  const updated = exists ? bookmarks.filter(id => id !== storyId) : [...bookmarks, storyId];
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // Sync with Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${storyId}`);
      if (exists) {
        await setDoc(bookmarkRef, { active: false }, { merge: true });
      } else {
        await setDoc(bookmarkRef, {
          userId,
          storyId,
          active: true,
          savedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Bookmark sync with Firestore fallback:', err);
    }
  }

  return !exists;
}

export function getUserBookmarks(userId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`biharsay_bookmarks_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Fetch all comments for an article from Firestore.
 */
export async function getStoryComments(storyId: string): Promise<StoryComment[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('storyId', '==', storyId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryComment));
        return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn(`Error fetching comments for ${storyId} from Firestore:`, err);
    }
  }

  // Fallback to local comments
  return localComments
    .filter(c => c.storyId === storyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Post a new comment to an article in Firestore.
 */
export async function addStoryComment(comment: Omit<StoryComment, 'id' | 'createdAt'>): Promise<StoryComment> {
  const newComment: StoryComment = {
    ...comment,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
        ...newComment,
        serverTimestamp: serverTimestamp(),
      });
      return { id: docRef.id, ...newComment };
    } catch (err) {
      console.warn('Failed to save comment to Firestore, saving to local memory:', err);
    }
  }

  const localId = `local-comm-${Date.now()}`;
  const fullLocalComment: StoryComment = { id: localId, ...newComment };
  localComments.push(fullLocalComment);
  return fullLocalComment;
}

/**
 * Get story likes/claps count and whether the current user liked it.
 */
export async function getStoryReactions(storyId: string, currentUserId?: string): Promise<{ likesCount: number; isLiked: boolean }> {
  // Base count seeded from story views or default
  const baseLikes = 12;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, REACTIONS_COLLECTION, storyId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const likedBy: string[] = data.likedBy || [];
        return {
          likesCount: (data.likesCount || 0) + baseLikes,
          isLiked: currentUserId ? likedBy.includes(currentUserId) : false,
        };
      }
    } catch (err) {
      console.warn(`Firestore getStoryReactions fallback for ${storyId}:`, err);
    }
  }

  const local = localReactions[storyId];
  if (local) {
    return {
      likesCount: local.likesCount + baseLikes,
      isLiked: currentUserId ? local.likedBy.includes(currentUserId) : false,
    };
  }

  return {
    likesCount: baseLikes,
    isLiked: false,
  };
}

/**
 * Toggle like/clap on a story.
 */
export async function toggleStoryLike(storyId: string, userId: string): Promise<{ likesCount: number; isLiked: boolean }> {
  const baseLikes = 12;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, REACTIONS_COLLECTION, storyId);
      const snapshot = await getDoc(docRef);
      let likedBy: string[] = [];
      let likesCount = 0;

      if (snapshot.exists()) {
        const data = snapshot.data();
        likedBy = data.likedBy || [];
        likesCount = data.likesCount || 0;
      }

      const alreadyLiked = likedBy.includes(userId);
      const updatedLikedBy = alreadyLiked 
        ? likedBy.filter(id => id !== userId) 
        : [...likedBy, userId];
      const updatedCount = alreadyLiked ? Math.max(0, likesCount - 1) : likesCount + 1;

      await setDoc(docRef, {
        storyId,
        likesCount: updatedCount,
        likedBy: updatedLikedBy,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return {
        likesCount: updatedCount + baseLikes,
        isLiked: !alreadyLiked,
      };
    } catch (err) {
      console.warn('Failed to update reaction in Firestore, updating local state:', err);
    }
  }

  // Local fallback
  if (!localReactions[storyId]) {
    localReactions[storyId] = { likesCount: 0, likedBy: [] };
  }
  const local = localReactions[storyId];
  const alreadyLiked = local.likedBy.includes(userId);
  local.likedBy = alreadyLiked 
    ? local.likedBy.filter(id => id !== userId)
    : [...local.likedBy, userId];
  local.likesCount = alreadyLiked ? Math.max(0, local.likesCount - 1) : local.likesCount + 1;

  return {
    likesCount: local.likesCount + baseLikes,
    isLiked: !alreadyLiked,
  };
}

export interface BusinessInquiry {
  id?: string;
  service: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  message?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed';
}

const BUSINESS_QUERIES_COLLECTION = 'business_queries';

export async function saveBusinessInquiry(
  inquiry: Omit<BusinessInquiry, 'id' | 'createdAt' | 'status'>
): Promise<{ success: boolean; id: string }> {
  const newInquiry: BusinessInquiry = {
    ...inquiry,
    createdAt: new Date().toISOString(),
    status: 'new',
  };

  const localId = `query-${Date.now()}`;

  // Persist to Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, BUSINESS_QUERIES_COLLECTION), newInquiry);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.warn('Firestore business query failed, saving locally:', err);
    }
  }

  // Local fallback
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('biharsay_business_queries') || '[]');
      existing.unshift({ id: localId, ...newInquiry });
      localStorage.setItem('biharsay_business_queries', JSON.stringify(existing));
    } catch (e) {
      console.error('Local business query storage error:', e);
    }
  }

  return { success: true, id: localId };
}

export interface NewsletterSubscriber {
  id?: string;
  contact: string;
  channel: 'email' | 'whatsapp';
  createdAt: string;
  status: 'active' | 'unsubscribed';
}

const NEWSLETTER_COLLECTION = 'newsletter_subscribers';

export async function subscribeNewsletter(data: {
  contact: string;
  channel: 'email' | 'whatsapp';
}): Promise<{ success: boolean; id: string }> {
  const subscriber: NewsletterSubscriber = {
    contact: data.contact.trim(),
    channel: data.channel,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  const localId = `sub-${Date.now()}`;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, NEWSLETTER_COLLECTION), subscriber);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.warn('Firestore newsletter subscription failed, saving locally:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('biharsay_subscribers') || '[]');
      existing.unshift({ id: localId, ...subscriber });
      localStorage.setItem('biharsay_subscribers', JSON.stringify(existing));
    } catch (e) {
      console.error('Local subscriber storage error:', e);
    }
  }

  return { success: true, id: localId };
}
