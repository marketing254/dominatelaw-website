import Link from 'next/link';
import GuestForm from './GuestForm';

export const metadata = {
  title: 'Apply as Guest or Speaker | Dominate Law Podcast for Attorneys',
  description: 'Apply to be a guest on the Dominate Law Podcast — reach 10,000+ law firm owners. Share your expertise on legal marketing, law firm growth, and legal technology.',
  alternates: { canonical: '/guest-speaker' },
  openGraph: {
    title: 'Apply as Guest or Speaker | Dominate Law Podcast for Attorneys | Dominate Law',
    description: 'Apply to be a guest or speaker on the Dominate Law Podcast — reach 10,000+ law firm owners and attorneys. Share your expertise on legal marketing, law firm growth, and legal technology.',
    url: 'https://www.dominatelaw.com/guest-speaker',
  },
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Apply as Guest or Speaker',
  url: 'https://www.dominatelaw.com/guest-speaker',
  description: 'Apply to be a guest or speaker on the Dominate Law Podcast and reach 10,000+ law firm owners.',
  publisher: { '@id': 'https://www.dominatelaw.com/#organization' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dominatelaw.com' },
      { '@type': 'ListItem', position: 2, name: 'Guest Speaker', item: 'https://www.dominatelaw.com/guest-speaker' },
    ],
  },
};

