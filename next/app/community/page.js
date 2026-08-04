import Link from 'next/link';
import JoinForm from './JoinForm';

export const metadata = {
  title: 'Law Firm Owners Community & Attorney Peer Network | Dominate Law',
  description: 'Join 500+ law firm owners in the Dominate Law community — share growth strategies, access exclusive resources, get peer support, and scale your practice.',
  alternates: { canonical: '/community' },
  openGraph: {
    title: 'Law Firm Owners Community & Attorney Peer Network | Dominate Law',
    description: 'Join 500+ law firm owners in the Dominate Law Community — share proven growth strategies, access exclusive resources, get peer support, and grow your practice alongside ambitious attorneys.',
    url: 'https://www.dominatelaw.com/community',
  },
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Law Firm Owners Community',
  url: 'https://www.dominatelaw.com/community',
  description: 'Join 500+ law firm owners sharing proven growth strategies and peer support.',
  publisher: { '@id': 'https://www.dominatelaw.com/#organization' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dominatelaw.com' },
      { '@type': 'ListItem', position: 2, name: 'Community', item: 'https://www.dominatelaw.com/community' },
    ],
  },
};

const css = `
.cm-hero{background:linear-gradient(135deg,#1a0500 0%,var(--brown3) 40%,var(--brown) 100%);padding:100px 0 90px;position:relative;overflow:hidden}
.cm-hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
.cm-hero-inner{position:relative;z-index:2;display:grid;grid-template-columns:1fr 400px;gap:60px;align-items:center}
.cm-live-tag{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:100px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);font-size:.74rem;font-weight:700;color:rgba(255,255,255,.75);margin-bottom:22px}
.cm-live-dot{width:8px;height:8px;border-radius:50%;background:var(--gold3);animation:pulse 2s ease-in-out infinite}
.cm-hero h1{font-size:clamp(2.2rem,4.5vw,3.5rem);font-weight:900;color:#fff;line-height:1.1;margin-bottom:18px}
.cm-hero h1 em{color:var(--gold3);font-style:italic}
.cm-hero-sub{font-size:1.05rem;color:rgba(255,255,255,.65);line-height:1.8;margin-bottom:36px;max-width:540px}
.cm-hero-btns{display:flex;gap:14px;flex-wrap:wrap}
.cm-hero-stats{display:flex;margin-top:50px;padding-top:40px;border-top:1px solid rgba(255,255,255,.1)}
.cm-hero-stat{padding:0 32px 0 0;text-align:left;border-right:1px solid rgba(255,255,255,.1);margin-right:32px}
.cm-hero-stat:last-child{border-right:none;margin-right:0}
.cm-hero-stat-num{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.6rem,2.5vw,2rem);font-weight:900;color:var(--gold3)}
.cm-hero-stat-lbl{font-size:.72rem;color:rgba(255,255,255,.5);margin-top:4px}
.cm-hero-form-card{background:#fff;border-radius:20px;padding:32px 28px;box-shadow:0 24px 80px rgba(0,0,0,.3)}
.cm-hero-form-card h3{font-family:var(--font-serif),Georgia,serif;font-size:1.15rem;font-weight:900;color:var(--brown3);margin-bottom:6px}
.cm-hero-form-card>p{font-size:.8rem;color:var(--muted);margin-bottom:18px;line-height:1.6}
.join-card-tag{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:100px;background:rgba(196,154,10,.12);border:1px solid rgba(196,154,10,.3);font-size:.7rem;font-weight:700;color:var(--gold2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
.sec-lbl{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:14px}
.sec-h2{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:var(--brown);line-height:1.2;margin-bottom:14px}
.sec-sub{font-size:1rem;color:var(--muted);line-height:1.8;max-width:560px}
.feat-sec{padding:90px 0;background:rgba(96,39,15,.13)}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:50px}
.feat-card{background:#fff;border-radius:16px;padding:28px 24px;border:1px solid var(--border);transition:transform .3s,box-shadow .3s}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 16px 44px rgba(96,39,15,.09)}
.feat-icon{width:46px;height:46px;border-radius:10px;background:var(--brown);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.feat-icon svg{width:22px;height:22px}
.feat-card h3{font-family:var(--font-serif),Georgia,serif;font-size:1rem;font-weight:700;color:var(--brown3);margin-bottom:8px}
.feat-card p{font-size:.83rem;color:var(--muted);line-height:1.65}
.who-sec{padding:90px 0}
.who-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.who-img{border-radius:20px;overflow:hidden;aspect-ratio:4/3}
.who-img img{width:100%;height:100%;object-fit:cover}
.who-list{display:flex;flex-direction:column;gap:14px;margin-top:24px}
.who-item{display:flex;gap:12px;align-items:flex-start}
.who-icon{width:36px;height:36px;border-radius:8px;background:rgba(196,154,10,.12);border:1.5px solid rgba(196,154,10,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.who-icon svg{width:16px;height:16px}
.who-item strong{display:block;font-size:.88rem;font-weight:700;color:var(--warm);margin-bottom:3px}
.who-item p{font-size:.8rem;color:var(--muted);line-height:1.6}
.founder-sec{padding:90px 0;background:var(--brown3);position:relative;overflow:hidden}
.founder-grid{display:grid;grid-template-columns:300px 1fr;gap:60px;align-items:center;position:relative;z-index:2}
.founder-img{width:220px;height:220px;border-radius:50%;object-fit:cover;object-position:center top;border:4px solid var(--gold3);margin:0 auto 20px;display:block}
.founder-name{font-family:var(--font-serif),Georgia,serif;font-size:1.1rem;font-weight:900;color:#fff;text-align:center}
.founder-title{font-size:.78rem;color:rgba(255,255,255,.5);text-align:center;margin-top:5px;line-height:1.5}
.founder-social{display:flex;gap:8px;justify-content:center;margin-top:12px}
.founder-social a{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:rgba(255,255,255,.5);transition:all .2s}
.founder-social a:hover{background:var(--gold);color:#fff;border-color:var(--gold)}
.founder-quote{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.3rem,2.5vw,1.8rem);font-weight:700;color:#fff;line-height:1.45;margin-bottom:20px;font-style:italic}
.founder-body{font-size:.9rem;color:rgba(255,255,255,.6);line-height:1.8}
.social-sec{padding:60px 0;border-bottom:1px solid var(--border)}
.social-row{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center}
.social-link{display:flex;align-items:center;gap:10px;padding:12px 22px;border-radius:10px;border:1px solid var(--border);font-size:.85rem;font-weight:600;color:var(--warm);background:#fff;transition:all .25s}
.social-link:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(96,39,15,.12)}
.social-link svg{width:20px;height:20px;flex-shrink:0}
.join-sec{padding:90px 0;background:rgba(96,39,15,.13)}
.join-grid{display:grid;grid-template-columns:1fr 480px;gap:60px;align-items:start}
.join-perks{display:flex;flex-direction:column;gap:14px;margin-top:28px}
.join-perk{display:flex;gap:14px;align-items:flex-start}
.join-perk-check{width:22px;height:22px;border-radius:50%;background:rgba(196,154,10,.12);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:3px}
.join-perk-check svg{width:10px;height:10px}
.join-perk strong{font-size:.9rem;font-weight:700;color:var(--warm);display:block;margin-bottom:2px}
.join-perk p{font-size:.82rem;color:var(--muted);line-height:1.55}
.join-card{background:#fff;border-radius:20px;padding:36px 32px;box-shadow:0 20px 60px rgba(58,13,0,.1);border:1px solid var(--border)}
.join-card h2{font-family:var(--font-serif),Georgia,serif;font-size:1.3rem;font-weight:900;color:var(--brown3);margin-bottom:8px}
.join-card>p{font-size:.82rem;color:var(--muted);margin-bottom:20px;line-height:1.6}
.join-form{display:flex;flex-direction:column;gap:12px;position:relative}
.join-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.jf{display:flex;flex-direction:column;gap:4px}
.jf label{font-size:.72rem;font-weight:600;color:var(--warm)}
.jf input,.jf select{padding:11px 14px;border:1.5px solid var(--border);border-radius:6px;font-size:.85rem;color:var(--warm);background:var(--cream);outline:none;transition:border-color .2s,background .2s;width:100%}
.jf input:focus,.jf select:focus{border-color:var(--gold);background:#fff}
.jf select{cursor:pointer}
.join-submit{width:100%;padding:15px;background:var(--brown);color:#fff;font-size:.95rem;font-weight:700;border-radius:6px;cursor:pointer;transition:background .2s,transform .15s,box-shadow .2s;margin-top:4px}
.join-submit:hover:not(:disabled){background:var(--brown3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(96,39,15,.3)}
.join-submit:disabled{opacity:.7;cursor:not-allowed}
.join-note{font-size:.7rem;color:var(--muted);text-align:center;margin-top:8px}
.join-success{text-align:center;padding:20px 0}
.join-success svg{margin:0 auto 16px}
.join-success h3{font-family:var(--font-serif),Georgia,serif;font-size:1.2rem;color:var(--brown3);margin-bottom:8px}
.join-success p{font-size:.85rem;color:var(--muted);line-height:1.6}
@media(max-width:1024px){
  .feat-grid{grid-template-columns:1fr 1fr}
  .who-grid,.founder-grid,.join-grid{grid-template-columns:1fr;gap:40px}
  .founder-grid{text-align:center}
  .cm-hero-inner{grid-template-columns:1fr}
  .cm-hero-form-card{display:none}
  .cm-hero-stats{flex-wrap:wrap;gap:20px}
  .cm-hero-stat{border:none;padding:10px 20px}
}
@media(max-width:768px){
  .feat-grid{grid-template-columns:1fr}
  .join-row{grid-template-columns:1fr}
  .cm-hero-btns{flex-direction:column;align-items:center}
  .cm-hero-btns .btn{width:100%;max-width:320px;justify-content:center}
  .social-row{flex-direction:column;align-items:stretch}
  .social-link{justify-content:center}
}
`;

