import Link from 'next/link';
import { Fragment } from 'react';
import { getEpisodes, SITE } from '@/lib/sheets';

export const revalidate = 3600;

export const metadata = {
  title: 'The Law Firm Growth Show | Free Marketing Podcast',
  description: 'The Law Firm Growth Show: weekly episodes covering SEO, social media, AI tools, and lead generation for law firm owners. New episodes every week. Listen free.',
  alternates: { canonical: '/podcast' },
};

// Episodes whose tightly-cropped headshots need top-anchored crop
// (default 30%-down crop chops off foreheads on these specific photos).
const TOP_CROP_EPISODES = new Set([2, 4, 10]);

const PODCAST_CSS = `
/* ── PAGE HERO ──────────────────────────────────────────── */
.page-hero{background:var(--brown3);padding:64px 0 56px;position:relative;overflow:hidden}
.page-hero::before{content:'';position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=60') center/cover no-repeat;opacity:.06;pointer-events:none}
.page-hero .container{position:relative;z-index:2}
.breadcrumb{font-size:.75rem;color:rgba(255,255,255,.35);margin-bottom:18px}
.breadcrumb a{color:rgba(255,255,255,.35);transition:color .2s}
.breadcrumb a:hover{color:var(--gold3)}
.page-hero h1{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.9rem,4vw,3rem);font-weight:900;color:#fff;line-height:1.2;margin:10px 0 14px;max-width:760px}
.page-hero p{font-size:.96rem;color:rgba(255,255,255,.6);max-width:600px;line-height:1.75}
.label{display:inline-flex;align-items:center;gap:8px;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold2);margin-bottom:10px}
.label::before{content:'';display:inline-block;width:24px;height:2px;background:var(--gold)}
.page-hero .label{color:var(--gold3)}
.page-hero .label::before{background:var(--gold3)}
.btn-lg{padding:16px 36px;font-size:1rem}
.btn-secondary:hover{transform:translateY(-2px)}

/* ── SECTIONS ───────────────────────────────────────────── */
.section{padding:80px 0}
.section-light{background:rgba(96,39,15,.13)}
.section-intro{text-align:center;max-width:720px;margin:0 auto 52px}
.section-intro h2{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.6rem,3vw,2.4rem);font-weight:900;color:var(--brown3);margin:8px 0 14px;line-height:1.25}
.section-intro p{font-size:.92rem;color:var(--muted);line-height:1.75}
main h2{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:900;color:var(--brown3);line-height:1.25;margin-bottom:16px}
main h3{font-family:var(--font-serif),Georgia,serif;font-size:1.15rem;font-weight:900;color:var(--brown3);margin-bottom:10px;line-height:1.3}
main h4{font-size:.95rem;font-weight:700;color:var(--warm);margin-bottom:8px}
main p{font-size:.9rem;color:var(--muted);line-height:1.78;margin-bottom:12px}
main p:last-child{margin-bottom:0}

/* ── GRIDS ──────────────────────────────────────────────── */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}

/* ── CARDS ──────────────────────────────────────────────── */
.card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px 28px;transition:box-shadow .25s,transform .25s}
.card:hover{box-shadow:0 12px 40px rgba(58,13,0,.1);transform:translateY(-4px)}

/* ── CTA SECTION ────────────────────────────────────────── */
.cta-section{background:var(--brown3);padding:80px 0;text-align:center;position:relative;overflow:hidden}
.cta-section::before{content:'LAW';position:absolute;right:-20px;bottom:-24px;font-family:var(--font-serif),Georgia,serif;font-size:clamp(6rem,18vw,14rem);font-weight:900;color:rgba(255,255,255,.04);line-height:1;pointer-events:none}
.cta-inner{position:relative;z-index:2}
.cta-inner h2{color:#fff}
.cta-inner p{color:rgba(255,255,255,.6);max-width:560px;margin:0 auto 32px;font-size:.95rem;line-height:1.75}
.cta-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:32px}
.cta-actions .btn-primary{background:var(--gold);color:#fff}
.cta-actions .btn-primary:hover{background:var(--gold2)}

/* ── EPISODE PHOTO GRID ─────────────────────────────────── */
.ep-photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:start}
.ep-photo-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:transform .3s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease);position:relative}
.ep-photo-card:hover{transform:translateY(-6px);box-shadow:0 22px 48px rgba(58,13,0,.16);border-color:rgba(196,154,10,.35)}
.ep-photo-card.is-new{border-color:rgba(196,154,10,.45);box-shadow:0 6px 18px rgba(196,154,10,.08)}
.ep-photo-card.is-new:hover{box-shadow:0 22px 56px rgba(196,154,10,.22)}

.ep-photo-img{position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,var(--brown),var(--brown3));overflow:hidden}
.ep-photo-img img{width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;transition:transform .5s var(--ease)}
.ep-photo-card:hover .ep-photo-img img{transform:scale(1.04)}
.ep-photo-img::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(58,13,0,.55) 100%);pointer-events:none}
.ep-photo-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--gold3);font-family:var(--font-serif),Georgia,serif;font-weight:900;font-size:2.4rem;letter-spacing:.04em}

.ep-photo-num{position:absolute;left:14px;bottom:12px;z-index:2;font-size:.66rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:rgba(58,13,0,.78);backdrop-filter:blur(6px);border:1px solid rgba(196,154,10,.5);border-radius:100px;padding:5px 12px}
.ep-photo-flag{position:absolute;right:12px;top:12px;z-index:2;font-size:.6rem;font-weight:900;letter-spacing:.16em;color:var(--brown3);background:linear-gradient(135deg,var(--gold3),var(--gold));border-radius:4px;padding:4px 10px;box-shadow:0 4px 12px rgba(196,154,10,.4);text-transform:uppercase}

.ep-photo-body{padding:20px 22px 22px;display:flex;flex-direction:column;flex:1}
.ep-photo-meta{font-size:.66rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold2);margin-bottom:8px}
.ep-photo-title{font-family:var(--font-serif),Georgia,serif;font-size:1rem;font-weight:900;color:var(--brown3);line-height:1.35;margin:0 0 12px;flex-grow:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ep-photo-by{font-size:.78rem;color:var(--muted);font-weight:500;margin-bottom:12px;display:flex;align-items:center;gap:6px}
.ep-photo-cta{font-size:.78rem;font-weight:700;color:var(--brown);padding-top:12px;border-top:1px solid var(--border);display:inline-flex;align-items:center;gap:5px;transition:color .2s,gap .2s}
.ep-photo-cta span{transition:transform .25s var(--ease)}
.ep-photo-card:hover .ep-photo-cta{color:var(--gold2)}
.ep-photo-card:hover .ep-photo-cta span{transform:translateX(4px)}
/* ── Play button on thumbnail (bottom-right) ── */
.ep-play-btn{position:absolute;bottom:14px;right:14px;z-index:2;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s;box-shadow:0 4px 12px rgba(0,0,0,.2)}
.ep-photo-card:hover .ep-play-btn{transform:scale(1.1);background:#fff}
.ep-play-btn svg{width:14px;height:14px;fill:var(--brown);margin-left:2px}

.ep-card-preview{display:flex;flex-direction:column;flex:1}

@media(max-width:900px){.ep-photo-grid{grid-template-columns:repeat(2,1fr);gap:18px}}
@media(max-width:520px){.ep-photo-grid{grid-template-columns:1fr}.ep-photo-body{padding:18px 18px 20px}}

/* ── GUEST FORM ─────────────────────────────────────────── */
.g-label{display:block;font-size:.82rem;font-weight:600;color:var(--warm);margin-bottom:6px}
.g-input{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:.9rem;outline:none;transition:border-color .2s;background:#fff}
.g-input:focus{border-color:var(--brown)}
textarea.g-input{resize:vertical;min-height:100px}

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media(max-width:900px){
  .grid-2{grid-template-columns:1fr;gap:28px}
  .grid-3{grid-template-columns:1fr 1fr;gap:20px}
  .section{padding:56px 0}
  .cta-section{padding:56px 0}
}
@media(max-width:600px){
  .grid-3{grid-template-columns:1fr}
  .page-hero{padding:48px 0 40px}
  .cta-actions{flex-direction:column;align-items:center}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

/* ── Marquee Ticker ──────────────────────────────────────── */
.ticker-wrap{background:var(--brown3);border-top:1px solid rgba(196,154,10,.25);border-bottom:1px solid rgba(196,154,10,.25);overflow:hidden;padding:0;position:relative}
.ticker-wrap::before,.ticker-wrap::after{content:'';position:absolute;top:0;width:80px;height:100%;z-index:2;pointer-events:none}
.ticker-wrap::before{left:0;background:linear-gradient(to right,var(--brown3),transparent)}
.ticker-wrap::after{right:0;background:linear-gradient(to left,var(--brown3),transparent)}
.ticker-track{display:flex;width:max-content;animation:ticker-scroll 28s linear infinite}
.ticker-track:hover{animation-play-state:paused}
@keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker-item{display:inline-flex;align-items:center;gap:9px;padding:13px 24px;white-space:nowrap;font-size:.78rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:rgba(255,255,255,.85)}
.ticker-item svg{flex-shrink:0;opacity:.9}
.ticker-item .t-text{color:rgba(255,255,255,.9)}
.ticker-sep{color:var(--gold);opacity:.5;font-size:.65rem;padding:0 4px;align-self:center}
`;

