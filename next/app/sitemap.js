import { getEpisodes, getReplays, SITE } from '@/lib/sheets';

// Sitemap is generated from the Google Sheet automatically —
// new episodes/replays appear without any manual edits.
export default async function sitemap() {
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/podcast', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/webinar-replays', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/events', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/tools', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/resources', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/community', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/reviews', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/guest-speaker', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/msm', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  ].map(p => ({
    url: `${SITE.url}${p.path}`,
    priority: p.priority,
    changeFrequency: p.changeFrequency,
    lastModified: new Date(),
  }));

  let episodes = [], replays = [];
  try { episodes = await getEpisodes(); } catch {}
  try { replays = await getReplays(); } catch {}

  const episodeUrls = episodes.map((ep, i) => ({
    url: `${SITE.url}/podcast-episode/${ep.slug}`,
    priority: i === 0 ? 0.9 : 0.8,
    changeFrequency: 'monthly',
    lastModified: ep.dateIso ? new Date(ep.dateIso) : new Date(),
  }));

  const replayUrls = replays.map(r => ({
    url: `${SITE.url}/webinar-replays/${r.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly',
    lastModified: r.dateIso ? new Date(r.dateIso) : new Date(),
  }));

  return [...staticPages, ...episodeUrls, ...replayUrls];
}
