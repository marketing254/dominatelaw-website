import Link from 'next/link';
import { SITE, parseGvizDate, driveImg } from '@/lib/sheets';
import EventsBoard from './EventsBoard';

export const revalidate = 300;

export const metadata = {
  title: 'Free Law Firm Marketing Webinars & Events 2026',
  description:
    'Free virtual events and masterclasses for law firm owners in 2026. Learn SEO, social media, and lead generation from top legal marketing experts. Register free.',
  keywords:
    'law firm webinars, attorney marketing events, legal marketing masterclass, free law firm training, attorney workshops 2026',
  alternates: { canonical: '/events' },
  openGraph: {
    title: 'Free Law Firm Marketing Webinars & Events 2026 | Live & On-Demand | Dominate Law',
    description:
      'Free virtual panel events, masterclasses, and workshops for law firm owners in 2026. Learn SEO, social media, podcasting, and lead generation from top legal marketing experts. Register free.',
    url: '/events',
  },
};

const SHEET_ID = '1Kqtgrii6peL3DxEp7PO45zSYd3sSeTN-e1tHmkFdLpg';

// ── Server-side GViz fetch of the 'events' tab (ISR-cached hourly) ──
async function fetchEventsSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=events`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`events sheet fetch failed (${res.status})`);
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^{]+\(/, '').replace(/\);?\s*$/, ''));
  const labels = json.table.cols.map(c => (c.label || '').trim());
  return json.table.rows
    .filter(row => row.c && row.c.some(cell => cell && cell.v != null && cell.v !== ''))
    .map(row => {
      const obj = {};
      labels.forEach((label, i) => {
        if (!label) return;
        const cell = row.c && row.c[i];
        const val = cell && cell.v != null ? String(cell.v).trim() : '';
        obj[label.toLowerCase().replace(/\s+/g, '_')] = val; // lowercased key
        obj[label] = val; // original label too (e.g. "Panelists", "webinarID")
      });
      return obj;
    });
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Turn a raw sheet row into the plain, serializable object the client needs.
function shapeEvent(r) {
  const d = parseGvizDate(r.date_iso);
  const dateIso = d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : '';

  const panelists = (r.panelists || r.Panelists || '').split('\n').map(s => s.trim()).filter(Boolean);
  const imageMap = {};
  (r.image_urls || '').split('\n').forEach(line => {
    const ci = line.indexOf(':');
    if (ci > -1) imageMap[line.substring(0, ci).trim()] = line.substring(ci + 1).trim();
  });
  const speakers = panelists.map(name => {
    const key = Object.keys(imageMap).find(k => name.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
    return { name, initials: initials(name), src: key ? driveImg(imageMap[key]) : '' };
  });

  const agenda = (r.description || '')
    .split('\n')
    .map(s => s.trim().replace(/^\d+\.\s*/, ''))
    .filter(Boolean)
    .slice(0, 5);

  return {
    title: r.title || '',
    day: r.day || '',
    monthYear: r.month_year || '',
    time: r.time || '',
    dateIso,
    agenda,
    speakers,
    webinarId: r.webinarid || r.webinarID || r.webinar_id || '',
    zoomAccount: r.zoom_account || r.Account || r.account || '',
    registerUrl: r.register_url || '',
  };
}

// schema.org startDate — date plus parsed start time when available.
function startDateIso(e) {
  if (!e.dateIso) return '';
  const m = (e.time || '').match(/(\d+)(?:[:.](\d+))?\s*(AM|PM)/i);
  if (!m) return e.dateIso;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2] || '0', 10);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return `${e.dateIso}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}

