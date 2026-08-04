import Link from 'next/link';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact Dominate Law | Law Firm Marketing Experts | Dominate Law',
  description: 'Contact Dominate Law — book a 30-minute marketing strategy meeting, ask about partnerships, or get answers about our legal tools, podcast, and events.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Dominate Law | Law Firm Marketing Experts | Dominate Law',
    description: 'Contact the Dominate Law team — book a 30-minute marketing strategy meeting, ask about partnerships, or get answers about our legal tools, podcast, events, and attorney community.',
    url: 'https://www.dominatelaw.com/contact',
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Dominate Law',
  url: 'https://www.dominatelaw.com/contact',
  description: 'Contact the Dominate Law team for marketing strategy meetings, partnerships, and more.',
  publisher: { '@id': 'https://www.dominatelaw.com/#organization' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dominatelaw.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.dominatelaw.com/contact' },
    ],
  },
};

const css = `
.contact-sec{padding:80px 0 96px}
.contact-grid{display:grid;grid-template-columns:1fr 1.55fr;gap:56px;align-items:start}
.contact-info{display:flex;flex-direction:column}
.ci-block{padding:28px 0;border-bottom:1px solid var(--border)}
.ci-block:first-child{padding-top:0}
.ci-block:last-child{border-bottom:none;padding-bottom:0}
.ci-icon{width:42px;height:42px;border-radius:10px;background:var(--cream2);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.ci-icon svg{width:20px;height:20px}
.ci-label{font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--gold2);margin-bottom:6px;display:block}
.ci-value{font-size:.95rem;font-weight:600;color:var(--warm);line-height:1.55}
.ci-value a{color:var(--brown);transition:color .2s}
.ci-value a:hover{color:var(--gold2)}
.ci-note{font-size:.78rem;color:var(--muted);margin-top:4px;line-height:1.6}
.contact-social{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.cs-btn{display:flex;align-items:center;gap:8px;padding:9px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:.8rem;font-weight:600;color:var(--warm);transition:all .2s;cursor:pointer}
.cs-btn:hover{border-color:var(--brown);background:var(--cream);color:var(--brown);transform:translateY(-2px)}
.cs-ico{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;flex-shrink:0}
.cs-ico.li{background:#0A66C2;color:#fff}
.cs-ico.fb{background:#1877F2;color:#fff}
.cs-ico.ig{background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff}
.cs-ico.yt{background:#FF0000;color:#fff}
.contact-form-card{background:#fff;border:1.5px solid var(--border);border-radius:20px;padding:40px 36px;box-shadow:0 8px 40px rgba(58,13,0,.07);position:relative}
.cfc-tag{display:inline-flex;align-items:center;gap:7px;padding:5px 14px;border-radius:100px;background:rgba(196,154,10,.1);border:1px solid rgba(196,154,10,.28);font-size:.68rem;font-weight:700;color:var(--gold2);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.cfc-tag-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulse 2s ease-in-out infinite}
.cfc-title{font-family:var(--font-serif),Georgia,serif;font-size:1.35rem;font-weight:900;color:var(--brown3);margin-bottom:6px;line-height:1.25}
.cfc-sub{font-size:.83rem;color:var(--muted);line-height:1.65;margin-bottom:28px}
.cf-form{display:flex;flex-direction:column;gap:14px;position:relative}
.cf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cf-field{display:flex;flex-direction:column;gap:5px}
.cf-field label{font-size:.72rem;font-weight:600;color:var(--warm)}
.cf-field input,.cf-field select,.cf-field textarea{padding:12px 15px;border:1.5px solid var(--border);border-radius:8px;font-size:.86rem;color:var(--warm);background:var(--cream);transition:border-color .2s,background .2s}
.cf-field input:focus,.cf-field select:focus,.cf-field textarea:focus{border-color:var(--gold);background:#fff;outline:none}
.cf-field textarea{resize:vertical;min-height:100px;line-height:1.6}
.req{color:#c0392b;font-weight:700}
.cf-subject-pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}
.cf-pill{padding:7px 14px;border:1.5px solid var(--border);border-radius:100px;font-size:.76rem;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s;background:none;user-select:none}
.cf-pill:hover{border-color:var(--brown);color:var(--brown)}
.cf-pill.active{border-color:var(--brown);background:var(--brown);color:#fff}
.cf-submit{width:100%;padding:15px;background:var(--brown);color:#fff;font-size:.95rem;font-weight:700;border-radius:8px;cursor:pointer;transition:background .2s,tran<form .15s,box-shadow .2s;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:4px}
.cf-submit:hover:not(:disabled){background:var(--brown3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(58,13,0,.28)}
.cf-submit:disabled{opacity:.7;cursor:not-allowed;transform:none}
.cf-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:cf-spin .7s linear infinite}
@keyframes cf-spin{to{transform:rotate(360deg)}}
.cf-error{font-size:.72rem;color:#c0392b}
.cf-send-error{background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.25);border-radius:8px;padding:12px 16px;font-size:.8rem;color:#8b2020;line-height:1.55;margin-top:8px}
.cf-note{font-size:.73rem;color:var(--muted);text-align:center;margin-top:8px;line-height:1.6}
.cf-success{text-align:center;padding:32px 20px}
.cf-success svg{margin:0 auto 16px}
.cf-success h3{font-family:var(--font-serif),Georgia,serif;font-size:1.3rem;font-weight:900;color:var(--brown3);margin-bottom:10px}
.cf-success p{font-size:.85rem;color:var(--muted);line-height:1.7;max-width:360px;margin:0 auto}
@media(max-width:900px){
  .contact-grid{grid-template-columns:1fr;gap:40px}
  .contact-info{flex-direction:row;flex-wrap:wrap}
  .ci-block{flex:1 1 220px;padding:20px 24px 20px 0;border-bottom:none;border-right:1px solid var(--border)}
  .ci-block:last-child{border-right:none}
}
@media(max-width:600px){
  .contact-sec{padding:56px 0 72px}
  .contact-form-card{padding:28px 22px}
  .cf-row{grid-template-columns:1fr}
  .contact-info{flex-direction:column}
  .ci-block{border-right:none;border-bottom:1px solid var(--border)}
}
`;

