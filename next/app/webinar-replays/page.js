import Link from 'next/link';
import { getReplays, SITE } from '@/lib/sheets';
import PaginatedGrid from '@/components/PaginatedGrid';

export const revalidate = 300;

const PAGE_SIZE = 9; // 3 rows of 3 cards per page

export const metadata = {
  title: 'Webinar Replays — On-Demand Law Firm Marketing Training',
  description: 'Watch on-demand replays of Dominate Law webinars: legal marketing training, AI adoption, and growth strategy sessions for law firm owners and attorneys.',
  alternates: { canonical: '/webinar-replays' },
};

export default async function ReplaysPage() {
  const replays = await getReplays();

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dominate Law Webinar Replays',
    itemListElement: replays.map((r, i) => ({
      '@type': 'ListItem', position: i + 1, name: r.title,
      url: `${SITE.url}/webinar-replays/${r.slug}`,
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <section className="page-hero">
        <div className="container">
          <span className="label">On-Demand Library</span>
          <h1>Webinar Replays</h1>
          <p style={{ color: 'rgba(255,255,255,.75)', maxWidth: 560, fontSize: '.92rem', lineHeight: 1.7 }}>
            Every masterclass and workshop we've run — free, on demand. Marketing, AI, and growth
            training built for law firm owners.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PaginatedGrid totalPages={Math.ceil(replays.length / PAGE_SIZE)}>
            {replays.map((r, i) => (
              <Link href={`/webinar-replays/${r.slug}`} className="card" key={r.slug} data-pg={Math.floor(i / PAGE_SIZE) + 1}>
                <div className="media-card-thumb">
                  {r.thumbnailUrl
                    ? <img src={r.thumbnailUrl} alt={r.title} loading="lazy" />
                    : r.vimeoId && <img src={`https://vumbnail.com/${r.vimeoId}.jpg`} alt={r.title} loading="lazy" />}
                  <div className="media-card-play"><span>▶</span></div>
                </div>
                <div className="media-card-body">
                  <div className="media-card-meta">
                    <span>Replay</span>
                    {r.dateLabel && <span>· {r.dateLabel}</span>}
                    {r.duration && <span>· {r.duration}</span>}
                  </div>
                  <h3 className="media-card-title">{r.title}</h3>
                  {r.speakersList.length > 0 && (
                    <p className="media-card-sub">{r.speakersList.map(s => s.name).join(' · ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </PaginatedGrid>
          {replays.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Replays are being prepared — check back soon.</p>
          )}
        </div>
      </section>
    </main>
  );
}