const EVENTS_CSS = `
.ev-hero{background:linear-gradient(135deg,var(--brown3) 0%,#1d0600 100%);border-radius:24px;overflow:hidden;position:relative;margin-bottom:48px}
.ev-hero-inner{display:grid;grid-template-columns:1fr 340px}
.ev-hero-content{padding:52px 48px 48px;position:relative;z-index:2}
.ev-live-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,196,74,.12);border:1px solid rgba(232,196,74,.28);border-radius:100px;padding:6px 16px;font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--gold3);margin-bottom:22px}
.ev-live-dot{width:7px;height:7px;border-radius:50%;background:var(--gold3);animation:dl-ann-pulse 2s ease-in-out infinite;flex-shrink:0}
.ev-hero h2{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.35rem,2.8vw,2.05rem);font-weight:900;color:#fff;line-height:1.28;margin:0 0 18px;max-width:540px}
.ev-meta-row{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:30px}
.ev-meta-item{display:flex;align-items:center;gap:7px;font-size:.8rem;color:rgba(255,255,255,.6)}
.ev-meta-item svg{width:14px;height:14px;opacity:.7;flex-shrink:0}
.ev-agenda{margin-bottom:36px}
.ev-agenda-lbl{font-size:.65rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:12px}
.ev-agenda-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:9px;font-size:.83rem;color:rgba(255,255,255,.78);line-height:1.5}
.ev-agenda-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:6px}
.ev-reg-btn{display:inline-flex;align-items:center;gap:10px;background:var(--gold);color:#1a0800;padding:15px 32px;border-radius:8px;font-weight:800;font-size:.92rem;border:none;cursor:pointer;transition:all .25s;letter-spacing:.01em}
.ev-reg-btn:hover{background:#d4a80c;transform:translateY(-2px);box-shadow:0 14px 36px rgba(196,154,10,.38)}
.ev-sidebar{background:rgba(0,0,0,.28);padding:36px 28px;display:flex;flex-direction:column;gap:28px;border-left:1px solid rgba(255,255,255,.06)}
.ev-date-big{text-align:center;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,.08)}
.ev-date-big .ev-day{font-family:var(--font-serif),Georgia,serif;font-size:4.5rem;font-weight:900;color:#fff;line-height:1}
.ev-date-big .ev-mo{font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold3);margin-top:4px}
.ev-cd-label{font-size:.65rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:12px}
.ev-countdown{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.ev-cd-block{background:rgba(255,255,255,.07);border-radius:10px;padding:10px 4px;text-align:center}
.ev-cd-num{font-family:var(--font-serif),Georgia,serif;font-size:1.35rem;font-weight:900;color:#fff;line-height:1}
.ev-cd-lbl{font-size:.55rem;color:rgba(255,255,255,.32);text-transform:uppercase;letter-spacing:.08em;margin-top:3px}
.ev-speakers-lbl{font-size:.65rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px}
.ev-speaker{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.ev-speaker:last-child{margin-bottom:0}
.ev-speaker-img{width:72px;height:72px;border-radius:50%;border:2px solid rgba(255,255,255,.25);overflow:hidden;flex-shrink:0;background:var(--brown2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;color:#fff}
.ev-speaker-img img{width:100%;height:100%;object-fit:cover;display:block}
.ev-speaker-name{font-size:.88rem;font-weight:700;color:#fff;line-height:1.3}
.ev-upcoming-title{font-family:var(--font-serif),Georgia,serif;font-size:1.25rem;font-weight:900;color:var(--brown3);margin-bottom:20px}
.ev-upcoming-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 22px;display:flex;align-items:center;gap:18px;margin-bottom:12px;transition:box-shadow .2s;flex-wrap:wrap}
.ev-upcoming-card:hover{box-shadow:0 6px 24px rgba(58,13,0,.08)}
.ev-upcoming-badge{width:54px;height:54px;border-radius:10px;background:var(--cream2);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.ev-upcoming-day{font-family:var(--font-serif),Georgia,serif;font-size:1.25rem;font-weight:900;color:var(--brown);line-height:1}
.ev-upcoming-mo{font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px}
.ev-upcoming-info{flex:1;min-width:200px}
.ev-upcoming-info h4{font-size:.88rem;font-weight:700;color:var(--warm);margin:0 0 4px;line-height:1.35}
.ev-upcoming-info p{font-size:.76rem;color:var(--muted);margin:0}
.ev-modal-bg{position:fixed;inset:0;background:rgba(8,2,0,.72);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(5px)}
.ev-modal{background:#fff;border-radius:20px;width:100%;max-width:600px;max-height:94dvh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,.4);position:relative;animation:dl-ev-slide-in .3s var(--ease)}
@keyframes dl-ev-slide-in{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.ev-modal-head{background:linear-gradient(135deg,var(--brown3),#5a2510);padding:20px 26px 16px;border-radius:20px 20px 0 0;position:relative;z-index:2;flex-shrink:0}
.ev-modal-close{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-size:.85rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;border:none}
.ev-modal-close:hover{background:rgba(255,255,255,.2);color:#fff}
.ev-modal-head h3{font-family:var(--font-serif),Georgia,serif;font-size:.95rem;font-weight:900;color:#fff;margin:0 24px 3px 0}
.ev-modal-head p{font-size:.72rem;color:rgba(255,255,255,.55);margin:0}
.ev-modal-body{padding:18px 26px 22px;overflow-y:auto;flex:1}
.ev-frow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.ev-fg{margin-bottom:10px}
.ev-fg label{display:block;font-size:.73rem;font-weight:600;color:var(--warm);margin-bottom:4px}
.ev-fg label em{color:var(--brown);font-style:normal}
.ev-fg input,.ev-fg textarea{width:100%;padding:8px 11px;border:1.5px solid var(--border);border-radius:8px;font-size:.84rem;color:var(--warm);outline:none;transition:border-color .2s,box-shadow .2s;background:#fff}
.ev-fg input:focus,.ev-fg textarea:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(96,39,15,.07)}
.ev-fg textarea{min-height:62px;resize:vertical}
.ev-submit{width:100%;padding:12px;background:var(--brown);color:#fff;border:none;border-radius:8px;font-weight:800;font-size:.9rem;cursor:pointer;transition:all .25s;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:10px}
.ev-submit:hover:not(:disabled){background:var(--brown3);box-shadow:0 8px 24px rgba(58,13,0,.25)}
.ev-submit:disabled{opacity:.55;cursor:not-allowed}
.ev-success{text-align:center;padding:16px 0}
.ev-success-icon{font-size:3.2rem;margin-bottom:14px}
.ev-success h3{font-family:var(--font-serif),Georgia,serif;font-size:1.25rem;color:var(--brown3);margin-bottom:8px}
.ev-success p{font-size:.87rem;color:var(--muted);line-height:1.72}
.ev-urgency-bump{animation:dl-seat-bump 2.8s ease-in-out infinite;transform-origin:center}
.ev-reg-btn-hype{animation:dl-hype-pulse 2.4s ease-in-out infinite}
.dl-hp{position:absolute;left:-9999px;top:-9999px;opacity:0;height:0;overflow:hidden;pointer-events:none}
@keyframes dl-ann-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
@keyframes dl-seat-ping{0%{transform:scale(1);opacity:.8}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}
@keyframes dl-seat-fill{from{width:0}to{width:74%}}
@keyframes dl-seat-bump{0%,100%{transform:translateY(0) scale(1)}30%{transform:translateY(-4px) scale(1.012)}60%{transform:translateY(-2px) scale(1.006)}}
@keyframes dl-hype-pulse{0%,100%{box-shadow:0 6px 24px rgba(96,39,15,.35)}50%{box-shadow:0 10px 36px rgba(96,39,15,.55),0 0 0 6px rgba(196,154,10,.12)}}
@media(max-width:900px){.ev-hero-inner{grid-template-columns:1fr}.ev-sidebar{border-left:none;border-top:1px solid rgba(255,255,255,.07);padding:26px}.ev-hero-content{padding:36px 24px 28px}}
@media(max-width:560px){.ev-frow{grid-template-columns:1fr}.ev-modal-body{padding:20px 20px 28px}.ev-countdown{grid-template-columns:repeat(2,1fr)}}
`;

