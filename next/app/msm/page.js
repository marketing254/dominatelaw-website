import Link from 'next/link';

export const metadata = {
  title: 'Law Firm Marketing Consultation | Get Your Growth Roadmap',
  description:
    'Book your Law Firm Marketing Strategy Meeting. Get a personalized audit, competitor analysis, and a custom growth roadmap for your practice. No obligation.',
  alternates: { canonical: '/msm' },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Law Firm Marketing Consultation',
  url: 'https://www.dominatelaw.com/msm',
  description:
    '30-minute marketing strategy meeting including a personalized audit and custom growth roadmap.',
  provider: { '@id': 'https://www.dominatelaw.com/#organization' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: '30-minute strategy meeting',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dominatelaw.com' },
      { '@type': 'ListItem', position: 2, name: 'Strategy Meeting', item: 'https://www.dominatelaw.com/msm' },
    ],
  },
};

const msmStyles = `
.msm-hero{background:linear-gradient(135deg,var(--brown3) 0%,var(--brown) 55%,var(--brown2) 100%);position:relative;overflow:hidden;padding:80px 0 0}
.msm-hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
.msm-hero-grid{display:grid;grid-template-columns:1fr 460px;gap:60px;align-items:start;position:relative;z-index:2;padding-bottom:80px}
.msm-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:18px}
.msm-eyebrow-line{width:28px;height:2px;background:var(--gold3)}
.msm-hero h1{font-size:clamp(2rem,3.8vw,3rem);font-weight:900;color:#fff;line-height:1.12;margin-bottom:18px}
.msm-hero h1 em{color:var(--gold3);font-style:italic}
.msm-hero-sub{font-size:1.05rem;color:rgba(255,255,255,.65);line-height:1.8;margin-bottom:32px;max-width:520px}
.msm-trust{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:36px}
.msm-trust-badge{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:100px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);font-size:.78rem;color:rgba(255,255,255,.8);font-weight:600}
.msm-trust-badge svg{width:14px;height:14px}
.msm-bullets{display:flex;flex-direction:column;gap:12px}
.msm-bullet{display:flex;gap:14px;align-items:flex-start}
.msm-bullet-icon{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.msm-bullet-icon svg{width:16px;height:16px}
.msm-bullet strong{display:block;font-size:.88rem;font-weight:700;color:#fff;margin-bottom:3px}
.msm-bullet p{font-size:.8rem;color:rgba(255,255,255,.6);line-height:1.55}
.msm-form-card{background:#fff;border-radius:20px;padding:36px 32px;box-shadow:0 40px 80px rgba(0,0,0,.25);position:sticky;top:90px}
.msm-form-tag{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:100px;background:rgba(196,154,10,.12);border:1px solid rgba(196,154,10,.3);font-size:.7rem;font-weight:700;color:var(--gold2);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.msm-form-tag span{width:6px;height:6px;border-radius:50%;background:var(--gold);display:inline-block;animation:msm-pulse 2s ease-in-out infinite}
@keyframes msm-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
.msm-form-card h2{font-size:1.3rem;font-weight:900;color:var(--brown3);margin-bottom:6px;line-height:1.2}
.msm-form-card>p{font-size:.82rem;color:var(--muted);margin-bottom:22px;line-height:1.6}
.msm-form-note{font-size:.7rem;color:var(--muted);text-align:center;margin-top:8px;line-height:1.55}
.wave-divider{display:block;width:100%;margin-bottom:-2px}
.hiw-sec{padding:90px 0;background:var(--cream)}
.sec-label{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:14px}
.sec-h2{font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:var(--brown);line-height:1.2;margin-bottom:14px}
.sec-sub{font-size:1rem;color:var(--muted);line-height:1.8;max-width:520px}
.hiw-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px}
.hiw-step{background:#fff;border-radius:16px;padding:32px 28px;border:1px solid var(--border);position:relative}
.hiw-step-num{position:absolute;top:-18px;left:28px;width:36px;height:36px;border-radius:50%;background:var(--brown);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif),Georgia,serif;font-weight:900;font-size:.9rem;color:var(--gold3);box-shadow:0 4px 14px rgba(96,39,15,.3)}
.hiw-step h3{font-size:1.05rem;font-weight:700;color:var(--brown3);margin-bottom:10px;margin-top:8px}
.hiw-step p{font-size:.85rem;color:var(--muted);line-height:1.7}
.hiw-connector{display:flex;align-items:center;gap:8px;color:var(--gold);font-size:.8rem;font-weight:600;margin-top:16px}
.hiw-connector svg{width:16px;height:16px}
.learn-sec{padding:90px 0}
.learn-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.learn-img{border-radius:20px;overflow:hidden;position:relative;aspect-ratio:4/3}
.learn-img img{width:100%;height:100%;object-fit:cover}
.learn-img-badge{position:absolute;bottom:20px;left:20px;background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;align-items:center;gap:12px}
.learn-img-badge-icon{width:40px;height:40px;border-radius:8px;background:var(--brown);display:flex;align-items:center;justify-content:center}
.learn-img-badge-icon svg{width:20px;height:20px}
.learn-img-badge strong{display:block;font-size:.88rem;color:var(--brown)}
.learn-img-badge span{font-size:.72rem;color:var(--muted)}
.learn-list{display:flex;flex-direction:column;gap:16px;margin-top:28px}
.learn-item{display:flex;gap:14px;align-items:flex-start}
.learn-item-check{width:22px;height:22px;border-radius:50%;background:rgba(196,154,10,.12);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.learn-item-check svg{width:10px;height:10px}
.learn-item strong{font-size:.9rem;font-weight:700;color:var(--warm);display:block;margin-bottom:3px}
.learn-item p{font-size:.82rem;color:var(--muted);line-height:1.6}
.proof-sec{padding:80px 0;background:var(--brown3)}
.proof-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:60px}
.proof-stat{text-align:center;padding:32px 20px}
.proof-stat-num{font-family:var(--font-serif),Georgia,serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:var(--gold3)}
.proof-stat-label{font-size:.8rem;color:rgba(255,255,255,.55);margin-top:6px;line-height:1.4}
.proof-quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pq{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px}
.pq-stars{color:var(--gold3);font-size:.9rem;margin-bottom:12px}
.pq-text{font-size:.85rem;color:rgba(255,255,255,.7);line-height:1.75;margin-bottom:16px;font-style:italic}
.pq-author{display:flex;align-items:center;gap:10px}
.pq-avatar{width:36px;height:36px;border-radius:50%;background:var(--brown2);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif),Georgia,serif;font-weight:900;font-size:.8rem;color:var(--gold3);flex-shrink:0}
.pq-name{font-size:.8rem;font-weight:700;color:#fff}
.pq-title{font-size:.7rem;color:rgba(255,255,255,.4)}
.ekwa-sec{padding:90px 0}
.ekwa-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ekwa-img{border-radius:20px;overflow:hidden;aspect-ratio:4/3}
.ekwa-img img{width:100%;height:100%;object-fit:cover}
.ekwa-logo-row{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.ekwa-pill{padding:5px 14px;background:var(--cream);border-radius:100px;font-size:.72rem;font-weight:700;color:var(--brown);border:1px solid var(--border)}
.ekwa-list{display:flex;flex-direction:column;gap:10px;margin:20px 0}
.ekwa-list li{display:flex;align-items:center;gap:10px;font-size:.88rem;color:var(--warm)}
.ekwa-list li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0}
.msm-cta-band{background:linear-gradient(135deg,var(--brown3),var(--brown));padding:80px 0;text-align:center;position:relative;overflow:hidden}
.msm-cta-band::before{content:'EKWA';position:absolute;right:-30px;bottom:-30px;font-family:var(--font-serif),Georgia,serif;font-size:clamp(80px,14vw,160px);font-weight:900;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.05);pointer-events:none}
.msm-cta-band h2{font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:900;color:#fff;margin-bottom:14px}
.msm-cta-band h2 em{color:var(--gold3);font-style:italic}
.msm-cta-band p{font-size:1rem;color:rgba(255,255,255,.65);max-width:500px;margin:0 auto 36px;line-height:1.8}
.msm-cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
@media(max-width:1024px){
  .msm-hero-grid{grid-template-columns:1fr;gap:40px}
  .msm-form-card{position:static}
  .hiw-steps{grid-template-columns:1fr;gap:28px}
  .learn-grid{grid-template-columns:1fr}
  .ekwa-grid{grid-template-columns:1fr}
  .proof-stats{grid-template-columns:1fr 1fr;gap:1px}
  .proof-quotes{grid-template-columns:1fr}
}
@media(max-width:768px){
  .msm-hero{padding:60px 0 0}
  .proof-stats{grid-template-columns:1fr 1fr}
  .msm-cta-btns{flex-direction:column;align-items:center}
  .msm-cta-btns .btn{width:100%;max-width:340px;justify-content:center}
}
`;

