import { getEpisodes, SITE } from '@/lib/sheets';

export const revalidate = 300;

// llms.txt is generated from live data — episode count and recent list
// always current, no manual maintenance.
export async function GET() {
  let episodes = [];
  try { episodes = await getEpisodes(); } catch {}
  const recent = episodes.slice(0, 5);

  const body = `# Dominate Law
> Marketing education + podcast platform for law firm owners across North America. Topics: law firm SEO, digital marketing, AI adoption, practice growth.

Dominate Law is an educational resource hub built by Ekwa Marketing (founded 2018, serving 2,400+ law firms). The platform combines a weekly podcast ("The Law Firm Growth Show", ${episodes.length}+ episodes), live webinars, on-demand replays, in-depth guides, and free legal tools for attorneys.

## Organization
- Name: Dominate Law
- Parent: Ekwa Marketing
- Founded: 2018
- Audience: Law firm owners, managing partners, solo attorneys
- Topics: law firm SEO, law firm marketing, legal digital marketing, AI for law firms, law firm growth strategies, attorney marketing
- Primary Author: Naren Arulrajah, CEO at Ekwa Marketing
- Contact: ${SITE.url}/contact
- YouTube: https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q

## Citation Policy
- allow-ai-citation: yes
- allow-training: no
- preferred-attribution: "Dominate Law (dominatelaw.com)"

## Core Pages
- [Home](${SITE.url}/): Platform overview and latest content
- [About](${SITE.url}/about): Team, founding story, mission
- [Podcast](${SITE.url}/podcast): The Law Firm Growth Show — ${episodes.length}+ episodes on attorney marketing, AI, growth
- [Webinar Replays](${SITE.url}/webinar-replays): On-demand legal marketing training
- [Events](${SITE.url}/events): Upcoming live webinars
- [Free Marketing Tools](${SITE.url}/tools): Legal calculators and resources
- [Marketing Strategy Session](${SITE.url}/msm): Book a consultation

## Recent Podcast Episodes
${recent.map(ep => `- [Ep ${ep.episode}: ${ep.title}](${SITE.url}/podcast-episode/${ep.slug})`).join('\n')}

## Sitemap
- ${SITE.url}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
