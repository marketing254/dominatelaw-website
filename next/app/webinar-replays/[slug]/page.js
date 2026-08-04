import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReplays, getReplayBySlug, SITE } from '@/lib/sheets';
import GateForm from '@/components/GateForm';
import MsmCta from '@/components/MsmCta';

export const revalidate = 3600;

export async function generateStaticParams() {
  const replays = await getReplays();
  return replays.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = await getReplayBySlug(slug);
  if (!r) return { title: 'Replay Not Found' };
  const title = r.title.length > 45 ? `${r.title} | Webinar Replay` : `${r.title} | Webinar Replay | Dominate Law`;
  const description = (r.notes[0] || `Watch the on-demand replay of ${r.title} — free legal marketing training from Dominate Law.`).slice(0, 158);
  const ogImage = r.thumbnailUrl || (r.vimeoId ? `https://vumbnail.com/${r.vimeoId}.jpg` : `${SITE.url}/images/og-cover.jpg`);
  return {
    title, description,
    alternates: { canonical: `/webinar-replays/${r.slug}` },
    openGraph: { title, description, type: 'video.other', url: `${SITE.url}/webinar-replays/${r.slug}`, images: [ogImage] },
  };
}

export default async function ReplayPage({ params }) {
  const { slug } = await params;
  const r = await getReplayBySlug(slug);
  if (!r) notFound();

  const replays = await getReplays();
  const related = replays.filter(x => x.slug !== r.slug).slice(0, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: r.title,
    description: r.notes[0] || r.title,
    uploadDate: r.dateIso || undefined,
    thumbnailUrl: r.thumbnailUrl || (r.vimeoId ? `https://vumbnail.com/${r.vimeoId}.jpg` : undefined),
    embedUrl: r.embedUrl,
    publisher: { '@id': `${SITE.url}/#organization` },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <Link href="/webinar-replays">Webinar Replays</Link> / <span>{r.title}</span>
          </div>
          <h1>{r.title}</h1>
          <div className="tags">
            {r.dateLabel && <span className="ep-tag">📅 {r.dateLabel}</span>}
            {r.duration && <span className="ep-tag">⏱ {r.duration}</span>}
            {r.category && <span className="ep-tag">🏷️ {r.category}</span>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="ep-layout">
            <div>
              <GateForm
                type="webinar"
                meta={{ title: r.title, slug: r.slug, dateLabel: r.dateLabel, vimeoLink: r.vimeoLink }}
                poster={r.thumbnailUrl || (r.vimeoId ? `https://vumbnail.com/${r.vimeoId}.jpg` : '')}
              >
                <div className="video-frame">
                  <iframe src={r.embedUrl} title={r.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
                </div>
              </GateForm>

              {(r.noteGroups.length > 0 || r.notes.length > 0) && (
                <>
                  <h2 className="ep-content-heading">Key Takeaways</h2>
                  {r.noteGroups.length > 0 ? (
                    r.noteGroups.map((g, i) => (
                      <div className="kp-group" key={i}>
                        <h3 className="kp-topic">{i + 1}. {g.topic}</h3>
                        {g.bullets.length > 0 && (
                          <ul className="kp-sublist">{g.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <ul className="flat-list">{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                  )}
                </>
              )}

              <MsmCta context="this webinar" />
            </div>

            <aside className="ep-sidebar">
              {r.speakersList.length > 0 && (
                <div className="sidebar-card">
                  <h4>Speakers</h4>
                  {r.speakersList.map(s => (
                    <div className="speaker-row" key={s.speakerNum}>
                      <div className="speaker-avatar">{s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                      <div><strong>{s.name}</strong><span>{s.roleLabel}</span></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="sidebar-card">
                <h4>More Replays</h4>
                {related.map(x => (
                  <Link href={`/webinar-replays/${x.slug}`} key={x.slug} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontSize: '.83rem', fontWeight: 600, color: 'var(--brown3)', lineHeight: 1.45 }}>{x.title}</span>
                    {x.dateLabel && <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{x.dateLabel}</span>}
                  </Link>
                ))}
                <Link href="/webinar-replays" style={{ display: 'inline-block', marginTop: 14, fontSize: '.8rem', fontWeight: 700, color: 'var(--brown)' }}>
                  All replays →
                </Link>
              </div>
              <div className="sidebar-card">
                <h4>Join Us Live</h4>
                <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>
                  Don't just watch the replays — register for the next live session and ask your questions in real time.
                </p>
                <Link href="/events" className="btn btn-secondary" style={{ fontSize: '.78rem', padding: '9px 16px' }}>
                  Upcoming Events →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