export default function ContactPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ═══ HERO ═══ */}
      <section className="page-hero">
        <div className="container">
          <span className="label">Get In Touch</span>
          <h1>We’d Love to<br /><em style={{ color: 'var(--gold3)', fontStyle: 'italic' }}>Hear From You</em></h1>
          <p style={{ fontSize: '.96rem', color: 'rgba(255,255,255,.6)', maxWidth: 520, lineHeight: 1.75 }}>
            Whether you have a question, want to partner with us, or are ready to grow your law firm — our team is here and happy to help.
          </p>
        </div>
      </section>

      {/* ═══ CONTACT SECTION ═══ */}
      <section className="contact-sec">
        <div className="container">
          <div className="contact-grid">

            {/* Left: contact info */}
            <div className="contact-info">
              <div className="ci-block">
                <div className="ci-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#60270F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </div>
                <span className="ci-label">Email</span>
                <div className="ci-value"><a href="mailto:info@dominatelaw.com">info@dominatelaw.com</a></div>
                <div className="ci-note">We respond within 1 business day.</div>
              </div>

              <div className="ci-block">
                <div className="ci-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#60270F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                </div>
                <span className="ci-label">Strategy Meeting</span>
                <div className="ci-value"><Link href="/msm">Book a 30-min session →</Link></div>
                <div className="ci-note">A personalized growth audit for your law firm, at no cost.</div>
              </div>

              <div className="ci-block">
                <div className="ci-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#60270F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <span className="ci-label">Powered by</span>
                <div className="ci-value"><a href="https://www.ekwa.com" target="_blank" rel="noopener">Ekwa Marketing</a></div>
                <div className="ci-note">18+ years helping law firms across North America grow online.</div>
              </div>

              <div className="ci-block">
                <div className="ci-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#60270F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <span className="ci-label">Follow Us</span>
                <div className="contact-social">
                  <a href="https://www.linkedin.com/company/dominatelaw/" target="_blank" rel="noopener" className="cs-btn"><span className="cs-ico li">in</span> LinkedIn</a>
                  <a href="https://www.facebook.com/DominateLawPodcast" target="_blank" rel="noopener" className="cs-btn"><span className="cs-ico fb">f</span> Facebook</a>
                  <a href="https://www.instagram.com/dominatelawpodcast/" target="_blank" rel="noopener" className="cs-btn"><span className="cs-ico ig">◎</span> Instagram</a>
                  <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" className="cs-btn"><span className="cs-ico yt">YT</span> YouTube</a>
                </div>
              </div>
            </div>

            {/* Right: contact form */}
            <div className="contact-form-card">
              <div className="cfc-tag"><span className="cfc-tag-dot" /> We’re Online</div>
              <h2 className="cfc-title">Send Us a Message</h2>
              <p className="cfc-sub">Fill in the form below and we’ll get back to you within 1 business day.</p>
              <ContactForm />
              <p className="cf-note">🔒 Your information is kept private and never sold or shared.</p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