const css = `
.gs-hero{background:linear-gradient(135deg,var(--brown3) 0%,#5a2010 60%,var(--brown2) 100%);padding:100px 0 80px;position:relative;overflow:hidden}
.gs-hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
.gs-hero-inner{position:relative;z-index:2;display:grid;grid-template-columns:1fr 460px;gap:60px;align-items:start}
.gs-lbl{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5);display:block;margin-bottom:14px}
.gs-hero h1{font-size:clamp(2rem,4vw,3.2rem);font-weight:900;color:#fff;line-height:1.12;margin-bottom:18px}
.gs-hero h1 em{color:var(--gold3);font-style:italic}
.gs-hero-sub{font-size:1.05rem;color:rgba(255,255,255,.65);line-height:1.8;margin-bottom:28px;max-width:520px}
.gs-hero-badges{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.gs-badge{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:100px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);font-size:.78rem;color:rgba(255,255,255,.8);font-weight:600}
.gs-badge svg{width:14px;height:14px}
.gs-host{display:flex;align-items:center;gap:16px;padding:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;max-width:400px}
.gs-host-img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--gold3);flex-shrink:0}
.gs-host-name{font-size:.9rem;font-weight:700;color:#fff}
.gs-host-title{font-size:.74rem;color:rgba(255,255,255,.55);margin-top:2px}
.gs-form-card{background:#fff;border-radius:20px;padding:36px 32px;box-shadow:0 40px 80px rgba(0,0,0,.25)}
.gs-form-tag{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:100px;background:rgba(196,154,10,.12);border:1px solid rgba(196,154,10,.3);font-size:.7rem;font-weight:700;color:var(--gold2);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.gs-form-card h2{font-family:var(--font-serif),Georgia,serif;font-size:1.3rem;font-weight:900;color:var(--brown3);margin-bottom:6px}
.gs-form-card>p{font-size:.82rem;color:var(--muted);margin-bottom:20px;line-height:1.6}
.gs-form{display:flex;flex-direction:column;gap:12px;position:relative}
.gs-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gs-field{display:flex;flex-direction:column;gap:4px}
.gs-field label{font-size:.72rem;font-weight:600;color:var(--warm)}
.gs-field input,.gs-field select,.gs-field textarea{padding:11px 14px;border:1.5px solid var(--border);border-radius:6px;font-size:.85rem;color:var(--warm);background:var(--cream);outline:none;transition:border-color .2s,background .2s;width:100%}
.gs-field input:focus,.gs-field select:focus,.gs-field textarea:focus{border-color:var(--gold);background:#fff}
.gs-field select{cursor:pointer}
.gs-field textarea{resize:vertical;min-height:80px}
.gs-submit{width:100%;padding:15px;background:var(--brown);color:#fff;font-size:.95rem;font-weight:700;border-radius:6px;cursor:pointer;transition:background .2s,transform .15s,box-shadow .2s;margin-top:4px}
.gs-submit:hover:not(:disabled){background:var(--brown3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(96,39,15,.3)}
.gs-submit:disabled{opacity:.7;cursor:not-allowed}
.gs-note{font-size:.7rem;color:var(--muted);text-align:center;margin-top:8px}
.gs-success{text-align:center;padding:20px 0}
.gs-success svg{margin:0 auto 16px}
.gs-success h3{font-family:var(--font-serif),Georgia,serif;font-size:1.2rem;color:var(--brown3);margin-bottom:8px}
.gs-success p{font-size:.85rem;color:var(--muted);line-height:1.6}
.sec-lbl{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:14px}
.sec-h2{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:var(--brown);line-height:1.2;margin-bottom:14px}
.sec-sub{font-size:1rem;color:var(--muted);line-height:1.8;max-width:560px}
.why-sec{padding:90px 0;background:var(--cream)}
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:50px}
.why-card{background:#fff;border-radius:16px;padding:28px 24px;border:1px solid var(--border);transition:transform .3s,box-shadow .3s}
.why-card:hover{transform:translateY(-5px);box-shadow:0 18px 50px rgba(96,39,15,.1)}
.why-icon{width:48px;height:48px;border-radius:10px;background:var(--brown);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.why-icon svg{width:24px;height:24px}
.why-card h3{font-family:var(--font-serif),Georgia,serif;font-size:1.05rem;font-weight:700;color:var(--brown3);margin-bottom:10px}
.why-card p{font-size:.85rem;color:var(--muted);line-height:1.7}
.topics-sec{padding:90px 0}
.topics-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.topics-list{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}
.topic-tag{padding:10px 16px;background:var(--cream);border-radius:8px;border:1px solid var(--border);font-size:.82rem;font-weight:500;color:var(--warm);transition:all .2s;cursor:default;text-align:center}
.topic-tag:hover{background:var(--brown);color:#fff;border-color:var(--brown)}
.topic-img{border-radius:20px;overflow:hidden;aspect-ratio:4/3}
.topic-img img{width:100%;height:100%;object-fit:cover}
.pgstats{padding:80px 0;background:var(--brown3)}
.pgstats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:2px}
.pgstat{text-align:center;padding:32px 20px}
.pgstat-num{font-family:var(--font-serif),Georgia,serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:var(--gold3)}
.pgstat-lbl{font-size:.8rem;color:rgba(255,255,255,.5);margin-top:6px}
.types-sec{padding:90px 0;background:var(--cream)}
.types-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:40px}
.type-card{background:#fff;border-radius:14px;padding:28px;border:1px solid var(--border);display:flex;gap:18px;align-items:flex-start}
.type-card-icon{width:44px;height:44px;border-radius:10px;background:var(--brown);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.type-card-icon svg{width:22px;height:22px}
.type-card h3{font-family:var(--font-serif),Georgia,serif;font-size:1rem;font-weight:700;color:var(--brown3);margin-bottom:7px}
.type-card p{font-size:.83rem;color:var(--muted);line-height:1.65}
@media(max-width:1024px){
  .gs-hero-inner{grid-template-columns:1fr;gap:40px}
  .why-grid{grid-template-columns:1fr 1fr}
  .topics-grid{grid-template-columns:1fr;gap:40px}
  .pgstats-row{grid-template-columns:1fr 1fr}
  .types-grid{grid-template-columns:1fr}
}
@media(max-width:768px){
  .gs-hero{padding:70px 0 60px}
  .why-grid{grid-template-columns:1fr}
  .gs-row{grid-template-columns:1fr}
  .topics-list{grid-template-columns:1fr}
}
`;

