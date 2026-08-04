import Link from 'next/link';
import ResourcesGate from './ResourcesGate';
import LeadForm from './LeadForm';

export const metadata = {
  title: 'Free Law Firm Resources, Guides & Templates',
  description:
    'Free guides, templates, checklists, and tools built specifically for law firm owners and managing partners — SEO, social media, PPC, email marketing, practice management, legal tech, and AI.',
  keywords:
    'law firm resources, free legal marketing guides, law firm templates, attorney checklists, law firm growth blueprint',
  alternates: { canonical: '/resources' },
  openGraph: {
    title: 'Free Law Firm Resources, Guides & Templates | Dominate Law',
    description:
      'Everything you need to grow your law firm — 100% free. Guides, templates, checklists, and tools for law firm owners and managing partners.',
    url: '/resources',
  },
};

const RES_CSS = `
.res-gate-ov{position:fixed;inset:0;background:rgba(8,2,0,.78);backdrop-filter:blur(6px);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
.res-gate-box{background:#fff;border-radius:20px;width:100%;max-width:520px;padding:40px 38px 30px;position:relative;box-shadow:0 40px 100px rgba(0,0,0,.4);margin:auto}
.res-gate-badge{width:56px;height:56px;border-radius:14px;background:var(--brown3);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.res-gate-badge svg{width:30px;height:30px}
.res-gate-eyebrow{font-size:.66rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold2);margin-bottom:8px}
.res-gate-box h2{font-family:var(--font-serif),Georgia,serif;font-size:1.5rem;font-weight:900;color:var(--brown3);line-height:1.25;margin-bottom:10px}
.res-gate-box>p{font-size:.85rem;color:var(--muted);line-height:1.65;margin-bottom:20px}
.res-gate-field{margin-bottom:14px}
.res-gate-field label{display:block;font-size:.76rem;font-weight:700;color:var(--warm);margin-bottom:5px}
.res-gate-field input,.res-gate-field select{width:100%;padding:11px 13px;border:1.5px solid var(--border);border-radius:8px;font-size:.88rem;color:var(--warm);outline:none;transition:border-color .2s;background:#fff}
.res-gate-field input:focus,.res-gate-field select:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(96,39,15,.08)}
.res-gate-err{display:none;font-size:.7rem;color:#c0392b;font-weight:700;margin-top:4px}
.res-gate-err.on{display:block}
.res-gate-submit{width:100%;padding:13px;background:var(--brown);color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:800;cursor:pointer;transition:background .2s;margin-top:6px}
.res-gate-submit:hover{background:var(--brown3)}
.res-gate-note{font-size:.7rem;color:var(--muted);text-align:center;margin-top:14px}
.res-gate-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;background:rgba(96,39,15,.1);border:2px solid rgba(96,39,15,.15);cursor:pointer;font-size:1.1rem;font-weight:700;color:var(--brown);display:flex;align-items:center;justify-content:center;transition:all .2s}
.res-gate-close:hover{background:rgba(96,39,15,.2);border-color:rgba(96,39,15,.3)}
.dl-hp{position:absolute;left:-9999px;top:-9999px;opacity:0;height:0;overflow:hidden;pointer-events:none}
.res-guide-card{padding:24px}
.res-card-kicker{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold2);margin-bottom:8px}
.res-guide-card h3{font-size:1.02rem;font-weight:900;line-height:1.35;margin-bottom:8px}
.res-guide-card p{font-size:.84rem;color:var(--muted);line-height:1.68;margin-bottom:14px}
.res-checklist{list-style:none;display:flex;flex-direction:column;gap:10px;margin:0 0 24px;padding:0}
.res-checklist li{display:flex;gap:12px;align-items:flex-start;font-size:0.95rem;color:var(--warm)}
.res-checklist li span{color:var(--gold);font-weight:700;margin-top:1px}
`;

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dominatelaw.com' },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://www.dominatelaw.com/resources' },
  ],
};

function GuideCard({ icon, kicker, title, desc, href, cta = 'Read Guide →' }) {
  return (
    <article className="card res-guide-card">
      <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{icon}</div>
      <div className="res-card-kicker">{kicker}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <Link href={href} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '.82rem' }}>{cta}</Link>
    </article>
  );
}

