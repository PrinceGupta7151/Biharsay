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
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const stories = await getAllStories();
    const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => {
      let cleanId = story.id;
      try {
        cleanId = decodeURIComponent(story.id);
      } catch {}
      return {
        url: `${baseUrl}/article/${encodeURIComponent(cleanId)}`,
        lastModified: story.createdAt ? new Date(story.createdAt) : new Date(),
        changeFrequency: 'weekly',
        priority: story.isFeatured ? 0.9 : 0.7,
      };
    });

    return [...staticRoutes, ...storyRoutes];
  } catch (e) {
    return staticRoutes;
  }
}