export default function CommunityPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* HERO */}
      <section className="cm-hero">
        <div className="container">
          <div className="cm-hero-inner">
            <div>
              <div className="cm-live-tag"><span className="cm-live-dot" /> Now Open — Free to Join</div>
              <h1>The Private Network for<br />Attorneys Who Want to <em>Dominate.</em></h1>
              <p className="cm-hero-sub">Join a community of ambitious law firm owners and attorneys sharing real strategies, exclusive resources, and peer support to grow their practices and win more clients.</p>
              <div className="cm-hero-btns">
                <a href="#join" className="btn btn-gold">Join the Community — Free →</a>
                <Link href="/podcast" className="btn btn-outline-w">Listen to the Podcast</Link>
              </div>
              <div className="cm-hero-stats">
                <div className="cm-hero-stat"><div className="cm-hero-stat-num">Growing</div><div className="cm-hero-stat-lbl">Law Firm Network</div></div>
                <div className="cm-hero-stat"><div className="cm-hero-stat-num">60+</div><div className="cm-hero-stat-lbl">Podcast Episodes</div></div>
                <div className="cm-hero-stat"><div className="cm-hero-stat-num">Free</div><div className="cm-hero-stat-lbl">Always Free to Join</div></div>
                <div className="cm-hero-stat"><div className="cm-hero-stat-num">40+</div><div className="cm-hero-stat-lbl">Practice Areas</div></div>
              </div>
            </div>
            <div>
              <div className="cm-hero-form-card">
                <div className="join-card-tag">🎉 Free to Join</div>
                <h3>Join the Community</h3>
                <p>Instant access. No credit card. No spam.</p>
                <JoinForm source="Hero Form" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat-sec">
        <div className="container">
          <div>
            <span className="sec-lbl">What You Get</span>
            <h2 className="sec-h2">Everything You Need to<br />Grow Your Practice</h2>
            <p className="sec-sub">The Dominate Law Community is your unfair advantage — exclusive access to resources, experts, and peers that most attorneys never have.</p>
          </div>
          <div className="feat-grid">
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Private Discussion Forums</h3>
              <p>Ask questions, share wins, and get advice from fellow law firm owners across every practice area. Real answers from people who’ve been in your shoes.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#E8C44A" strokeWidth="1.8" /><path d="M3 9h18M7 4v2M17 4v2" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <h3>Exclusive Webinars &amp; Events</h3>
              <p>Members-first access to live webinars, Q&amp;A sessions with Naren Arulrajah, and virtual workshops on marketing, operations, and growth.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 2h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#E8C44A" strokeWidth="1.8" /><path d="M7 7h10M7 11h7M17 18v4l-3-2-3 2v-4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <h3>Free Resources &amp; Templates</h3>
              <p>Downloadable marketing templates, checklists, SOPs, and guides created by Ekwa Marketing’s team — available exclusively to community members.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#E8C44A" strokeWidth="1.8" /><path d="M12 8v4.5l3 1.5" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Early Podcast Access</h3>
              <p>Members get early access to new Dominate Law Podcast episodes, transcripts, and bonus content not available to the general public.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Ekwa Expert Office Hours</h3>
              <p>Monthly live sessions where Ekwa Marketing specialists answer your marketing questions in real time. Get expert advice without the agency retainer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO JOINS */}
      <section className="who-sec">
        <div className="container">
          <div className="who-grid">
            <div className="who-img">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" alt="Attorney community meeting" loading="lazy" />
            </div>
            <div>
              <span className="sec-lbl">Who’s in the Community</span>
              <h2 className="sec-h2">Attorneys Who Are<br />Building, Not Just Practicing</h2>
              <p className="sec-sub">Our community isn’t for everyone. It’s for attorneys who see their firm as a business and want to build something that lasts.</p>
              <div className="who-list">
                <div className="who-item"><div className="who-icon"><svg viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 9.5 4.9 11.5l.6-3.5L3 5.5l3.5-.5z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round" /></svg></div><div><strong>Solo Practitioners &amp; Small Firms</strong><p>Attorneys building from the ground up who need proven strategies, not guesswork.</p></div></div>
                <div className="who-item"><div className="who-icon"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="var(--gold)" strokeWidth="1.4" /><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" /></svg></div><div><strong>Managing Partners &amp; Firm Leaders</strong><p>Leaders who want to delegate, systematize, and scale without sacrificing quality.</p></div></div>
                <div className="who-item"><div className="who-icon"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="var(--gold)" strokeWidth="1.4" /><path d="M5 6h6M5 9h4" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" /></svg></div><div><strong>Growth-Minded Associates</strong><p>Ambitious attorneys building their book of business and preparing for partnership.</p></div></div>
                <div className="who-item"><div className="who-icon"><svg viewBox="0 0 16 16" fill="none"><path d="M3 13L8 3l5 10" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 9h5" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" /></svg></div><div><strong>Legal Entrepreneurs &amp; Innovators</strong><p>Attorneys branching into legal tech, consulting, or building new legal service models.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER MESSAGE */}
      <section className="founder-sec">
        <div className="container">
          <div className="founder-grid">
            <div>
              <img src="/images/naren.jpg" alt="Naren Arulrajah — Founder, Dominate Law" loading="lazy" className="founder-img" />
              <div className="founder-name">Naren Arulrajah</div>
              <div className="founder-title">Founder &amp; Host, Dominate Law<br />CEO, Ekwa Marketing</div>
              <div className="founder-social">
                <a href="https://www.linkedin.com/company/dominatelaw/" target="_blank" rel="noopener" title="LinkedIn">in</a>
                <a href="https://www.instagram.com/dominatelawpodcast/" target="_blank" rel="noopener" title="Instagram">IG</a>
                <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" title="YouTube">YT</a>
                <a href="https://www.facebook.com/DominateLawPodcast" target="_blank" rel="noopener" title="Facebook">f</a>
              </div>
            </div>
            <div>
              <span className="sec-lbl" style={{ color: 'rgba(255,255,255,.4)' }}>A Message from Naren</span>
              <p className="founder-quote">“The attorneys who will win the next decade aren’t just the best lawyers — they’re the best business owners. This community is where we help you become both.”</p>
              <p className="founder-body">I started Dominate Law because I saw too many brilliant attorneys struggling not because of their legal skills, but because no one taught them how to run and grow a law firm as a business. Through Ekwa Marketing, we’ve helped law firms transform their marketing. The Dominate Law Community is where we share those insights directly — for free — with attorneys who are serious about growth.</p>
              <div style={{ marginTop: 24 }}>
                <a href="#join" className="btn btn-gold">Join the Community →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL LINKS */}
      <section className="social-sec">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="sec-lbl" style={{ textAlign: 'center' }}>Stay Connected</span>
            <h2 className="sec-h2" style={{ textAlign: 'center', fontSize: 'clamp(1.5rem,2.5vw,2rem)' }}>Follow Dominate Law Everywhere</h2>
          </div>
          <div className="social-row">
            <a href="https://www.linkedin.com/company/dominatelaw/" target="_blank" rel="noopener" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
              LinkedIn — @dominatelaw
            </a>
            <a href="https://www.instagram.com/dominatelawpodcast/" target="_blank" rel="noopener" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
              Instagram — @dominatelawpodcast
            </a>
            <a href="https://www.facebook.com/DominateLawPodcast" target="_blank" rel="noopener" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              Facebook — DominateLawPodcast
            </a>
            <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" className="social-link">
              <svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.46A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.46a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8z" /></svg>
              YouTube — Dominate Law Podcast
            </a>
            <a href="mailto:info@dominatelaw.com" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              info@dominatelaw.com
            </a>
          </div>
        </div>
      </section>

      {/* JOIN FORM */}
      <section className="join-sec" id="join">
        <div className="container">
          <div className="join-grid">
            <div>
              <span className="sec-lbl">Free Membership</span>
              <h2 className="sec-h2">Join Attorneys<br />Growing Their Practices</h2>
              <p className="sec-sub">Membership is completely free. Get instant access to the community forums, resources, and upcoming events.</p>
              <div className="join-perks">
                <div className="join-perk"><div className="join-perk-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div><strong>Community Forum Access</strong><p>Post questions, share strategies, and connect with attorneys across all practice areas.</p></div></div>
                <div className="join-perk"><div className="join-perk-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div><strong>Free Resources &amp; Downloads</strong><p>All templates, guides, and checklists — free for community members forever.</p></div></div>
                <div className="join-perk"><div className="join-perk-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div><strong>Event &amp; Webinar Invites</strong><p>Priority invitations to all Dominate Law events, webinars, and live sessions.</p></div></div>
                <div className="join-perk"><div className="join-perk-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div><strong>Weekly Digest</strong><p>Curated legal marketing and growth insights delivered to your inbox every week.</p></div></div>
              </div>
            </div>
            <div>
              <div className="join-card">
                <div className="join-card-tag">🎉 Free to Join</div>
                <h2>Create Your Free Account</h2>
                <p>Instant access. No credit card required. Cancel anytime — though you won’t want to.</p>
                <JoinForm source="Main Form" />
                <p className="join-note">🔒 No spam. No selling your data. Just great content for attorneys.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