export default function GuestSpeakerPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ═══ HERO ═══ */}
      <section className="gs-hero">
        <div className="container">
          <div className="gs-hero-inner">
            <div>
              <span className="gs-lbl">Dominate Law Podcast</span>
              <h1>Share Your Expertise.<br />Reach <em>10,000+ Attorneys.</em></h1>
              <p className="gs-hero-sub">We’re looking for legal industry experts, law firm owners, marketing specialists, and innovators to join Naren Arulrajah on the Dominate Law Podcast — the go-to show for attorneys serious about growing their practice.</p>
              <div className="gs-hero-badges">
                <div className="gs-badge"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8C44A" strokeWidth="1.5" /><path d="M5 8l2 2 4-4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>10,000+ Attorney Listeners</div>
                <div className="gs-badge"><svg viewBox="0 0 16 16" fill="none"><path d="M8 2C5.24 2 3 4.24 3 7c0 3.25 5 9 5 9s5-5.75 5-9c0-2.76-2.24-5-5-5z" stroke="#E8C44A" strokeWidth="1.4" /></svg>Global Reach</div>
                <div className="gs-badge"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8C44A" strokeWidth="1.5" /><path d="M8 5v3.5l2 1.5" stroke="#E8C44A" strokeWidth="1.4" strokeLinecap="round" /></svg>30–45 Min Episodes</div>
              </div>
              <div className="gs-host">
                <img src="/images/naren.jpg" alt="Naren Arulrajah — Host of Dominate Law Podcast" loading="lazy" className="gs-host-img" />
                <div>
                  <div className="gs-host-name">Naren Arulrajah</div>
                  <div className="gs-host-title">Founder &amp; Host — Dominate Law Podcast<br />CEO, Ekwa Marketing</div>
                </div>
              </div>
            </div>
            <div>
              <div className="gs-form-card">
                <div className="gs-form-tag">📣 Apply Now — Open Spots Available</div>
                <h2>Apply as a Guest or Speaker</h2>
                <p>Tell us about yourself and what you’d like to share. We review all applications within 3 business days.</p>
                <GuestForm />
                <p className="gs-note">📧 Questions? Email us at <a href="mailto:info@dominatelaw.com" style={{ color: 'var(--brown)', fontWeight: 600 }}>info@dominatelaw.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY BE A GUEST */}
      <section className="why-sec">
        <div className="container">
          <div>
            <span className="sec-lbl">Why Dominate Law?</span>
            <h2 className="sec-h2">Reach the Attorneys Who<br />Are Serious About Growth</h2>
            <p className="sec-sub">Our audience is made up of ambitious law firm owners and attorneys who actively invest in learning, marketing, and scaling their practices.</p>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#E8C44A" strokeWidth="1.8" /><path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" /></svg></div>
              <h3>10,000+ Attorney Listeners</h3>
              <p>Your expertise reaches a highly engaged audience of law firm owners, managing partners, and solo practitioners across North America and beyond.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.8 5.3.77-3.85 3.75.9 5.3L12 14.1l-4.75 2.52.9-5.3L4.3 7.57l5.3-.77z" stroke="#E8C44A" strokeWidth="1.7" strokeLinejoin="round" /></svg></div>
              <h3>Build Your Authority</h3>
              <p>Being featured on Dominate Law positions you as a go-to expert in your field. Gain credibility, increase referrals, and strengthen your personal brand.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Powerful Network Access</h3>
              <p>Connect with Ekwa Marketing’s network of 2,400+ law firms, potential clients, referral partners, and legal industry leaders.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#E8C44A" strokeWidth="1.8" /><path d="M8 21h8M12 17v4" stroke="#E8C44A" strokeWidth="1.7" strokeLinecap="round" /></svg></div>
              <h3>Multi-Platform Distribution</h3>
              <p>Episodes are published on Spotify, Apple Podcasts, YouTube, and shared across our social media channels with 15,000+ combined followers.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Professionally Produced</h3>
              <p>High-quality audio, video, and show notes. We handle all production and editing so you just show up and share your knowledge.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16M4 6h16M4 18h10" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" /></svg></div>
              <h3>Evergreen Content Asset</h3>
              <p>Your episode lives forever. It continues to drive traffic, referrals, and credibility to you and your practice for years after recording.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS WE COVER */}
      <section className="topics-sec">
        <div className="container">
          <div className="topics-grid">
            <div>
              <span className="sec-lbl">Episode Topics</span>
              <h2 className="sec-h2">What We Talk About<br />on the Show</h2>
              <p className="sec-sub">Every episode is focused on actionable strategies, real insights, and expert knowledge that attorneys can implement immediately in their practices.</p>
              <div className="topics-list">
                <div className="topic-tag">Law Firm Marketing</div>
                <div className="topic-tag">Practice Management</div>
                <div className="topic-tag">Legal Technology &amp; AI</div>
                <div className="topic-tag">Client Experience</div>
                <div className="topic-tag">Business Growth</div>
                <div className="topic-tag">Attorney Wellness</div>
                <div className="topic-tag">Finance &amp; Billing</div>
                <div className="topic-tag">Social Media</div>
                <div className="topic-tag">Ethics &amp; Compliance</div>
                <div className="topic-tag">SEO for Lawyers</div>
                <div className="topic-tag">Niche Strategies</div>
                <div className="topic-tag">Leadership</div>
              </div>
              <div style={{ marginTop: 28 }}>
                <Link href="/podcast" className="btn btn-primary">Listen to Past Episodes →</Link>
              </div>
            </div>
            <div className="topic-img">
              <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80" alt="Podcast recording studio" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="pgstats">
        <div className="container">
          <div className="pgstats-row">
            <div className="pgstat"><div className="pgstat-num">10K+</div><div className="pgstat-lbl">Monthly Listeners</div></div>
            <div className="pgstat"><div className="pgstat-num">60+</div><div className="pgstat-lbl">Episodes Published</div></div>
            <div className="pgstat"><div className="pgstat-num">15K+</div><div className="pgstat-lbl">Social Media Followers</div></div>
            <div className="pgstat"><div className="pgstat-num">40+</div><div className="pgstat-lbl">Practice Areas Represented</div></div>
          </div>
        </div>
      </section>

      {/* GUEST TYPES */}
      <section className="types-sec">
        <div className="container">
          <div>
            <span className="sec-lbl">Who We’re Looking For</span>
            <h2 className="sec-h2">Are You a Good Fit?</h2>
            <p className="sec-sub">We welcome a diverse range of voices from across the legal industry and legal marketing space.</p>
          </div>
          <div className="types-grid">
            <div className="type-card">
              <div className="type-card-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#E8C44A" strokeWidth="1.8" /><path d="M7 8h10M7 12h7" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <div><h3>Law Firm Owners &amp; Managing Partners</h3><p>Share how you’ve grown your practice, managed operations, or navigated challenges. Real-world experience resonates deeply with our attorney audience.</p></div>
            </div>
            <div className="type-card">
              <div className="type-card-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.8 5.3.77-3.85 3.75.9 5.3L12 14.1l-4.75 2.52.9-5.3L4.3 7.57l5.3-.77z" stroke="#E8C44A" strokeWidth="1.7" strokeLinejoin="round" /></svg></div>
              <div><h3>Legal Marketing Experts</h3><p>Got proven strategies for law firm SEO, social media, content, or lead generation? Our audience is hungry for tactical marketing knowledge.</p></div>
            </div>
            <div className="type-card">
              <div className="type-card-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#E8C44A" strokeWidth="1.8" /><path d="M2 20h20M8 17v3M16 17v3" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <div><h3>Legal Technology Founders &amp; Innovators</h3><p>Building a product or platform for law firms? Tell our audience about the future of legal technology, AI tools, and practice automation.</p></div>
            </div>
            <div className="type-card">
              <div className="type-card-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#E8C44A" strokeWidth="1.8" /><path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" /></svg></div>
              <div><h3>Coaches, Consultants &amp; Thought Leaders</h3><p>Attorney coaches, business consultants, wellness advocates, and professional development experts who serve the legal community.</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
