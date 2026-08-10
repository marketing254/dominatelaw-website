import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEpisodes, getEpisodeBySlug, SITE } from '@/lib/sheets';
import GateForm from '@/components/GateForm';
import AudioPlayer from '@/components/AudioPlayer';
import MsmCta from '@/components/MsmCta';
import Transcript from '@/components/Transcript';
import { fetchTranscript, parseTranscript } from '@/lib/transcript';

export const revalidate = 300;

export async function generateStaticParams() {
  const episodes = await getEpisodes();
  return episodes.map(ep => ({ slug: ep.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const ep = await getEpisodeBySlug(slug);
  if (!ep) return { title: 'Episode Not Found' };
  const title = ep.title.length > 50 ? ep.title : `${ep.title} | Dominate Law`;
  const description = ep.parsed.keyPoints[0]
    ? ep.parsed.keyPoints[0].slice(0, 158)
    : `Episode ${ep.episode} of ${SITE.podcastName} — ${ep.title}.`;
  return {
    title,
    description,
    alternates: { canonical: `/podcast-episode/${ep.slug}` },
    openGraph: {
      title, description, type: 'article',
      url: `${SITE.url}/podcast-episode/${ep.slug}`,
      images: ep.posterUrl ? [ep.posterUrl] : ['/images/og-cover.jpg'],
    },
  };
}

export default async function EpisodePage({ params }) {
  const { slug } = await params;
  const ep = await getEpisodeBySlug(slug);
  if (!ep) notFound();

  const { keyPoints, keyPointGroups, bio, bioGuestName } = ep.parsed;
  const isPanel = ep.speakersList.length > 1;
  const episodes = await getEpisodes();
  const related = episodes.filter(e => e.slug !== ep.slug).slice(0, 3);

  // Transcript — fetched server-side so the full text is in the HTML (SEO/AI indexable)
  let transcript = null;
  if (ep.transcript_url) {
    const raw = await fetchTranscript(ep.transcript_url);
    if (raw) {
      transcript = parseTranscript(raw, {
        guestName: ep.guest_name,
        speakers: ep.speakersList,
        isNewFormat: ep.number >= 21,
      });
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: ep.title,
    url: `${SITE.url}/podcast-episode/${ep.slug}`,
    episodeNumber: ep.number,
    datePublished: ep.dateIso || undefined,
    description: keyPoints[0] || ep.title,
    associatedMedia: ep.audio_source ? { '@type': 'MediaObject', contentUrl: ep.audio_source } : undefined,
    partOfSeries: { '@type': 'PodcastSeries', name: SITE.podcastName, url: `${SITE.url}/podcast/` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Podcast', item: `${SITE.url}/podcast/` },
      { '@type': 'ListItem', position: 3, name: ep.title, item: `${SITE.url}/podcast-episode/${ep.slug}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <Link href="/podcast">Podcast</Link> / <span>Episode #{ep.episode}</span>
          </div>
          <h1>{ep.title}</h1>
          <div className="tags">
            <span className="ep-tag">🎙️ Episode {ep.episode}</span>
            {ep.dateLabel && <span className="ep-tag">📅 {ep.dateLabel}</span>}
            {isPanel
              ? <span className="ep-tag">👥 {ep.speakersList.filter(s => s.role !== 'host').length} Panelists</span>
              : ep.guest_name && <span className="ep-tag">👤 {ep.guest_name}</span>}
            {ep.category && <span className="ep-tag">🏷️ {ep.category}</span>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="ep-layout">
            <div>
              {/* Player (gated).
                  Routing: /embed/ links load as-is; directory.libsyn.com links
                  (which carry /id/NNN) build the Libsyn embed; direct MP3s
                  (traffic.libsyn.com or any .mp3) use the native audio player. */}
              <GateForm type="podcast" meta={{ episode: ep.episode, title: ep.title }}>
                {(() => {
                  const audio = ep.audio_source || '';
                  const libsynId = (audio.match(/\/id\/(\d+)/) || [])[1];
                  const isEmbed = audio.includes('/embed/');
                  const isDirectFile = /\.mp3(\?|$)/i.test(audio) || audio.includes('traffic.libsyn.com');
                  if (!audio) return <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Audio coming soon.</p>;
                  if (isEmbed || (libsynId && !isDirectFile)) {
                    const src = isEmbed
                      ? audio
                      : `https://play.libsyn.com/embed/episode/id/${libsynId}/height/90/theme/custom/thumbnail/no/direction/backward/render-playlist/no/custom-color/60270F`;
                    return (
                      <iframe
                        title={`Listen: ${ep.title}`}
                        src={src}
                        style={{ width: '100%', height: 90, border: 0, borderRadius: 12 }}
                        loading="lazy"
                      />
                    );
                  }
                  return <AudioPlayer src={audio} title={ep.title} />;
                })()}
              </GateForm>

              {/* Key points */}
              {(keyPointGroups.length > 0 || keyPoints.length > 0) && (
                <>
                  <h2 className="ep-content-heading">Key Discussion Points</h2>
                  {keyPointGroups.length > 0 ? (
                    keyPointGroups.map((g, i) => (
                      <div className="kp-group" key={i}>
                        <h3 className="kp-topic">{i + 1}. {g.topic}</h3>
                        {g.bullets.length > 0 && (
                          <ul className="kp-sublist">{g.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <ul className="flat-list">{keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  )}
                </>
              )}

              {/* Bio */}
              {bio.length > 0 && (
                <>
                  <h2 className="ep-content-heading">{isPanel ? 'Meet the Panel' : `More About ${bioGuestName || ep.guest_name}`}</h2>
                  <ul className="flat-list">{bio.map((b, i) => <li key={i}>{b}</li>)}</ul>
                </>
              )}

              <Transcript parsed={transcript} transcriptUrl={ep.transcript_url} />

              <MsmCta context={`Episode ${ep.episode}`} />
            </div>

            {/* Sidebar */}
            <aside className="ep-sidebar">
              {ep.speakersList.length > 0 && (
                <div className="sidebar-card">
                  <h4>{isPanel ? 'Panel' : 'Speakers'}</h4>
                  {ep.speakersList.map(s => (
                    <div className="speaker-row" key={s.speakerNum}>
                      <div className="speaker-avatar">{s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                      <div><strong>{s.name}</strong><span>{s.roleLabel}</span></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="sidebar-card">
                <h4>Keep Listening</h4>
                {related.map(r => (
                  <Link href={`/podcast-episode/${r.slug}`} key={r.slug} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--gold2)' }}>EP {r.episode}</span>
                    <span style={{ display: 'block', fontSize: '.83rem', fontWeight: 600, color: 'var(--brown3)', lineHeight: 1.45 }}>{r.title}</span>
                  </Link>
                ))}
                <Link href="/podcast" style={{ display: 'inline-block', marginTop: 14, fontSize: '.8rem', fontWeight: 700, color: 'var(--brown)' }}>
                  Browse all episodes →
                </Link>
              </div>
              <div className="sidebar-card" style={{ background: 'var(--brown3)', border: 'none' }}>
                <h4 style={{ color: 'var(--gold3)' }}>Watch on YouTube</h4>
                <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.6, marginBottom: 14 }}>
                  Prefer video? Episodes are also on our YouTube channel.
                </p>
                <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" className="btn btn-outline-w" style={{ fontSize: '.78rem', padding: '9px 16px' }}>
                  ▶ Dominate Law on YouTube
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