export default function ResourcesPage() {
  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: RES_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

      <ResourcesGate />

      {/* ── Page hero ── */}
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › Resources
          </nav>
          <span className="label" style={{ color: 'var(--gold3)' }}>Free Law Firm Resources</span>
          <h1>Everything You Need to Grow Your Law Firm — 100% Free</h1>
          <p style={{ fontSize: '.96rem', color: 'rgba(255,255,255,.6)', maxWidth: 600, lineHeight: 1.75 }}>
            Guides, templates, checklists, and tools built specifically for law firm owners and managing
            partners. No credit card. No catch.
          </p>
        </div>
      </section>

      {/* ── Featured lead magnet ── */}
      <section className="section" aria-labelledby="lead-magnet-heading">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div style={{ background: 'var(--brown3)', borderRadius: 16, padding: 48, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--gold)' }} />
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>📘</div>
              <h3 style={{ color: 'var(--gold)', fontSize: '1.4rem', marginBottom: 8 }}>The Law Firm Growth Blueprint</h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.92rem', marginBottom: 24 }}>
                10 Proven Strategies to Dominate Your Legal Market in 2026 — 17 pages, completely free
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>✓ 17 pages</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>✓ Self-assessment</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>✓ 90-day plan</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                FREE DOWNLOAD — No Credit Card Required
              </div>
            </div>
            <div>
              <span className="label">Featured Download</span>
              <div style={{ width: 48, height: 3, background: 'var(--gold)', borderRadius: 2, margin: '8px 0 20px' }} />
              <h2 id="lead-magnet-heading" style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 16 }}>
                The Law Firm Growth Blueprint 2026
              </h2>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78, marginBottom: 12 }}>
                This 17-page guide gives you the exact same 10-strategy framework our team uses to help law
                firms go from invisible to dominant in their local markets.
              </p>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78, marginBottom: 12 }}>Inside you&apos;ll discover:</p>
              <ul className="res-checklist">
                <li><span>✓</span> How to rank on page 1 of Google for your practice area + city</li>
                <li><span>✓</span> Building a 5-star review system that generates trust automatically</li>
                <li><span>✓</span> The content strategy that converts prospects before they call</li>
                <li><span>✓</span> A 10-point self-assessment so you know exactly where to focus</li>
                <li><span>✓</span> A 90-day action plan to start implementing immediately</li>
              </ul>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Digital marketing guides ── */}
      <section className="section section-cream" aria-labelledby="dm-guides-heading">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Digital Marketing</span>
            <h2 id="dm-guides-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 14 }}>
              Law Firm Digital Marketing Guides
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Comprehensive, step-by-step guides to dominating every digital marketing channel — written
              specifically for law firm owners and managing partners.
            </p>
          </div>
          <div className="grid-3">
            <GuideCard icon="🔍" kicker="SEO · 12 min read" title="The Complete Law Firm SEO Guide 2026"
              desc="Master local SEO: keyword research, on-page optimization, Google Business Profile, citations, link building, and a 90-day action plan."
              href="/blog/law-firm-seo-guide-2026" />
            <GuideCard icon="📍" kicker="Local Search · 9 min read" title="Google Business Profile for Law Firms 2026"
              desc="A fully optimized GBP puts your firm in the local 3-Pack that captures 44% of all clicks. Complete setup and ongoing management guide."
              href="/blog/google-business-profile-lawyers" />
            <GuideCard icon="📱" kicker="Social Media · 10 min read" title="Law Firm Social Media Strategy 2026"
              desc="The 4-content-type framework, platform priorities (LinkedIn, YouTube, Instagram, Facebook), weekly system, and ROI measurement."
              href="/blog/law-firm-social-media-strategy" />
            <GuideCard icon="💰" kicker="Paid Ads · 11 min read" title="Law Firm PPC & Google Ads Guide 2026"
              desc="Campaign structure, keyword strategy, ad copy formulas, landing pages, bidding strategies, budget guidance ($2K–$5K+/mo), and conversion tracking."
              href="/blog/law-firm-ppc-guide-2026" />
            <GuideCard icon="📧" kicker="Email Marketing · 10 min read" title="Law Firm Email Marketing Guide 2026"
              desc="5-email nurture sequence, list building, segmentation, 10 subject line formulas, CAN-SPAM compliance, platform recommendations, and benchmarks."
              href="/blog/law-firm-email-marketing-guide" />
            <article className="card res-guide-card" style={{ background: 'var(--brown3)', borderColor: 'transparent' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🎯</div>
              <div className="res-card-kicker" style={{ color: 'var(--gold3)' }}>Strategy Session</div>
              <h3 style={{ color: '#fff' }}>Get a Custom Digital Marketing Plan</h3>
              <p style={{ color: 'rgba(255,255,255,.6)' }}>
                Our team will build a personalised digital marketing roadmap for your practice area, city, and
                growth goals — in one free 30-minute session.
              </p>
              <Link href="/msm" className="btn btn-gold" style={{ padding: '9px 18px', fontSize: '.82rem' }}>Book a Session →</Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── Practice management guides ── */}
      <section className="section" aria-labelledby="pm-guides-heading">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Practice Management</span>
            <h2 id="pm-guides-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 14 }}>
              Law Firm Operations &amp; Growth Guides
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Build the systems, processes, and client experience that transform your law practice into a
              scalable, profitable business.
            </p>
          </div>
          <div className="grid-3">
            <GuideCard icon="⚙️" kicker="Operations · 13 min read" title="Law Firm Practice Management Guide 2026"
              desc="The 5 core operational systems every law firm needs: intake, case management, document control, billing, and team communication — plus a 90-day improvement plan."
              href="/blog/law-firm-practice-management-guide" />
            <GuideCard icon="⭐" kicker="Client Experience · 11 min read" title="The Client Experience Blueprint for Law Firms"
              desc="Map the 8 moments of truth in every engagement, set communication standards, build a review generation system, and measure Net Promoter Score."
              href="/blog/law-firm-client-experience-guide" />
            <article className="card res-guide-card" style={{ background: 'var(--cream2)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📊</div>
              <div className="res-card-kicker">KPI Toolkit</div>
              <h3>Law Firm KPI Dashboard Template</h3>
              <p>
                Track the 8 metrics that predict law firm growth — billable utilization, realization rate,
                collection rate, average case value, client satisfaction, and more.
              </p>
              <Link href="/msm" className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '.82rem' }}>Request Template →</Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── Technology guides ── */}
      <section className="section section-cream" aria-labelledby="tech-guides-heading">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Technology</span>
            <h2 id="tech-guides-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 14 }}>
              Legal Technology &amp; AI Guides
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Stay ahead of the technology curve. These guides help you choose the right tools, implement AI
              safely, and build a tech stack that gives your firm a competitive edge.
            </p>
          </div>
          <div className="grid-3">
            <GuideCard icon="💻" kicker="Legal Tech · 14 min read" title="Legal Technology Guide 2026"
              desc="Practice management software (Clio, Filevine), document automation, client intake CRM, time tracking, legal research platforms, cybersecurity, and a 6-month tech modernization roadmap."
              href="/blog/legal-technology-guide-2026" />
            <GuideCard icon="🤖" kicker="Artificial Intelligence · 12 min read" title="AI for Law Firms 2026"
              desc="Practical AI applications: document review (Harvey, Kira), AI legal research, drafting assistance, intake chatbots, transcription tools, ABA ethics compliance, and a 90-day AI adoption plan."
              href="/blog/ai-for-law-firms-guide-2026" />
            <article className="card res-guide-card" style={{ background: 'var(--brown3)', borderColor: 'transparent' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🔒</div>
              <div className="res-card-kicker" style={{ color: 'var(--gold3)' }}>Cybersecurity</div>
              <h3 style={{ color: '#fff' }}>Law Firm Cybersecurity Checklist</h3>
              <p style={{ color: 'rgba(255,255,255,.6)' }}>
                ABA Model Rule 1.6 requires reasonable cybersecurity measures. Get our 25-point security
                checklist covering 2FA, encryption, backups, and staff training.
              </p>
              <Link href="/msm" className="btn btn-gold" style={{ padding: '9px 18px', fontSize: '.82rem' }}>Request Checklist →</Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="label">Next Step</span>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 16 }}>
            Want a Personalized Growth Plan for Your Firm?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 560, margin: '0 auto 32px', fontSize: '.95rem', lineHeight: 1.75 }}>
            The resources above will get you started. A strategy session with our team will get you there
            faster — with a custom plan built around your specific market, practice area, and goals.
          </p>
          <Link href="/msm" className="btn btn-gold" style={{ padding: '16px 36px', fontSize: '1rem' }}>
            Book a Strategy Session →
          </Link>
        </div>
      </section>
    </main>
  );
}