function EpisodeCard({ ep }) {
  const isNew = ep.number >= 21;
  const speakerCount = ep.speakersList.length;
  const isPanel = speakerCount > 1;
  const photo = ep.photoUrl;
  const initials = (ep.guest_name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const byLine = isPanel ? `Panel of ${speakerCount - 1}` : (ep.guest_name || 'Dominate Law');
  const byIcon = isPanel ? '👥' : '👤';
  const meta = [ep.dateLabel, ep.category, ep.duration].filter(Boolean).join(' · ');
  const imgStyle = TOP_CROP_EPISODES.has(ep.number)
    ? { objectFit: 'contain', objectPosition: 'center top', background: 'linear-gradient(135deg,var(--brown),var(--brown3))' }
    : undefined;

  return (
    <Link
      href={`/podcast-episode/${ep.slug}`}
      className={`ep-photo-card${isNew ? ' is-new' : ''}`}
      aria-label={`Ep ${ep.episode}: ${ep.title}`}
    >
      <div className="ep-photo-img">
        {photo && <img src={photo} alt={ep.title} loading="lazy" style={imgStyle} />}
        <div className="ep-photo-fallback" style={photo ? { display: 'none' } : undefined}>{initials}</div>
        <span className="ep-photo-num">Ep {ep.episode}</span>
        {isNew && <span className="ep-photo-flag">NEW</span>}
        <div className="ep-play-btn" aria-hidden="true">
          <svg viewoox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <div className="ep-photo-body">
        <div className="ep-card-preview">
          {meta && <div className="ep-photo-meta">{meta}</div>}
          <h3 className="ep-photo-title">{ep.title}</h3>
          <div className="ep-photo-by"><span>{byIcon}</span>&nbsp;{byLine}</div>
          <span className="ep-photo-cta">Listen Now <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </Link>
  );
}

function Ticker({ count }) {
  const items = [
    {
      svg: (
        <svg width="15" height="15" viewoox="0 0 24 24" fill="none" stroke="#C49A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" /></svg>
      ),
      text: `${count} Episodes`,
    },
    {
      svg: (
        <svg width="15" height="15" viewoox="0 0 24 24" fill="none" stroke="#C49A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21" /><path d="M3 7h3l3 10 3-10 3 10 3-10h3" /><line x1="3" y1="21" x2="21" y2="21" /></svg>
      ),
      text: 'Attorney Interviews',
    },
    {
      svg: (
        <svg width="15" height="15" viewoox="0 0 24 24" fill="none" stroke="#C49A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
      ),
      text: 'Empowering Attorneys as Entrepreneurs',
    },
    {
      svg: (
        <svg width="15" height="15" viewoox="0 0 24 24" fill="none" stroke="#C49A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
      ),
      text: '100% Free',
    },
    {
      svg: (
        <svg width="15" height="15" viewoox="0 0 24 24" fill="none" stroke="#C49A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
      ),
      text: 'The Law Firm Growth Show',
    },
  ];
  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map(set => (
          <Fragment key={set}>
            {items.map((item, i) => (
              <Fragment key={i}>
                <span className="ticker-item">{item.svg}<span className="t-text">{item.text}</span></span>
                <span className="ticker-sep">◆</span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default async function PodcastPage() {
  const episodes = await getEpisodes(); // newest first

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'PodcastSeries',
        name: 'The Law Firm Growth Show',
        url: `${SITE.url}/podcast`,
        description: 'Weekly podcast covering SEO, social media, AI tools, and lead generation for law firm owners.',
        author: { '@id': `${SITE.url}/#organization` },
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Podcast', item: `${SITE.url}/podcast` },
        ],
      },
    ],
  };

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: PODCAST_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link> › Podcast</nav>
          <span className="label">Empowering Attorneys as Entrepreneurs</span>
          <h1>Dominate Law Podcast Show</h1>
          <p>Real conversations with attorneys, legal innovators, and industry leaders sharing their journeys, strategies, and hard-won lessons on building a thriving law practice.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <a href="#episodes" className="btn btn-primary">Listen to Episodes →</a>
            <a href="#subscribe" className="btn btn-secondary">Subscribe Free →</a>
          </div>
        </div>
      </section>

      <Ticker count={episodes.length} />

      <section className="section" id="episodes" aria-labelledby="episodes-heading">
        <div className="container">
          <div className="section-intro">
            <span className="label">All Episodes</span>
            <h2 id="episodes-heading">Dominate Law Podcast Show</h2>
            <p>{episodes.length} episodes featuring attorneys, entrepreneurs, and legal industry leaders — sharing their stories, strategies, and insights on building a dominant law practice.</p>
          </div>
          <div className="ep-photo-grid" id="episodes-grid">
            {episodes.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted)' }}>No episodes found.</p>
            )}
            {episodes.map(ep => <EpisodeCard ep={ep} key={ep.slug} />)}
          </div>
        </div>
      </section>

      <section className="section section-light" id="subscribe" aria-labelledby="subscribe-heading">
        <div className="container">
          <div className="section-intro">
            <span className="label">Subscribe</span>
            <h2 id="subscribe-heading">Never Miss an Episode</h2>
            <p>Subscribe on your favorite platform and get notified the moment a new episode drops.</p>
          </div>
          <div className="grid-2" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center', opacity: 0.7, cursor: 'default' }}>
              <div style={{ marginoottom: 12 }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewoox="0 0 24 24" width="40" height="40" style={{ margin: '0 auto' }}>
                  <defs>
                    <linearGradient id="apg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F452FF" />
                      <stop offset="100%" stopColor="#832oC1" />
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="5.5" fill="url(#apg)" />
                  <path d="M12 4.8c-3.1 0-5.5 2.56-5.5 5.72 0 2.33 1.35 4.36 3.32 5.3v1.3c0 .49.36.88.84.88H13.34c.48 0 .84-.39.84-.88v-1.3C16.15 14.88 17.5 12.85 17.5 10.52 17.5 7.36 15.1 4.8 12 4.8z" fill="white" />
                  <path d="M10.5 17.12h3v1.5c0 .27-.22.48-.5.48h-2c-.28 0-.5-.21-.5-.48v-1.5z" fill="rgba(255,255,255,0.7)" />
                  <circle cx="12" cy="10.5" r="2" fill="rgba(255,255,255,0.9)" />
                  <circle cx="12" cy="10.5" r=".8" fill="#832oC1" />
                </svg>
              </div>
              <strong style={{ display: 'block', marginoottom: 6, color: 'var(--brown)' }}>Apple Podcasts</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Coming Soon</span>
            </div>
            <div className="card" style={{ textAlign: 'center', opacity: 0.7, cursor: 'default' }}>
              <div style={{ marginoottom: 12 }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewoox="0 0 24 24" width="40" height="40" style={{ margin: '0 auto' }}>
                  <circle cx="12" cy="12" r="12" fill="#1Do954" />
                  <path d="M17.25 16.2c-.2.33-.64.43-.97.22-2.66-1.63-6.01-2-9.96-1.1-.38.09-.76-.15-.85-.53-.09-.38.15-.76.53-.85 4.32-1 8.01-.57 11 1.29.33.2.43.64.25.97zm1.16-2.6c-.25.41-.79.54-1.2.29-3.04-1.87-7.68-2.42-11.28-1.32-.47.14-.96-.13-1.1-.59-.14-.46.13-.96.59-1.1 4.11-1.25 9.22-.64 12.7 1.52.41.25.54.79.29 1.2zm.1-2.7c-3.65-2.17-9.67-2.37-13.15-1.31-.56.17-1.15-.14-1.32-.7-.17-.56.14-1.15.7-1.32 4-1.22 10.64-.98 14.84 1.52.51.3.68.96.38 1.47-.3.51-.96.67-1.47.34z" fill="white" />
                </svg>
              </div>
              <strong style={{ display: 'block', marginoottom: 6, color: 'var(--brown)' }}>Spotify</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Coming Soon</span>
            </div>
            <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ marginoottom: 12 }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewoox="0 0 24 24" width="40" height="40" style={{ margin: '0 auto' }}>
                  <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.46A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.46a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8z" fill="#FF0000" />
                  <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white" />
                </svg>
              </div>
              <strong style={{ display: 'block', marginoottom: 6, color: 'var(--brown)' }}>YouTube</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Watch on YouTube</span>
            </a>
            <div className="card" style={{ textAlign: 'center', opacity: 0.7, cursor: 'default' }}>
              <div style={{ marginoottom: 12 }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewoox="0 0 24 24" width="40" height="40" style={{ margin: '0 auto' }}>
                  <rect width="24" height="24" rx="5" fill="#F26522" />
                  <circle cx="6.5" cy="17.5" r="2" fill="white" />
                  <path d="M4.5 11.5a8 8 0 0 1 8 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M4.5 6.5a13 13 0 0 1 13 13" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <strong style={{ display: 'block', marginoottom: 6, color: 'var(--brown)' }}>RSS Feed</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="guest-heading">
        <div className="container" style={{ maxWidth: 680 }}>
          <div className="section-intro">
            <span className="label">Be a Guest</span>
            <h2 id="guest-heading">Are You a Legal Industry Expert?</h2>
            <p>We&rsquo;re always looking for attorneys, consultants, and legal marketing experts with valuable insights to share with our audience. Apply to be a guest below.</p>
          </div>
          <form action="/guest-speaker" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 12, padding: 32 }}>
            <div className="grid-2" style={{ gap: 16, marginoottom: 16 }}>
              <div>
                <label className="g-label" htmlFor="g-name">Your Name</label>
                <input id="g-name" className="g-input" type="text" placeholder="First Last" required />
              </div>
              <div>
                <label className="g-label" htmlFor="g-email">Email Address</label>
                <input id="g-email" className="g-input" type="email" placeholder="you@lawfirm.com" required />
              </div>
            </div>
            <div style={{ marginoottom: 16 }}>
              <label className="g-label" htmlFor="g-expertise">Area of Expertise</label>
              <input id="g-expertise" className="g-input" type="text" placeholder="e.g., Family Law SEO, Legal Technology, Podcast Marketing" required />
            </div>
            <div style={{ marginoottom: 20 }}>
              <label className="g-label" htmlFor="g-topic">Proposed Topic</label>
              <textarea id="g-topic" className="g-input" placeholder="What would you like to discuss on the show?" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Submit Guest Application →</button>
          </form>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Want Expert Help Launching Your Own Podcast?</h2>
          <p>Our team can help you plan, launch, and grow a law firm podcast that positions you as the go-to attorney in your market. Book a consultation to learn how.</p>
          <div className="cta-actions">
            <Link href="/contact" className="btn btn-primary btn-lg">Book a Consultation →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
