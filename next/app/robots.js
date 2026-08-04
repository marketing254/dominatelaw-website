import { SITE } from '@/lib/sheets';

const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai',
  'PerplexityBot', 'CCBot', 'Google-Extended', 'cohere-ai', 'Applebot-Extended',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_BOTS.map(bot => ({ userAgent: bot, allow: '/' })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
