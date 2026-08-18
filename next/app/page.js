import Link from 'next/link';
import { getEpisodes } from '@/lib/sheets';
import HomePopup from '@/components/HomePopup';
import HomeExtras from '@/components/HomeExtras';

export const revalidate = 300;

export const metadata = {
  title: 'Law Firm Marketing Resources, Tools & Community | Dominate Law',
  description: 'Dominate Law: free legal calculators, marketing tools, expert webinars, a peer community, and a weekly podcast to help your law firm grow faster.',
  alternates: { canonical: '/' },
};

/* ─── FAQ content (matches the legacy FAQPage JSON-LD) ─────────────── */
const FAQS = [
  {
    q: 'How do I get more clients for my law firm?',
    a: 'The most effective strategies for law firms to attract more clients include local SEO optimization, Google Business Profile management, review generation, educational content marketing, and targeted social media. Dominate Law provides free tools and expert-led webinars to help attorneys implement these strategies.',
  },
  {
    q: 'What is the best marketing strategy for a law firm?',
    a: 'The best law firm marketing strategy combines local SEO to rank in Google Search and Maps, content marketing to build authority, social media for visibility, email nurturing to convert leads, and client reviews to build trust. A consistent multi-channel approach outperforms any single tactic.',
  },
  {
    q: 'What free marketing tools are available for attorneys?',
    a: 'Dominate Law offers 8 free legal calculators including a contingency fee calculator, billable hours tracker, statute of limitations checker, settlement estimator, and client lifetime value calculator — all free, no account required.',
  },
  {
    q: 'How much does law firm marketing cost?',
    a: 'Law firm marketing costs vary widely — from DIY strategies using free resources (like those on Dominate Law) to full-service agency retainers ranging from $2,000–$15,000/month. Ekwa Marketing offers a 30-minute strategy meeting to build a custom growth roadmap for your practice.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

/* ─── Episode card (legacy dlBuildEpisodeCard, unlocked variant) ───── */
const TOP_CROP_EPISODES = new Set([2, 4, 10]);

function initials(name) {
  return (name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function EpisodeCard({ ep }) {
  const n = ep.number;
  const isNew = n >= 21;
  const speakerCount = ep.speakersList ? ep.speakersList.length : 0;
  const isPanel = speakerCount > 1;
  const byLine = isPanel
    ? `Panel of ${ep.speakersList.filter(s => s.role !== 'host').length}`
    : (ep.guest_name || 'Dominate Law');
  const byIcon = isPanel ? '👥' : '👤';
  const meta = [ep.category, ep.dateLabel, ep.duration].filter(Boolean).join(' · ');
  const imgStyle = TOP_CROP_EPISODES.has(n)
    ? { objectFit: 'contain', objectPosition: 'center top', background: 'linear-gradient(135deg,var(--brown),var(--brown3))' }
    : undefined;

  return (
    <Link
      href={`/podcast-episode/${ep.slug}`}
      className={`ep-photo-card${isNew ? ' is-new' : ''}`}
      aria-label={`Ep ${ep.episode}: ${ep.title}`}
    >
      <div className="ep-photo-img">
        {ep.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ep.photoUrl} alt={ep.title} loading="lazy" style={imgStyle} />
        ) : (
          <div className="ep-photo-fallback">{initials(ep.guest_name)}</div>
        )}
        <span className="ep-photo-num">Ep {ep.episode}</span>
        {isNew && <span className="ep-photo-flag">NEW</span>}
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

/* ─── Marquee content ──────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  '⚖️ Legal Marketing', '📣 SEO for Law Firms', '⚙️ Practice Management', '💻 Legal Technology',
  '📈 Business Growth', '🤝 Client Experience', '💰 Finance & Billing', '🧠 Attorney Wellness',
];
const MARQUEE2_ITEMS = [
  'DOMINATE LAW', 'EKWA MARKETING', 'THE LAW FIRM GROWTH SHOW', '__SINCE_2018__',
  'FOR ATTORNEYS WHO LEAD', 'PODCASTS · EVENTS · COMMUNITY',
];

export default async function HomePage() {
  let episodes = [];
  try { episodes = await getEpisodes(); } catch (e) { /* sheet down — render page without episodes */ }
  const latest = episodes[0] || null;
  const latest6 = episodes.slice(0, 6);

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      <HomeExtras />
      <HomePopup latest={latest ? {
        slug: latest.slug,
        episode: latest.episode,
        title: latest.title,
        guest_name: latest.guest_name || '',
        speakers: latest.speakers || '',
        dateLabel: latest.dateLabel || '',
        photoUrl: latest.photoUrl || '',
      } : null} />

      {/* ═══ HERO ═════════════════════════════════════════════════ */}
      <section className="hero" id="home">
        <div className="wrap">
          <div className="hero-inner">

            {/* Left */}
            <div>
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-line" />
                For Attorneys Who Lead
              </div>
              <span className="hero-strike">Figuring It Out Alone</span>
              <h1>
                The Insights to <span className="accent">Run</span><br />
                Your <em>Firm.</em>
              </h1>
              <p className="hero-sub">
                Practical podcasts, expert-led events, and real-world strategies — everything lawyers need to lead a successful practice.
              </p>
              <div className="hero-actions">
                <Link href="/community" className="btn btn-brown btn-lg">Explore the Hub ↓</Link>
                <Link href="/msm" className="btn btn-outline-b btn-lg">Marketing Consultation</Link>
              </div>
              <div className="hero-trust">
                <div className="hero-trust-badge">
                  <span className="trust-ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="var(--gold3)" stroke="var(--gold3)" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </span>
                  EST. 2018
                </div>
              </div>
            </div>

            {/* Right — blob image with floating cards */}
            <div className="hero-right">
              <div className="hero-img-blob">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
                  alt="Scales of justice — law firm success" loading="eager"
                />
                <div className="hero-float-card">
                  <div className="hfc-num"><span className="hfc-gold">★★★★★</span></div>
                  <div className="hfc-lbl">5-Star Rated Platform</div>
                </div>
                <div className="hero-float-card2">
                  <div className="hfc2-n"><span className="dot-live" /> Growing Network</div>
                  <div className="hfc2-l">of Law Firms</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rotating scroll badge */}
        <div className="scroll-badge">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="circ" d="M60,10 A50,50 0 1,1 59.9,10" />
            </defs>
            <text fontSize="11" fill="#60270F" fontWeight="600" letterSpacing="3" style={{ fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
              <textPath href="#circ">SCROLL FOR MORE · SCROLL FOR MORE · </textPath>
            </text>
          </svg>
          <div className="scroll-badge-arrow">↓</div>
        </div>
      </section>

      {/* ═══ MARQUEE 1 (gold, forward scroll) ═══════════════════════ */}
      <div className="marquee-sec">
        <div className="marquee-track">
          {[0, 1].map(dup => MARQUEE_ITEMS.map((item, i) => (
            <span className="marquee-item" key={`${dup}-${i}`}>{item} <span className="marquee-sep">·</span></span>
          )))}
        </div>
      </div>

      {/* ═══ GHOST TEXT DARK SECTION ══════════════════════════════ */}
      <section className="ghost-sec">
        <div className="ghost-word">DOMINATE</div>
        <div className="wrap">
          <div className="ghost-inner" style={{ gridTemplateColumns: '1fr' }}>
            {/* Text column */}
            <div>
              <span className="lbl lbl-w">About Dominate Law</span>
              <h2 className="ghost-heading">
                Built for Attorneys.<br />
                Powered by <em>8 Years</em><br />
                of <span className="outline-txt">Expertise.</span>
              </h2>
              <p className="p-lead p-lead-w" style={{ marginBottom: 24 }}>
                Dominate Law is the go-to resource hub for law firm owners who want to grow smarter — not just work harder. Since 2018, we&apos;ve covered every dimension of running a successful law firm — from podcasts and live events to practical strategies you can use today.
              </p>
              <p className="p-lead p-lead-w" style={{ marginBottom: 36 }}>
                Backed by Ekwa Marketing — the leading digital marketing agency for law firms in North America — every guide, tool review, and podcast episode is grounded in real results from real law firms.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/about" className="btn btn-gold">Our Story →</Link>
                <Link href="/msm" className="btn btn-outline-w">Marketing Consultation</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MARKETING SPLIT ═══════════════════════════════════════ */}
      <section className="split-sec" style={{ background: '#fff' }}>
        <div className="wrap">
          <div className="split-grid">
            <div className="split-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
                alt="Law firm marketing professional at work" loading="lazy"
              />
              <div className="split-overlay" />
              <div className="split-badge">⭐ Trusted by Law Firms Nationwide</div>
            </div>
            <div>
              <span className="lbl">Marketing &amp; SEO</span>
              <h2 className="h2">Get Found by More<br />of the Right Clients</h2>
              <p className="p-lead" style={{ marginTop: 12 }}>Most law firm websites are invisible to Google. We help you fix that — with SEO, reputation management, and content marketing built for attorneys.</p>
              <div className="feat-list">
                <div className="feat">
                  <div className="feat-ck">✓</div>
                  <div><strong>Law Firm SEO That Actually Works</strong><span>Practice-area pages, local SEO, and technical audits that move you up fast.</span></div>
                </div>
                <div className="feat">
                  <div className="feat-ck">✓</div>
                  <div><strong>Reputation &amp; Review Management</strong><span>Build a 5-star presence across Google, Avvo, and Yelp — automatically.</span></div>
                </div>
                <div className="feat">
                  <div className="feat-ck">✓</div>
                  <div><strong>Content &amp; Thought Leadership</strong><span>Articles, videos, and podcasts that position you as the expert before prospects call.</span></div>
                </div>
                <div className="feat">
                  <div className="feat-ck">✓</div>
                  <div><strong>Social Media for Law Firms</strong><span>Platform-specific strategies that comply with bar rules and actually generate cases.</span></div>
                </div>
              </div>
              <div className="split-actions">
                <Link href="/msm" className="btn btn-brown">Explore Marketing →</Link>
                <Link href="/msm" className="btn btn-outline-b">Free SEO Audit</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PODCAST ═══════════════════════════════════════════════ */}
      <section className="pod-sec" id="podcast">
        <div className="pod-bg" />
        <div className="pod-overlay" />
        <div className="wrap pod-inner">
          <div className="ep-photo-grid" id="hp-pod-grid">
            {latest6.length > 0 ? (
              latest6.map(ep => <EpisodeCard ep={ep} key={ep.slug} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 32, color: 'rgba(255,255,255,.4)' }}>Loading latest episodes…</div>
            )}
          </div>
          {/* Host card */}
          <div className="pod-host">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/naren.jpg" alt="Naren Arulrajah – Host of Dominate Law Podcast" loading="lazy" className="pod-host-img" />
            <div className="pod-host-info">
              <span className="pod-host-role">Your Host</span>
              <strong className="pod-host-name">Naren Arulrajah</strong>
              <p className="pod-host-bio">CEO of Ekwa Marketing and Founder of Dominate Law, Naren has spent 18+ years helping law firms grow their practices through smart digital marketing. Each episode delivers no-fluff strategies you can implement this week.</p>
              <div className="pod-host-links">
                <a href="https://www.linkedin.com/company/dominatelaw/" target="_blank" rel="noopener">LinkedIn</a>
                <Link href="/guest-speaker">Be a Guest →</Link>
              </div>
            </div>
          </div>

          <div className="pod-platforms">
            <span className="pod-platform-lbl">Listen on:</span>
            <a href="#" className="pod-pl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="12" fill="#1DB954" /><path d="M17.25 16.2c-.2.33-.64.43-.97.22-2.66-1.63-6.01-2-9.96-1.1-.38.09-.76-.15-.85-.53-.09-.38.15-.76.53-.85 4.32-1 8.01-.57 11 1.29.33.2.43.64.25.97zm1.16-2.6c-.25.41-.79.54-1.2.29-3.04-1.87-7.68-2.42-11.28-1.32-.47.14-.96-.13-1.1-.59-.14-.46.13-.96.59-1.1 4.11-1.25 9.22-.64 12.7 1.52.41.25.54.79.29 1.2zm.1-2.7c-3.65-2.17-9.67-2.37-13.15-1.31-.56.17-1.15-.14-1.32-.7-.17-.56.14-1.15.7-1.32 4-1.22 10.64-.98 14.84 1.52.51.3.68.96.38 1.47-.3.51-.96.67-1.47.34z" fill="white" /></svg>
              {' '}Spotify
            </a>
            <a href="#" className="pod-pl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"><defs><linearGradient id="apg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F452FF" /><stop offset="100%" stopColor="#832BC1" /></linearGradient></defs><rect width="24" height="24" rx="5.5" fill="url(#apg)" /><path d="M12 4.8c-3.1 0-5.5 2.56-5.5 5.72 0 2.33 1.35 4.36 3.32 5.3v1.3c0 .49.36.88.84.88H13.34c.48 0 .84-.39.84-.88v-1.3C16.15 14.88 17.5 12.85 17.5 10.52 17.5 7.36 15.1 4.8 12 4.8z" fill="white" /><path d="M10.5 17.12h3v1.5c0 .27-.22.48-.5.48h-2c-.28 0-.5-.21-.5-.48v-1.5z" fill="rgba(255,255,255,0.7)" /><circle cx="12" cy="10.5" r="2" fill="rgba(255,255,255,0.9)" /><circle cx="12" cy="10.5" r=".8" fill="#832BC1" /></svg>
              {' '}Apple Podcasts
            </a>
            <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" className="pod-pl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.46A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.46a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8z" fill="#FF0000" /><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white" /></svg>
              {' '}YouTube
            </a>
            <Link href="/podcast" className="btn btn-gold btn-sm" style={{ marginLeft: 'auto' }}>All Episodes →</Link>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE 2 (reverse scroll, brown bg) ═════════════════ */}
      <div className="marquee2-sec">
        <div className="marquee2-track">
          {[0, 1].map(dup => MARQUEE2_ITEMS.map((item, i) => (
            <span className="marquee2-item" key={`${dup}-${i}`}>
              {item === '__SINCE_2018__' ? <><span className="m2-accent">SINCE 2018</span> · </> : `${item} · `}
            </span>
          )))}
        </div>
      </div>

      {/* ═══ LEGAL TOOLS TEASER ════════════════════════════════════ */}
      <section className="tools-teaser" id="tools">
        <div className="wrap">
          <div className="tools-teaser-grid">

            {/* Left: copy */}
            <div>
              <div className="tools-teaser-badge">
                <span /> Free Attorney Tools
              </div>
              <span className="lbl">Legal Calculators &amp; Niche Tools</span>
              <h2 className="h2" style={{ marginBottom: 18 }}>
                Numbers That<br />
                <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Actually Work</em><br />
                for Lawyers
              </h2>
              <p className="p-lead">8 specialized calculators built for how attorneys think — contingency fees, settlement estimates, statute of limitations deadlines, billable hours, and more. Free access for legal professionals.</p>
              <div className="tools-lock-note">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="11" rx="2" stroke="var(--gold)" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="16.5" r="1.5" fill="var(--gold)" />
                </svg>
                <span>Quick sign-up with your name, designation &amp; email — then instant free access to every tool.</span>
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/tools" className="btn btn-brown">Explore All Tools →</Link>
                <Link href="/tools" className="btn btn-outline-b">Sign Up Free</Link>
              </div>
            </div>

            {/* Right: tool preview cards */}
            <div className="tools-teaser-right">

              {/* Featured card */}
              <Link href="/tools" className="tool-preview-card featured">
                <div className="tool-preview-icon">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#E8C44A" strokeWidth="1.8" /><path d="M12 7v1.5M12 15.5V17M9.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2.5-2.5 3-2.5 3v1" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-preview-name">Contingency Fee Calculator</div>
                <div className="tool-preview-desc">Attorney fee, litigation costs &amp; client net recovery — all in one calculation.</div>
              </Link>

              {/* Card 2 */}
              <Link href="/tools" className="tool-preview-card">
                <div className="tool-preview-icon">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#E8C44A" strokeWidth="1.8" /><path d="M12 7v5l3.5 2" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="1" fill="#E8C44A" /></svg>
                </div>
                <div className="tool-preview-name">Statute of Limitations</div>
                <div className="tool-preview-desc">Exact filing deadlines by case type, with tolling and urgency alerts.</div>
              </Link>

              {/* Card 3 */}
              <Link href="/tools" className="tool-preview-card">
                <div className="tool-preview-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M3 17l4-8 4 5 3-3 4 6" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 20h18" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-preview-name">Settlement Estimator</div>
                <div className="tool-preview-desc">Multiplier-method settlement range with comparative fault adjustment.</div>
              </Link>

              {/* Card 4 */}
              <Link href="/tools" className="tool-preview-card">
                <div className="tool-preview-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.8 5.3.77-3.85 3.75.9 5.3L12 14.1l-4.75 2.52.9-5.3L4.3 7.57l5.3-.77L12 2z" stroke="#E8C44A" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                </div>
                <div className="tool-preview-name">Case ROI Calculator</div>
                <div className="tool-preview-desc">Risk-adjusted return on investment for evaluating whether to take a case.</div>
              </Link>

              {/* Card 5: +more badge */}
              <Link href="/tools" className="tool-preview-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, background: 'var(--brown3)', borderColor: 'transparent', color: '#fff' }}>
                <div style={{ fontFamily: "var(--font-serif), 'Merriweather', serif", fontSize: '2rem', fontWeight: 900, color: 'var(--gold3)' }}>+4</div>
                <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.65)', textAlign: 'center' }}>More Free Tools<br />for Attorneys</div>
              </Link>

            </div>{/* /tools-teaser-right */}
          </div>{/* /grid */}
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════ */}
      <section className="faq-sec" id="faq">
        <div className="wrap">
          <div style={{ textAlign: 'center' }}>
            <span className="lbl">FAQ</span>
            <h2 className="h2">Law Firm Marketing Questions, Answered</h2>
          </div>
          <div className="faq-list">
            {FAQS.map(f => (
              <details className="faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══════════════════════════════════════════ */}
      <section className="cta-sec">
        <div className="cta-bg" />
        <div className="cta-overlay" />
        <div className="cta-ghost">LAW</div>
        <div className="wrap">
          <div className="cta-inner">
            <span className="lbl lbl-w">Ready to Grow?</span>
            <h2 className="cta-big">
              Stop Leaving Cases<br />
              on the <em>Table.</em>
            </h2>
            <p className="cta-sub">Book your 30-minute strategy session. We&apos;ll audit your current marketing, show you exactly what&apos;s costing you clients, and map out a clear plan to fix it — at no charge.</p>
            <div className="cta-actions">
              <Link href="/msm" className="btn btn-gold btn-lg">Book a Strategy Call →</Link>
              <Link href="/podcast" className="btn btn-outline-w btn-lg">Listen to the Podcast</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE CSS — copied verbatim from the legacy index.html <style> block
   (homepage sections only; nav/footer/announce/utils live in globals.css).
   Font families reference the next/font variables (same Inter/Merriweather).
═══════════════════════════════════════════════════════════════════ */
const PAGE_CSS = `
/* ─── PROGRESS BAR ─── */
#progress {
  position: fixed; top: 0; left: 0; height: 3px; width: 0;
  background: linear-gradient(90deg, var(--gold), var(--gold3));
  z-index: 9999; transition: width .08s linear;
}

/* ─── HERO ─── */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: #fff; position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(rgba(96,39,15,.06) 1px, transparent 1px);
  background-size: 30px 30px; pointer-events: none;
}
.hero-inner {
  width: 100%; display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px; align-items: center;
  padding: 130px 0 80px; position: relative; z-index: 2;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: .73rem; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: 24px;
}
.hero-eyebrow-line { width: 32px; height: 2px; background: var(--gold); }
.hero-strike {
  font-size: 1rem; font-weight: 400; color: var(--muted);
  text-decoration: line-through; display: block;
  margin-bottom: 8px; opacity: .6;
}
.hero h1 {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: clamp(2.8rem, 5.5vw, 4.4rem);
  font-weight: 900; line-height: 1.1;
  color: var(--brown3); margin-bottom: 8px;
}
.hero h1 .accent {
  color: var(--gold); font-style: italic; position: relative;
}
.hero h1 .accent::after {
  content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
  height: 4px; background: linear-gradient(90deg, var(--gold), var(--gold3));
  border-radius: 2px; transform: scaleX(0); transform-origin: left;
  animation: underline-grow 1.1s 1s both ease-out;
}
@keyframes underline-grow { to { transform: scaleX(1); } }
.hero-sub {
  font-size: 1.1rem; color: var(--muted); line-height: 1.8;
  max-width: 480px; margin: 20px 0 36px;
}
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
.hero-trust { display: flex; gap: 20px; flex-wrap: wrap; }
.hero-trust-badge {
  display: flex; align-items: center; gap: 7px;
  font-size: .78rem; font-weight: 600; color: var(--muted);
  padding: 8px 14px; border: 1px solid var(--border);
  border-radius: 100px; background: var(--cream);
}
.trust-ico { font-size: .9rem; }
.scroll-badge {
  position: absolute; bottom: 40px; left: 40px;
  width: 100px; height: 100px; z-index: 3;
}
.scroll-badge svg { width: 100%; height: 100%; animation: spin-badge 10s linear infinite; }
.scroll-badge-arrow {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
  font-size: 1.3rem;
}
@keyframes spin-badge { to { transform: rotate(360deg); } }
.hero-right { position: relative; }
.hero-img-blob {
  width: 100%; max-width: 520px; margin-left: auto;
  position: relative;
}
.hero-img-blob img {
  width: 100%; height: 520px; object-fit: cover;
  border-radius: 44% 56% 62% 38% / 42% 46% 54% 58%;
  animation: blob-morph 8s ease-in-out infinite;
  box-shadow: 0 24px 80px rgba(96,39,15,.2);
}
@keyframes blob-morph {
  0%,100% { border-radius: 44% 56% 62% 38% / 42% 46% 54% 58%; }
  25%      { border-radius: 58% 42% 48% 52% / 52% 58% 42% 48%; }
  50%      { border-radius: 52% 48% 38% 62% / 56% 44% 56% 44%; }
  75%      { border-radius: 38% 62% 52% 48% / 44% 52% 48% 56%; }
}
.hero-float-card {
  position: absolute; bottom: -20px; left: -30px;
  background: #fff; border-radius: 16px; padding: 16px 20px;
  box-shadow: 0 16px 48px rgba(0,0,0,.14);
  animation: float 5s ease-in-out infinite;
  min-width: 180px;
}
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.hfc-num { font-family: var(--font-serif), 'Merriweather', Georgia, serif; font-size: 1.8rem; font-weight: 900; color: var(--brown); line-height: 1; }
.hfc-gold { color: var(--gold); }
.hfc-lbl { font-size: .72rem; font-weight: 600; color: var(--muted); margin-top: 4px; }
.hero-float-card2 {
  position: absolute; top: 30px; right: -20px;
  background: var(--brown); border-radius: 16px; padding: 14px 18px;
  box-shadow: 0 12px 36px rgba(96,39,15,.3);
  animation: float 5s 1.5s ease-in-out infinite;
  min-width: 150px;
}
.hfc2-n { font-size: .8rem; font-weight: 700; color: var(--gold3); display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.hfc2-l { font-size: .68rem; color: rgba(255,255,255,.5); }
.dot-live { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; animation: pulse 2s infinite; }

/* ─── MARQUEE ─── */
.marquee-sec {
  background: var(--gold); padding: 18px 0; overflow: hidden;
  border-top: 3px solid var(--gold2); border-bottom: 3px solid var(--gold2);
}
.marquee-track {
  display: flex; gap: 0; width: max-content;
  animation: marquee-scroll 25s linear infinite;
}
.marquee-track:hover { animation-play-state: paused; }
@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee-item {
  display: flex; align-items: center; gap: 20px;
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-weight: 700; font-size: 1rem;
  color: var(--brown3); white-space: nowrap; padding: 0 28px;
  text-transform: uppercase; letter-spacing: .06em;
}
.marquee-sep { font-size: 1.2rem; color: var(--brown); opacity: .5; }

/* ─── GHOST TEXT DARK SECTION ─── */
.ghost-sec {
  background: var(--brown3); padding: 100px 0 80px;
  position: relative; overflow: hidden;
}
.ghost-word {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: clamp(5rem, 14vw, 13rem);
  font-weight: 900; line-height: .9;
  -webkit-text-stroke: 2px rgba(255,255,255,.08);
  color: transparent; text-transform: uppercase;
  pointer-events: none; user-select: none;
  position: absolute; bottom: -20px; right: -20px;
  letter-spacing: -.02em;
}
.ghost-inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.ghost-stat-row { display: flex; flex-direction: column; gap: 40px; }
.ghost-stat { border-left: 3px solid var(--gold); padding-left: 22px; }
.ghost-n {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif; font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900; color: #fff; line-height: 1; display: block;
}
.ghost-n .count-up { display: inline-block; }
.ghost-n-accent { color: var(--gold3); }
.ghost-nl { font-size: .82rem; color: rgba(255,255,255,.45); margin-top: 6px; display: block; text-transform: uppercase; letter-spacing: .08em; }
.ghost-heading {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 900; line-height: 1.2; color: #fff; margin-bottom: 20px;
}
.ghost-heading em { color: var(--gold3); font-style: italic; }
.ghost-heading .outline-txt {
  -webkit-text-stroke: 2px rgba(255,255,255,.3);
  color: transparent;
}

/* ─── IMAGE SPLIT ─── */
.split-sec { padding: 100px 0; }
.split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.split-grid.rev { direction: rtl; }
.split-grid.rev > * { direction: ltr; }
.split-img-wrap {
  position: relative; border-radius: 24px;
  overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,.14);
}
.split-img-wrap img { width: 100%; height: 500px; object-fit: cover; transition: transform .9s ease; }
.split-img-wrap:hover img { transform: scale(1.04); }
.split-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(58,13,0,.55) 0%, transparent 60%); }
.split-badge {
  position: absolute; bottom: 24px; left: 24px;
  background: var(--gold); color: #fff; padding: 9px 20px;
  border-radius: 100px; font-size: .78rem; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
}
.feat-list { margin-top: 28px; display: flex; flex-direction: column; gap: 18px; }
.feat { display: flex; gap: 14px; align-items: flex-start; }
.feat-ck {
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(196,154,10,.1); border: 2px solid var(--gold);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px; font-size: .72rem; color: var(--gold2); font-weight: 900;
}
.feat strong { display: block; font-size: .9rem; font-weight: 700; color: var(--brown); margin-bottom: 3px; }
.feat span { font-size: .82rem; color: var(--muted); line-height: 1.65; }
.split-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }

/* ─── PODCAST — image bg + glassmorphism ─── */
.pod-sec { position: relative; padding: 100px 0; overflow: hidden; }
.pod-bg {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=1600&q=80');
  background-size: cover; background-position: center;
}
.pod-overlay { position: absolute; inset: 0; background: linear-gradient(140deg, rgba(58,13,0,.94), rgba(96,39,15,.9)); }
.pod-inner { position: relative; z-index: 2; }
.pod-header { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; margin-bottom: 52px; }
.pod-stats { display: flex; gap: 40px; }
.pod-stat-n { font-family: var(--font-serif), 'Merriweather', Georgia, serif; font-size: 2rem; font-weight: 900; color: var(--gold3); display: block; line-height: 1; }
.pod-stat-l { font-size: .7rem; color: rgba(255,255,255,.4); margin-top: 5px; display: block; text-transform: uppercase; letter-spacing: .07em; }
.pod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
/* ─── Episode card (home podcast section, dark glass variant) ── */
.ep-photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:start}
.ep-photo-card{background:rgba(255,255,255,.06);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);border-radius:16px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:transform .3s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease),background .3s var(--ease);position:relative}
.ep-photo-card:hover{transform:translateY(-6px);box-shadow:0 22px 52px rgba(0,0,0,.4);border-color:rgba(196,154,10,.45);background:rgba(255,255,255,.1)}
.ep-photo-card.is-new{border-color:rgba(196,154,10,.4)}
.ep-photo-card.is-new::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(196,154,10,.08),transparent 60%);pointer-events:none;border-radius:inherit;z-index:1}
.ep-photo-img{position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,#7A3515,#3A0D00);overflow:hidden}
.ep-photo-img img{width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;transition:transform .5s var(--ease)}
.ep-photo-card:hover .ep-photo-img img{transform:scale(1.05)}
.ep-photo-img::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.55) 100%);pointer-events:none}
.ep-photo-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--gold3);font-family:var(--font-serif),'Merriweather',Georgia,serif;font-weight:900;font-size:2.2rem}
.ep-photo-num{position:absolute;left:12px;bottom:11px;z-index:2;font-size:.62rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);border:1px solid rgba(196,154,10,.45);border-radius:100px;padding:4px 11px}
.ep-photo-flag{position:absolute;right:11px;top:11px;z-index:2;font-size:.58rem;font-weight:900;letter-spacing:.16em;color:#3A0D00;background:linear-gradient(135deg,#E8C44A,#C49A0A);border-radius:4px;padding:3px 9px;box-shadow:0 4px 14px rgba(196,154,10,.45);text-transform:uppercase}
.ep-photo-body{padding:18px 18px 20px;display:flex;flex-direction:column;flex:1;position:relative;z-index:2}
.ep-photo-meta{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold3);margin-bottom:7px;opacity:.85}
.ep-photo-title{font-family:var(--font-serif),'Merriweather',Georgia,serif;font-size:.92rem;font-weight:900;color:#fff;line-height:1.38;margin:0 0 10px;flex-grow:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ep-photo-by{font-size:.74rem;color:rgba(255,255,255,.62);font-weight:500;margin-bottom:10px;display:flex;align-items:center;gap:5px}
.ep-photo-cta{font-size:.74rem;font-weight:700;color:var(--gold3);padding-top:10px;border-top:1px solid rgba(255,255,255,.12);display:inline-flex;align-items:center;gap:5px;transition:color .2s,gap .2s}
.ep-photo-cta span{transition:transform .25s var(--ease)}
.ep-photo-card:hover .ep-photo-cta{color:#fff}
.ep-photo-card:hover .ep-photo-cta span{transform:translateX(4px)}
/* gate sections — must be hidden by default on all pages */
.ep-card-preview{display:flex;flex-direction:column;flex:1}
.ep-card-gate{display:none;flex-direction:column;flex:1}
.ep-card-gate.open{display:flex}
@media(max-width:900px){.ep-photo-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.ep-photo-grid{grid-template-columns:1fr}}
.pod-ep {
  background: rgba(255,255,255,.07); backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,.11); border-radius: 16px;
  padding: 24px; transition: all .35s var(--ease);
}
.pod-ep:hover { background: rgba(255,255,255,.13); border-color: rgba(196,154,10,.3); transform: translateY(-5px); }
.pod-cat { font-size: .67rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--gold3); margin-bottom: 8px; display: block; }
.pod-ep h4 { font-size: .9rem; font-weight: 700; color: #fff; line-height: 1.45; margin-bottom: 12px; }
.pod-dur { font-size: .72rem; color: rgba(255,255,255,.4); display: flex; align-items: center; gap: 5px; }
.pod-platforms { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 40px; }
.pod-platform-lbl { font-size: .77rem; color: rgba(255,255,255,.4); margin-right: 6px; }
.pod-pl {
  padding: 9px 18px; border: 1px solid rgba(255,255,255,.2); border-radius: 4px;
  color: rgba(255,255,255,.65); font-size: .79rem; font-weight: 500;
  display: flex; align-items: center; gap: 7px; transition: all .2s;
}
.pod-pl:hover { border-color: rgba(255,255,255,.5); color: #fff; background: rgba(255,255,255,.07); }
.pod-host {
  display: flex; align-items: center; gap: 32px;
  background: rgba(255,255,255,.07); backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,.13); border-radius: 18px;
  padding: 28px 32px; margin-top: 44px;
}
.pod-host-img {
  width: 110px; height: 110px; border-radius: 50%;
  object-fit: cover; border: 3px solid var(--gold);
  flex-shrink: 0; filter: brightness(1.05);
}
.pod-host-role {
  font-size: .67rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .1em; color: var(--gold3); display: block; margin-bottom: 4px;
}
.pod-host-name {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif; font-size: 1.25rem;
  font-weight: 900; color: #fff; display: block; margin-bottom: 10px;
}
.pod-host-bio { font-size: .82rem; color: rgba(255,255,255,.55); line-height: 1.7; margin-bottom: 14px; }
.pod-host-links { display: flex; gap: 14px; }
.pod-host-links a {
  font-size: .78rem; font-weight: 600; color: var(--gold3);
  border-bottom: 1px solid rgba(196,154,10,.35); padding-bottom: 2px;
  transition: color .2s, border-color .2s;
}
.pod-host-links a:hover { color: #fff; border-color: #fff; }
@media (max-width:768px) {
  .pod-host { flex-direction: column; text-align: center; padding: 24px 20px; }
  .pod-host-links { justify-content: center; }
}

/* ─── SECOND MARQUEE (reverse direction) ─── */
.marquee2-sec { background: var(--brown); padding: 20px 0; overflow: hidden; }
.marquee2-track {
  display: flex; width: max-content;
  animation: marquee2-scroll 30s linear infinite;
}
@keyframes marquee2-scroll { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.marquee2-item {
  font-family: var(--font-sans), 'Inter', sans-serif; font-weight: 300; font-size: .95rem;
  color: rgba(255,255,255,.35); white-space: nowrap; padding: 0 24px;
  text-transform: uppercase; letter-spacing: .12em;
}
.m2-accent { color: var(--gold3); font-weight: 700; }

/* ─── LEGAL TOOLS TEASER SECTION ─── */
.tools-teaser { background: var(--cream); padding: 100px 0; position: relative; overflow: hidden; }
.tools-teaser::before {
  content: 'TOOLS';
  position: absolute; right: -40px; top: 50%; transform: translateY(-50%);
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: clamp(80px, 14vw, 160px);
  font-weight: 900; color: transparent;
  -webkit-text-stroke: 2px rgba(96,39,15,.06);
  pointer-events: none; line-height: 1;
  user-select: none;
}
.tools-teaser-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 60px; align-items: center;
  position: relative; z-index: 2;
}
.tools-teaser-right {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.tool-preview-card {
  background: #fff; border-radius: 12px;
  border: 1px solid var(--border);
  padding: 20px 18px;
  transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .3s;
  cursor: pointer;
}
.tool-preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 48px rgba(96,39,15,.11);
  border-color: var(--gold);
}
.tool-preview-icon {
  width: 38px; height: 38px; border-radius: 8px;
  background: var(--brown); display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.tool-preview-icon svg { width: 19px; height: 19px; }
.tool-preview-name { font-size: .82rem; font-weight: 700; color: var(--brown3); margin-bottom: 4px; }
.tool-preview-desc { font-size: .72rem; color: var(--muted); line-height: 1.5; }
.tool-preview-card.featured {
  grid-column: span 2;
  background: linear-gradient(135deg, var(--brown3), var(--brown));
  border-color: transparent;
}
.tool-preview-card.featured .tool-preview-icon { background: rgba(255,255,255,.15); }
.tool-preview-card.featured .tool-preview-name { color: #fff; font-size: .88rem; }
.tool-preview-card.featured .tool-preview-desc { color: rgba(255,255,255,.6); }
.tool-preview-card.featured:hover { border-color: var(--gold3); }
.tools-teaser-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 100px;
  background: rgba(196,154,10,.12); border: 1px solid rgba(196,154,10,.25);
  font-size: .72rem; color: var(--gold2); font-weight: 700;
  text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 20px;
}
.tools-teaser-badge span { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--gold); animation: pulse 2s ease-in-out infinite; }
.tools-lock-note {
  display: flex; align-items: center; gap: 10px;
  margin-top: 22px; padding: 14px 18px;
  background: #fff; border-radius: 8px;
  border: 1px solid var(--border); font-size: .8rem; color: var(--muted);
}
.tools-lock-note svg { flex-shrink: 0; }

/* ─── FAQ (visible render of the FAQPage schema) ─── */
.faq-sec { background: var(--cream); padding: 100px 0; }
.faq-list { max-width: 820px; margin: 44px auto 0; display: flex; flex-direction: column; gap: 14px; }
.faq-item { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.faq-item summary {
  cursor: pointer; list-style: none;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  padding: 20px 24px; font-weight: 700; font-size: .95rem; color: var(--brown3);
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.2rem; color: var(--gold); font-weight: 700; flex-shrink: 0; }
.faq-item[open] summary::after { content: '\\2013'; }
.faq-item p { padding: 0 24px 20px; font-size: .87rem; color: var(--muted); line-height: 1.75; }

/* ─── CTA — with image bg ─── */
.cta-sec { position: relative; padding: 120px 0; overflow: hidden; }
.cta-bg {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1920&q=80');
  background-size: cover; background-position: center;
}
.cta-overlay { position: absolute; inset: 0; background: linear-gradient(140deg, rgba(58,13,0,.93), rgba(96,39,15,.87)); }
.cta-ghost {
  position: absolute; bottom: -30px; right: -20px;
  font-family: var(--font-serif), 'Merriweather', Georgia, serif; font-size: clamp(6rem, 18vw, 16rem);
  font-weight: 900; -webkit-text-stroke: 2px rgba(255,255,255,.05);
  color: transparent; text-transform: uppercase; pointer-events: none;
  line-height: 1; letter-spacing: -.02em;
}
.cta-inner {
  position: relative; z-index: 2; text-align: center;
  max-width: 700px; margin: 0 auto; color: #fff;
}
.cta-big {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 900; line-height: 1.1; margin-bottom: 22px; color: #fff;
}
.cta-big em { color: var(--gold3); font-style: italic; }
.cta-big .outline { -webkit-text-stroke: 2px rgba(255,255,255,.4); color: transparent; }
.cta-sub { font-size: 1.05rem; color: rgba(255,255,255,.65); line-height: 1.8; max-width: 520px; margin: 0 auto 40px; }
.cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

/* ─── BACK TO TOP ─── */
#btt {
  position: fixed; bottom: 28px; right: 28px; width: 48px; height: 48px;
  border-radius: 50%; background: var(--brown); color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; cursor: pointer; z-index: 900;
  box-shadow: 0 6px 24px rgba(96,39,15,.3);
  opacity: 0; transform: translateY(16px); transition: all .3s var(--ease);
}
#btt.show { opacity: 1; transform: translateY(0); }
#btt:hover { background: var(--gold); transform: translateY(-3px); }

/* ─── ICON BG COLOURS ─── */
.i1{background:#FFF3EC} .i2{background:#FFF8E8} .i3{background:#F0FDF4}
.i4{background:#FFF9F0} .i5{background:#F0FDFA} .i6{background:var(--cream2)}
.i7{background:#FFF5F0} .i8{background:#FAF6F3}

/* ─── RESPONSIVE — TABLET (≤ 1024px) ─── */
@media(max-width:1024px){
  .hero-inner          { grid-template-columns: 1fr; padding: 104px 0 60px; }
  .hero-right          { display: none; }
  .scroll-badge        { display: none; }
  .hero h1             { font-size: clamp(2.4rem, 5vw, 3.4rem); }
  .ghost-inner         { grid-template-columns: 1fr; gap: 44px; }
  .ghost-stat-row      { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .ghost-stat          { border-left: none; border-bottom: 2px solid rgba(196,154,10,.25); padding: 0 0 20px; }
  .ghost-word          { font-size: clamp(5rem, 16vw, 9rem); }
  .split-grid          { grid-template-columns: 1fr; gap: 44px; }
  .split-grid.rev      { direction: ltr; }
  .split-img-wrap img  { height: 360px; }
  .pod-grid            { grid-template-columns: repeat(2, 1fr); }
  .pod-header          { grid-template-columns: 1fr; gap: 24px; }
}

/* ─── RESPONSIVE — MOBILE (≤ 768px) ─── */
@media(max-width:768px){
  .sec                 { padding: 64px 0; }
  .h2                  { font-size: clamp(1.7rem, 6vw, 2.2rem); }
  .hero-inner          { padding: 90px 0 50px; }
  .hero h1             { font-size: clamp(2rem, 8vw, 2.8rem); line-height: 1.15; }
  .hero-sub            { font-size: .97rem; margin: 16px 0 28px; }
  .hero-actions        { flex-direction: column; gap: 10px; margin-bottom: 32px; }
  .hero-actions .btn   { width: 100%; justify-content: center; }
  .hero-trust          { gap: 10px; }
  .hero-trust-badge    { font-size: .74rem; padding: 7px 12px; }
  .hero-strike         { font-size: .9rem; }
  .hero-eyebrow        { font-size: .67rem; margin-bottom: 16px; }
  .marquee-item        { font-size: .82rem; padding: 0 16px; gap: 14px; }
  .marquee2-item       { font-size: .8rem; padding: 0 16px; }
  .ghost-sec           { padding: 64px 0 56px; }
  .ghost-word          { font-size: clamp(3.5rem, 18vw, 6rem); bottom: -5px; right: -5px; }
  .ghost-stat-row      { grid-template-columns: 1fr 1fr; gap: 20px; }
  .ghost-n             { font-size: clamp(1.8rem, 7vw, 2.6rem); }
  .ghost-nl            { font-size: .72rem; }
  .ghost-heading       { font-size: clamp(1.5rem, 6vw, 2rem); }
  .split-sec           { padding: 64px 0; }
  .split-img-wrap img  { height: 260px; }
  .split-badge         { font-size: .72rem; padding: 7px 14px; bottom: 16px; left: 16px; }
  .feat-list           { margin-top: 20px; gap: 14px; }
  .split-actions       { flex-direction: column; gap: 10px; }
  .split-actions .btn  { width: 100%; justify-content: center; }
  .pod-sec             { padding: 64px 0; }
  .pod-grid            { grid-template-columns: 1fr; gap: 14px; }
  .pod-stats           { gap: 24px; flex-wrap: wrap; }
  .pod-platforms       { gap: 8px; flex-wrap: wrap; }
  .pod-platforms .btn-sm { width: 100%; justify-content: center; margin-left: 0 !important; }
  .pod-platform-lbl    { width: 100%; }
  .tools-teaser        { padding: 64px 0; }
  .tools-teaser-grid   { grid-template-columns: 1fr; gap: 40px; }
  .tools-teaser-right  { grid-template-columns: 1fr 1fr; }
  .tool-preview-card.featured { grid-column: span 2; }
  .faq-sec             { padding: 64px 0; }
  .cta-sec             { padding: 80px 0; }
  .cta-big             { font-size: clamp(1.8rem, 7vw, 2.4rem); }
  .cta-sub             { font-size: .95rem; margin-bottom: 28px; }
  .cta-actions         { flex-direction: column; align-items: center; gap: 10px; }
  .cta-actions .btn    { width: 100%; max-width: 340px; justify-content: center; }
  .cta-ghost           { font-size: clamp(4rem, 20vw, 7rem); }
  #btt                 { bottom: 20px; right: 20px; width: 42px; height: 42px; font-size: 1rem; }
}

/* ─── RESPONSIVE — SMALL MOBILE (≤ 480px) ─── */
@media(max-width:480px){
  .sec                 { padding: 52px 0; }
  .hero-inner          { padding: 80px 0 44px; }
  .hero h1             { font-size: clamp(1.75rem, 9.5vw, 2.2rem); }
  .hero-trust          { flex-direction: column; align-items: flex-start; gap: 8px; }
  .hero-trust-badge    { width: 100%; }
  .ghost-stat-row      { grid-template-columns: 1fr; gap: 18px; }
  .ghost-stat          { border-bottom: 1px solid rgba(196,154,10,.2); padding-bottom: 16px; }
  .marquee-item        { font-size: .76rem; padding: 0 12px; }
  .marquee2-item       { font-size: .72rem; padding: 0 12px; }
  .pod-stats           { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cta-big             { font-size: clamp(1.6rem, 10vw, 2rem); }
  .cta-ghost           { font-size: clamp(3.5rem, 22vw, 6rem); bottom: -5px; right: -5px; }
}

/* ─── ACCESSIBILITY — reduce motion ─── */
@media(prefers-reduced-motion:reduce){
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  .marquee-track        { animation: none; }
  .marquee2-track       { animation: none; }
  .hero-img-blob img    { animation: none; border-radius: 24px; }
  .hero-float-card,
  .hero-float-card2     { animation: none; }
  .pod-bg               { background-attachment: scroll; }
  .cta-bg               { background-attachment: scroll; }
}

/* ─── HOME POPUP — Latest Podcast & Upcoming Event ─── */
#home-popup-backdrop {
  position: fixed; inset: 0;
  background: rgba(20,5,0,.55);
  backdrop-filter: blur(4px);
  z-index: 8800;
  display: none; align-items: center; justify-content: center;
  padding: 20px;
  opacity: 0; transition: opacity .35s ease;
  pointer-events: none;
}
#home-popup-backdrop.visible { opacity: 1; pointer-events: auto; }
#home-popup {
  background: #fff;
  border-radius: 20px;
  width: 100%; max-width: 820px;
  box-shadow: 0 40px 100px rgba(0,0,0,.28);
  overflow: hidden;
  transform: translateY(28px) scale(.97);
  transition: transform .38s cubic-bezier(.4,0,.2,1);
  position: relative;
}
#home-popup-backdrop.visible #home-popup { transform: none; }
#home-popup-close {
  position: absolute; top: 14px; right: 14px;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.92); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: .95rem; color: var(--brown3);
  transition: background .2s, color .2s, transform .2s; z-index: 5;
  box-shadow: 0 4px 14px rgba(0,0,0,.18);
}
#home-popup-close:hover { background: var(--brown); color: #fff; transform: rotate(90deg); }
.hp-header {
  background: linear-gradient(120deg, var(--brown3), var(--brown));
  padding: 16px 24px 14px;
  display: flex; align-items: center; gap: 10px;
}
.hp-header-label {
  font-size: .68rem; font-weight: 800; letter-spacing: .14em;
  text-transform: uppercase; color: var(--gold3);
}
.hp-header-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--gold); opacity: .5; flex-shrink: 0;
}
.hp-cards {
  display: grid; grid-template-columns: 1.15fr 1fr;
}
.hp-card {
  padding: 22px 24px 26px;
  display: flex; flex-direction: column;
}
.hp-card:first-child { border-right: 1px solid var(--border); padding: 0 0 24px; }
.hp-card-tag {
  font-size: .64rem; font-weight: 800; letter-spacing: .13em;
  text-transform: uppercase; margin-bottom: 12px; display: flex;
  align-items: center; gap: 6px;
}
.hp-card-tag.podcast { color: var(--brown); padding: 18px 24px 0; margin-bottom: 14px; }
.hp-card-tag.event   { color: var(--gold2); }
.hp-card-tag svg     { width: 13px; height: 13px; }
.hp-pod-banner {
  display: block;
  position: relative;
  aspect-ratio: 16/9;
  margin: 0 24px 14px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--brown), var(--brown3));
  box-shadow: 0 10px 28px rgba(58,13,0,.18);
  text-decoration: none;
}
.hp-pod-banner img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center top;
  display: block;
  transition: transform .5s cubic-bezier(.4,0,.2,1);
}
.hp-pod-banner:hover img { transform: scale(1.04); }
.hp-pod-banner::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,.55) 100%);
}
.hp-pod-banner-fallback {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
  color: var(--gold3); font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-weight: 900; font-size: 2rem; letter-spacing: .04em;
}
.hp-pod-num {
  position: absolute; left: 12px; bottom: 12px; z-index: 2;
  font-size: .62rem; font-weight: 800; letter-spacing: .12em;
  text-transform: uppercase; color: #fff;
  background: rgba(58,13,0,.78); backdrop-filter: blur(6px);
  border: 1px solid rgba(196,154,10,.5);
  border-radius: 100px; padding: 5px 12px;
}
.hp-pod-flag {
  position: absolute; right: 12px; top: 12px; z-index: 2;
  font-size: .6rem; font-weight: 900; letter-spacing: .16em;
  color: var(--brown3);
  background: linear-gradient(135deg, var(--gold3), var(--gold));
  border-radius: 4px; padding: 4px 10px;
  box-shadow: 0 4px 14px rgba(196,154,10,.4);
  text-transform: uppercase;
  display: none;
}
.hp-pod-flag.visible { display: inline-block; }
.hp-pod-meta {
  font-size: .66rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--gold2); margin: 0 24px 6px;
}
.hp-pod-title {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: 1rem; font-weight: 800; color: var(--brown3);
  line-height: 1.4; margin: 0 24px 16px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
}
.hp-pod-actions { margin: auto 24px 0; }
.hp-evt-date {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--cream); border-radius: 8px;
  padding: 6px 12px; margin-bottom: 12px;
}
.hp-evt-date-day { font-size: 1.35rem; font-weight: 900; color: var(--brown); line-height: 1; }
.hp-evt-date-month { font-size: .72rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.hp-evt-title {
  font-family: var(--font-serif), 'Merriweather', Georgia, serif;
  font-size: .9rem; font-weight: 700; color: var(--brown3);
  line-height: 1.45; margin: 0 0 6px;
}
.hp-evt-desc {
  font-size: .78rem; color: var(--muted); line-height: 1.6; margin: 0 0 14px;
  flex-grow: 1;
}
.hp-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 12px 20px; border-radius: 6px;
  font-size: .82rem; font-weight: 700; transition: all .2s;
  border: none; cursor: pointer; text-decoration: none;
}
.hp-btn-podcast  { background: var(--brown); color: #fff; }
.hp-btn-podcast:hover { background: var(--brown3); transform: translateY(-1px); box-shadow: 0 8px 22px rgba(58,13,0,.25); }
.hp-btn-event    { background: var(--gold); color: var(--brown3); }
.hp-btn-event:hover { background: var(--gold2); transform: translateY(-1px); }
@media (max-width: 720px) {
  .hp-cards { grid-template-columns: 1fr; }
  .hp-card:first-child { border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 22px; }
  #home-popup { max-width: 100%; border-radius: 16px; }
  .hp-pod-banner { margin: 0 20px 14px; }
  .hp-pod-meta, .hp-pod-title, .hp-pod-actions { margin-left: 20px; margin-right: 20px; }
  .hp-card-tag.podcast { padding: 16px 20px 0; }
}
`;