const CheckSvg = () => (
  <svg viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowSvg = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MsmPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <style dangerouslySetInnerHTML={{ __html: msmStyles }} />

      {/* Hero */}
      <section className="msm-hero" id="book">
        <div className="wrap">
          <div className="msm-hero-grid">
            {/* Left copy */}
            <div>
              <div className="msm-eyebrow">
                <span className="msm-eyebrow-line" />
                Powered by Ekwa Marketing
              </div>
              <h1>
                Your Law Firm<br />Marketing <em>Strategy Meeting</em>
              </h1>
              <p className="msm-hero-sub">
                A focused, 30-minute one-on-one session with a senior Ekwa Marketing specialist — tailored
                specifically to your firm, your market, and your goals. No fluff. No pressure. Just a clear
                plan.
              </p>

              <div className="msm-trust">
                <div className="msm-trust-badge">
                  <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8C44A" strokeWidth="1.5" /><path d="M5 8l2 2 4-4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Law Firms Helped
                </div>
                <div className="msm-trust-badge">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 9.5l-3.1 2 .6-3.5L3 5.5l3.5-.5z" stroke="#E8C44A" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                  4.9★ Average Rating
                </div>
                <div className="msm-trust-badge">
                  <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8C44A" strokeWidth="1.5" /><path d="M8 5v3.5l2 1.5" stroke="#E8C44A" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  30-Minute Session
                </div>
                <div className="msm-trust-badge">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2v12" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  Zero Obligation
                </div>
              </div>

              <div className="msm-bullets">
                <div className="msm-bullet">
                  <div className="msm-bullet-icon">
                    <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8C44A" strokeWidth="1.5" /><path d="M5 8l2 2 4-4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <strong>Full Digital Presence Audit</strong>
                    <p>
                      We review your website, local SEO, Google Business Profile, reviews, and social media
                      presence — and tell you exactly what&apos;s working and what isn&apos;t.
                    </p>
                  </div>
                </div>
                <div className="msm-bullet">
                  <div className="msm-bullet-icon">
                    <svg viewBox="0 0 16 16" fill="none"><path d="M3 13L8 3l5 10" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 9h5" stroke="#E8C44A" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  </div>
                  <div>
                    <strong>Competitive Analysis</strong>
                    <p>
                      We analyze your top local competitors — what keywords they rank for, how they convert, and
                      where you have the opportunity to outrank them.
                    </p>
                  </div>
                </div>
                <div className="msm-bullet">
                  <div className="msm-bullet-icon">
                    <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#E8C44A" strokeWidth="1.5" /><path d="M5 8.5l2 2 4-4" stroke="#E8C44A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <strong>Customized Growth Roadmap</strong>
                    <p>
                      You leave with a prioritized, actionable marketing plan specific to your practice area,
                      geography, and growth stage — not a generic template.
                    </p>
                  </div>
                </div>
                <div className="msm-bullet">
                  <div className="msm-bullet-icon">
                    <svg viewBox="0 0 16 16" fill="none"><path d="M8 2C5.24 2 3 4.24 3 7c0 3.25 5 9 5 9s5-5.75 5-9c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" stroke="#E8C44A" strokeWidth="1.4" /></svg>
                  </div>
                  <div>
                    <strong>No Sales Pitch. No Pressure.</strong>
                    <p>
                      This is a genuine strategy session. If we&apos;re a good fit, great — but there&apos;s no
                      obligation to work with us and no hard sell. Just honest, expert advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: booking card */}
            <div>
              <div className="msm-form-card">
                <div className="msm-form-tag"><span /> Limited Spots Available</div>
                <h2>Book Your Strategy Meeting</h2>
                <p>
                  Select your preferred date and time below. YouCanBook.me will collect your details and confirm
                  your spot instantly.
                </p>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', margin: '16px 0 8px' }}>
                  <iframe
                    src="https://dominatelaw-growmypractice.youcanbook.me/?embed=true"
                    style={{ width: '100%', minHeight: 520, border: 'none', display: 'block' }}
                    allow="payment"
                    title="Book your strategy meeting"
                  />
                </div>

                <p className="msm-form-note">
                  🔒 Your information is secure. We never sell data or spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="wave-divider" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0 60 Q360 0 720 30 Q1080 60 1440 20 L1440 60 Z" fill="#fff" />
        </svg>
      </section>

      {/* How it works */}
      <section className="hiw-sec">
        <div className="wrap">
          <div>
            <span className="sec-label">Simple 3-Step Process</span>
            <h2 className="sec-h2">From Request to Roadmap<br />in 48 Hours</h2>
            <p className="sec-sub">
              We make it easy. Book in under 2 minutes, then let us do the research. You show up ready to grow.
            </p>
          </div>
          <div className="hiw-steps">
            <div className="hiw-step">
              <div className="hiw-step-num">1</div>
              <h3>Submit Your Request</h3>
              <p>
                Fill out the short form above with your firm details, location, and biggest marketing challenge.
                Takes less than 2 minutes.
              </p>
              <div className="hiw-connector"><ArrowSvg /> Takes ~2 minutes</div>
            </div>
            <div className="hiw-step">
              <div className="hiw-step-num">2</div>
              <h3>We Do the Homework</h3>
              <p>
                Our team researches your website, Google rankings, reviews, social presence, and top competitors
                in your market — before we even meet.
              </p>
              <div className="hiw-connector"><ArrowSvg /> We do the research</div>
            </div>
            <div className="hiw-step">
              <div className="hiw-step-num">3</div>
              <h3>Your Strategy Session</h3>
              <p>
                A 30-minute video call with a senior Ekwa specialist. You&apos;ll leave with a clear, actionable
                marketing roadmap customized for your firm.
              </p>
              <div className="hiw-connector">
                <svg viewBox="0 0 16 16" fill="none"><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                30-min video call
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="learn-sec">
        <div className="wrap">
          <div className="learn-grid">
            <div className="learn-img">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
                alt="Law firm marketing strategy session"
                loading="lazy"
              />
              <div className="learn-img-badge">
                <div className="learn-img-badge-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.8 5.3.77-3.85 3.75.9 5.3L12 14.1l-4.75 2.52.9-5.3L4.3 7.57l5.3-.77z" stroke="#E8C44A" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <strong>Personalized to Your Firm</strong>
                  <span>Not a generic template</span>
                </div>
              </div>
            </div>
            <div>
              <span className="sec-label">What&apos;s Covered</span>
              <h2 className="sec-h2">What You&apos;ll Learn in Your Session</h2>
              <div className="learn-list">
                <div className="learn-item">
                  <div className="learn-item-check"><CheckSvg /></div>
                  <div>
                    <strong>Where You&apos;re Losing Clients Online</strong>
                    <p>We show you the specific gaps in your digital presence that are costing you cases right now.</p>
                  </div>
                </div>
                <div className="learn-item">
                  <div className="learn-item-check"><CheckSvg /></div>
                  <div>
                    <strong>Your Exact Keyword Opportunities</strong>
                    <p>
                      The specific searches your ideal clients are making that you&apos;re not currently ranking
                      for — and how to capture them.
                    </p>
                  </div>
                </div>
                <div className="learn-item">
                  <div className="learn-item-check"><CheckSvg /></div>
                  <div>
                    <strong>How Your Competitors Are Winning</strong>
                    <p>A real breakdown of what the top-ranked firms in your market are doing — and how to beat them.</p>
                  </div>
                </div>
                <div className="learn-item">
                  <div className="learn-item-check"><CheckSvg /></div>
                  <div>
                    <strong>Your 90-Day Quick-Win Plan</strong>
                    <p>
                      Three to five specific actions you can take in the next 90 days to start generating more
                      qualified leads.
                    </p>
                  </div>
                </div>
                <div className="learn-item">
                  <div className="learn-item-check"><CheckSvg /></div>
                  <div>
                    <strong>Long-Term Growth Strategy</strong>
                    <p>A 12-month marketing roadmap that builds sustainable lead flow and firm authority in your market.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="proof-sec">
        <div className="wrap">
          <div className="proof-stats">
            <div className="proof-stat">
              <div className="proof-stat-num">
                Law Firms<span style={{ color: 'var(--gold3)', fontSize: '.6em', verticalAlign: 'super' }}>✓</span>
              </div>
              <div className="proof-stat-label">Helped by Ekwa Marketing</div>
            </div>
            <div className="proof-stat">
              <div className="proof-stat-num">98<span style={{ color: 'var(--gold3)' }}>%</span></div>
              <div className="proof-stat-label">Client Satisfaction Rate</div>
            </div>
            <div className="proof-stat">
              <div className="proof-stat-num">4.9<span style={{ color: 'var(--gold3)' }}>★</span></div>
              <div className="proof-stat-label">Average Review Score</div>
            </div>
            <div className="proof-stat">
              <div className="proof-stat-num">16<span style={{ color: 'var(--gold3)' }}>+</span></div>
              <div className="proof-stat-label">Years of Legal Marketing Experience</div>
            </div>
          </div>
          <div className="proof-quotes">
            <div className="pq">
              <div className="pq-stars">★★★★★</div>
              <p className="pq-text">
                &quot;The strategy session was eye-opening. They showed me exactly which keywords I wasn&apos;t
                ranking for and why. Within 6 months of following their plan, my new client intake doubled.&quot;
              </p>
              <div className="pq-author">
                <div className="pq-avatar">JR</div>
                <div>
                  <div className="pq-name">James R.</div>
                  <div className="pq-title">Personal Injury Attorney, Texas</div>
                </div>
              </div>
            </div>
            <div className="pq">
              <div className="pq-stars">★★★★★</div>
              <p className="pq-text">
                &quot;I was skeptical of &apos;free consultations&apos; but this was different. No sales pitch,
                just real, actionable insight. They knew my competitors better than I did. Signed on the same
                week.&quot;
              </p>
              <div className="pq-author">
                <div className="pq-avatar">LK</div>
                <div>
                  <div className="pq-name">Linda K.</div>
                  <div className="pq-title">Family Law Attorney, Florida</div>
                </div>
              </div>
            </div>
            <div className="pq">
              <div className="pq-stars">★★★★★</div>
              <p className="pq-text">
                &quot;Ekwa&apos;s team understood the legal market. They came prepared, knew our market,
                identified three quick wins we hadn&apos;t considered. The ROI from that meeting was
                instant.&quot;
              </p>
              <div className="pq-author">
                <div className="pq-avatar">MT</div>
                <div>
                  <div className="pq-name">Michael T.</div>
                  <div className="pq-title">Managing Partner, Ohio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Ekwa */}
      <section className="ekwa-sec">
        <div className="wrap">
          <div className="ekwa-grid">
            <div>
              <span className="sec-label">Who We Are</span>
              <h2 className="sec-h2">The Team Behind<br />Dominate Law</h2>
              <div className="ekwa-logo-row">
                <img src="/images/footer-logo.jpg" alt="Dominate Law" style={{ height: 50, width: 'auto' }} loading="lazy" />
                <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Powered by</span>
                <div className="ekwa-pill">Ekwa Marketing</div>
              </div>
              <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16 }}>
                Ekwa Marketing is a specialist digital marketing agency dedicated exclusively to law firms.
                Founded over 16 years ago, we&apos;ve helped law firms across North America build dominant
                online presences, generate consistent lead flow, and grow profitable practices.
              </p>
              <ul className="ekwa-list">
                <li>Exclusively focused on legal industry marketing</li>
                <li>No long-term contracts required</li>
                <li>Dedicated account manager for every firm</li>
                <li>Transparent reporting — you always know what we&apos;re doing</li>
                <li>Proven track record across 40+ practice areas</li>
                <li>Full-service: SEO, PPC, social, web design &amp; content</li>
              </ul>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="https://www.ekwa.com/" target="_blank" rel="noopener" className="btn btn-primary">
                  Learn More About Ekwa
                </a>
                <Link href="/reviews" className="btn btn-secondary">Read Client Reviews</Link>
              </div>
            </div>
            <div className="ekwa-img">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
                alt="Ekwa Marketing team helping law firms"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="msm-cta-band">
        <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
          <h2>Ready to Stop Guessing<br />and Start <em>Growing?</em></h2>
          <p>
            Join law firms that have used their Ekwa strategy session to build a clear, proven path to more
            clients.
          </p>
          <div className="msm-cta-btns">
            <Link href="#book" className="btn btn-gold">Book My Meeting →</Link>
            <Link href="/reviews" className="btn btn-outline-w">Read Success Stories</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