export default async function EventsPage() {
  let rows = [];
  try {
    rows = await fetchEventsSheet();
  } catch (e) {
    /* sheet unreachable — page still renders */
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = rows.map(shapeEvent).filter(e => e.title);
  const isUpcoming = e => {
    const d = parseGvizDate(e.dateIso);
    return d && d >= today;
  };
  const upcoming = events.filter(isUpcoming);
  const past = events.filter(e => !isUpcoming(e));

  const featured = upcoming.length ? upcoming[0] : past[past.length - 1] || null;
  const featuredIsPast = featured ? !isUpcoming(featured) : false;
  const rest = upcoming.length ? upcoming.slice(1) : [];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EventSeries',
        name: 'Dominate Law Marketing Events',
        url: `${SITE.url}/events`,
        description: 'Free virtual events, masterclasses, and workshops for law firm owners.',
        organizer: { '@id': `${SITE.url}/#organization` },
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        isAccessibleForFree: true,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}` },
          { '@type': 'ListItem', position: 2, name: 'Events', item: `${SITE.url}/events` },
        ],
      },
      ...upcoming.map(e => ({
        '@type': 'Event',
        name: e.title,
        ...(startDateIso(e) ? { startDate: startDateIso(e) } : {}),
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        isAccessibleForFree: true,
        location: { '@type': 'VirtualLocation', url: `${SITE.url}/events` },
        organizer: { '@type': 'Organization', name: 'Dominate Law', url: `${SITE.url}/` },
        ...(e.speakers.length
          ? { performer: e.speakers.map(s => ({ '@type': 'Person', name: s.name })) }
          : {}),
      })),
    ],
  };

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: EVENTS_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── Page hero ── */}
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › Events
          </nav>
          <span className="label" style={{ color: 'var(--gold3)' }}>Panel Events &amp; Webinars</span>
          <h1>Live Events That Position You as the Legal Expert in Your Market</h1>
          <p style={{ fontSize: '.96rem', color: 'rgba(255,255,255,.6)', maxWidth: 600, lineHeight: 1.75 }}>
            Quarterly virtual panel events, workshops, and masterclasses — all free, all designed to give
            law firm owners the edge in their local markets.
          </p>
          <div
            style={{
              marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,154,10,0.4)',
              borderRadius: 100, padding: '8px 18px 8px 10px', backdropFilter: 'blur(6px)',
            }}
          >
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0 }}>
              <span style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'rgba(196,154,10,0.3)', animation: 'dl-seat-ping 1.6s ease-out infinite' }} />
              <span style={{ position: 'relative', width: 9, height: 9, borderRadius: '50%', background: '#E8C44A', display: 'block' }} />
            </span>
            <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '.01em' }}>
              Limited seats available — register early to secure your spot
            </span>
          </div>
        </div>
      </section>

      {/* ── Featured + upcoming events (interactive) ── */}
      <section className="section" aria-labelledby="events-heading" style={{ paddingTop: 56 }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <EventsBoard featured={featured} featuredIsPast={featuredIsPast} rest={rest} />

          {/* Replays moved to their own page — banner link */}
          <div className="msm-cta" style={{ marginTop: 52, marginBottom: 0 }}>
            <div>
              <span className="label" style={{ color: 'var(--gold3)' }}>Webinar Replays</span>
              <h3>Missed a session?</h3>
              <p>Every past masterclass and workshop is available on demand — free, in the replay library.</p>
            </div>
            <Link href="/webinar-replays" className="btn btn-gold">Watch the replays →</Link>
          </div>
        </div>
      </section>

      {/* ── Why events work ── */}
      <section className="section section-cream" aria-labelledby="why-events-heading">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Why Events Work</span>
            <h2 id="why-events-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900 }}>
              Why Panel Events Are Your Highest-Converting Lead Gen Channel
            </h2>
          </div>
          <div className="grid-3">
            <div className="card" style={{ padding: '32px 28px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 10 }}>Pre-Qualified Audiences</h3>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78 }}>
                Every person who registers for a legal marketing event is already thinking about growing their
                firm. You&apos;re speaking to the most motivated segment of your market.
              </p>
            </div>
            <div className="card" style={{ padding: '32px 28px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 16 }}>🤝</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 10 }}>Trust Before Contact</h3>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78 }}>
                Attendees who see you present for 90 minutes already know, like, and trust you before they ever
                contact your office. Conversion rates are 3–5x higher than cold outreach.
              </p>
            </div>
            <div className="card" style={{ padding: '32px 28px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 16 }}>📹</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 10 }}>Evergreen Content</h3>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78 }}>
                Every event is recorded and becomes permanent content — distributed as YouTube videos, podcast
                episodes, social media clips, and blog posts for months afterward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Host your own event ── */}
      <section className="section" aria-labelledby="host-heading">
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }}>
            <span className="label">Host Your Own Event</span>
            <h2 id="host-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 14 }}>
              Want to Host a Panel Event at Your Own Firm?
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Our team provides the complete framework, promotional templates, speaker outreach scripts, and
              technical setup guidance so you can host events that fill your pipeline. Download our free Panel
              Event Framework and start planning your first event today.
            </p>
          </div>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
              background: 'var(--brown3)', borderRadius: 16, padding: '28px 32px', flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ color: '#fff', marginBottom: 6, fontSize: '1.15rem', fontWeight: 900 }}>Free Panel Event Framework</h3>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.82rem', margin: 0 }}>
                Complete run-of-show, checklists, and scripts — ready to use at your firm
              </p>
            </div>
            <Link href="/resources" className="btn btn-gold" style={{ flexShrink: 0 }}>Download Free →</Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 16 }}>Register for Our Next Event</h2>
          <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 560, margin: '0 auto', fontSize: '.95rem', lineHeight: 1.75 }}>
            Seats are limited and fill up quickly. Register now to secure your place at the next Dominate Law
            panel event — and receive early access to the recording and resources.
          </p>
          <p style={{ marginTop: 12, fontSize: '.82rem', color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>
            Registration closes once capacity is reached. No waitlist is offered.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link href="/contact" className="btn btn-gold" style={{ padding: '16px 36px', fontSize: '1rem' }}>
              Register for Free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
