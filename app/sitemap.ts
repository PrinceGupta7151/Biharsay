import { MetadataRoute } from 'next';
import { getAllStories } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://biharsay.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const stories = await getAllStories();
    const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
      url: `${baseUrl}/#${story.categorySlug || 'stories'}`,
      lastModified: story.createdAt ? new Date(story.createdAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...storyRoutes];
  } catch (e) {
    return staticRoutes;
  }
}
