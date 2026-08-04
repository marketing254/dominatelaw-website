import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Dominate Law privacy policy — how we collect, use, and protect your personal information. Learn about cookies, data storage, and your rights.',
  alternates: { canonical: '/privacy-policy' },
};

const ppStyles = `
.pp-body{max-width:800px;margin:0 auto;padding:64px 40px 80px}
@media(max-width:640px){.pp-body{padding:48px 20px 64px}}
.pp-updated{display:inline-block;font-size:.74rem;font-weight:600;color:var(--muted);background:var(--cream2);border:1px solid var(--border);border-radius:100px;padding:4px 14px;margin-bottom:36px}
.pp-toc{background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:24px 28px;margin-bottom:48px}
.pp-toc h2{font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--brown);margin-bottom:14px;font-family:inherit}
.pp-toc ol{padding-left:18px;display:flex;flex-direction:column;gap:7px;list-style:decimal}
.pp-toc ol li{font-size:.85rem;color:var(--muted)}
.pp-toc ol li a{color:var(--brown);font-weight:500;transition:color .15s}
.pp-toc ol li a:hover{color:var(--gold2)}
.pp-section{margin-bottom:52px}
.pp-section h2{font-size:1.2rem;font-weight:900;color:var(--brown3);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--cream2)}
.pp-section h3{font-size:.92rem;font-weight:700;color:var(--warm);margin:20px 0 8px;font-family:inherit}
.pp-section p{font-size:.9rem;color:var(--muted);line-height:1.85;margin-bottom:12px}
.pp-section ul{padding-left:20px;display:flex;flex-direction:column;gap:7px;margin-bottom:12px}
.pp-section ul li{font-size:.9rem;color:var(--muted);line-height:1.75;list-style:disc}
.pp-section a{color:var(--brown);text-decoration:underline;text-decoration-color:rgba(96,39,15,.3);transition:color .15s}
.pp-section a:hover{color:var(--gold2)}
.pp-callout{background:var(--cream);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;padding:18px 22px;margin:0 0 48px;font-size:.88rem;color:var(--warm);line-height:1.75}
.pp-callout strong{color:var(--brown)}
`;

export default function PrivacyPolicyPage() {
  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: ppStyles }} />

      {/* Hero */}
      <section className="page-hero">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › <span>Privacy Policy</span>
          </nav>
          <span className="label">Legal</span>
          <h1>Privacy Policy</h1>
          <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.6)', maxWidth: 620, lineHeight: 1.75 }}>
            How we collect, use, and protect your personal information when you use Dominate Law.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="pp-body">
        <span className="pp-updated">Last updated: April 6, 2026</span>

        <div className="pp-toc">
          <h2>Contents</h2>
          <ol>
            <li><a href="#who-we-are">Who We Are</a></li>
            <li><a href="#information-we-collect">Information We Collect</a></li>
            <li><a href="#how-we-use">How We Use Your Information</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#data-sharing">Data Sharing</a></li>
            <li><a href="#data-retention">Data Retention</a></li>
            <li><a href="#your-rights">Your Rights</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#third-party-links">Third-Party Links</a></li>
            <li><a href="#children">Children&apos;s Privacy</a></li>
            <li><a href="#changes">Changes to This Policy</a></li>
            <li><a href="#contact-us">Contact Us</a></li>
          </ol>
        </div>

        <div className="pp-callout">
          <strong>The short version:</strong> We only collect information you choose to share with us, such as
          when you fill out a form or register for an event. We do not sell your data. We keep things simple,
          secure, and transparent.
        </div>

        <div className="pp-section" id="who-we-are">
          <h2>1. Who We Are</h2>
          <p>
            Dominate Law is operated by <strong>Ekwa Marketing</strong>, a digital marketing agency focused on
            helping law firms grow. This Privacy Policy applies to the website at{' '}
            <a href="https://www.dominatelaw.com">dominatelaw.com</a> and all its pages and services.
          </p>
          <p>
            If you have any privacy-related questions, you are welcome to reach us at{' '}
            <a href="mailto:info@dominatelaw.com">info@dominatelaw.com</a>.
          </p>
        </div>

        <div className="pp-section" id="information-we-collect">
          <h2>2. Information We Collect</h2>
          <h3>Information you provide directly</h3>
          <p>
            We only collect information you voluntarily submit through our website forms. Depending on which
            form you use, this may include:
          </p>
          <ul>
            <li><strong>Contact form:</strong> your name, email address, phone number, and message.</li>
            <li><strong>Community registration:</strong> professional details such as your name, email, area of practice, and a short bio.</li>
            <li><strong>Event registration:</strong> your name and email when you sign up for a webinar or live session.</li>
            <li><strong>Resource downloads:</strong> your name and email when you request a free guide or template.</li>
            <li><strong>Guest or Speaker applications:</strong> professional background and contact details submitted through the application form.</li>
          </ul>
          <h3>Information collected automatically</h3>
          <p>
            When you browse the site, we collect standard technical information such as pages visited, time
            spent on the site, and general device and browser details. This data is anonymised and used only to
            improve the website experience.
          </p>
        </div>

        <div className="pp-section" id="how-we-use">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information you share with us to:</p>
          <ul>
            <li>Respond to your enquiries and fulfil any requests you have made.</li>
            <li>Send you the resource, download, or event confirmation you signed up for.</li>
            <li>Feature you in the community directory, but only when you have consented through the registration form.</li>
            <li>Send occasional updates about Dominate Law content, events, or resources. You can unsubscribe at any time.</li>
            <li>Improve the site experience based on how visitors use it.</li>
            <li>Meet any applicable legal obligations.</li>
          </ul>
          <p>
            We will not use your information for any purpose beyond what is listed here without your prior
            consent.
          </p>
        </div>

        <div className="pp-section" id="cookies">
          <h2>4. Cookies</h2>
          <p>
            We use a small number of cookies to keep the site running smoothly and to understand how it is being
            used.
          </p>
          <h3>Essential cookies</h3>
          <p>These are required for the website to function. They cannot be disabled.</p>
          <h3>Analytics cookies</h3>
          <p>
            We use analytics tools to see which pages are most helpful, how visitors navigate the site, and
            where we can improve. All data is anonymised and no individuals are identified.
          </p>
          <h3>Preference cookies</h3>
          <p>
            We use a small browser cookie to remember choices you have made during your visit, such as whether
            you have already seen a notification, so we do not show it to you again.
          </p>
          <h3>Managing your cookie preferences</h3>
          <p>
            You can adjust or clear cookies through your browser settings at any time. Turning off non-essential
            cookies will not affect your ability to use the site.
          </p>
        </div>

        <div className="pp-section" id="data-sharing">
          <h2>5. Data Sharing</h2>
          <p>We do <strong>not sell, rent, or trade</strong> your personal information. Full stop.</p>
          <p>
            We work with a small number of trusted service providers to operate the website. Where relevant,
            your information may be shared with:
          </p>
          <ul>
            <li><strong>Google Workspace:</strong> form submissions are stored securely in Google Sheets for internal use.</li>
            <li><strong>Zoom:</strong> when you register for a webinar, your registration details are passed to Zoom to facilitate the session.</li>
            <li><strong>Ekwa Marketing team:</strong> our internal team reviews form submissions to follow up on enquiries.</li>
          </ul>
          <p>We may also disclose information if required by law or to protect the rights and safety of our users.</p>
        </div>

        <div className="pp-section" id="data-retention">
          <h2>6. Data Retention</h2>
          <p>We only keep your information for as long as it is needed:</p>
          <ul>
            <li>Contact form submissions are held for up to 2 years.</li>
            <li>Event registrations are kept for 12 months after the event.</li>
            <li>Community directory entries stay active until you ask us to remove them.</li>
          </ul>
          <p>Once information is no longer needed, it is deleted or anonymised.</p>
        </div>

        <div className="pp-section" id="your-rights">
          <h2>7. Your Rights</h2>
          <p>
            Depending on where you are located, you may have rights over the personal data we hold about you,
            including:
          </p>
          <ul>
            <li><strong>Access:</strong> request a copy of the information we hold about you.</li>
            <li><strong>Correction:</strong> ask us to correct any inaccurate information.</li>
            <li><strong>Deletion:</strong> request that we delete your data.</li>
            <li><strong>Objection:</strong> opt out of receiving marketing communications at any time.</li>
            <li><strong>Portability:</strong> request your data in a transferable format.</li>
          </ul>
          <p>
            To make a request, email us at <a href="mailto:info@dominatelaw.com">info@dominatelaw.com</a> with
            &quot;Privacy Request&quot; in the subject line. We will respond within 30 days.
          </p>
        </div>

        <div className="pp-section" id="security">
          <h2>8. Security</h2>
          <p>
            We take the security of your information seriously. The website is served over HTTPS and data stored
            through our services benefits from enterprise-level security protections. Only authorised team
            members have access to submitted information.
          </p>
          <p>
            While we do everything reasonable to keep your data safe, no system is completely immune to risk. If
            you ever have concerns, please contact us directly.
          </p>
        </div>

        <div className="pp-section" id="third-party-links">
          <h2>9. Third-Party Links</h2>
          <p>
            Our website includes links to external platforms such as LinkedIn, Facebook, Spotify, and Zoom. This
            Privacy Policy covers Dominate Law only. We are not responsible for how those platforms handle your
            data, and we encourage you to review their own privacy policies before engaging with them.
          </p>
        </div>

        <div className="pp-section" id="children">
          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Dominate Law is a professional resource for attorneys and law firm owners. We do not knowingly
            collect personal information from anyone under the age of 13. If you believe a child has submitted
            information through our site, please contact us at{' '}
            <a href="mailto:info@dominatelaw.com">info@dominatelaw.com</a> and we will take prompt action.
          </p>
        </div>

        <div className="pp-section" id="changes">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time as our practices evolve or legal requirements
            change. The &quot;Last updated&quot; date at the top of this page will always reflect the most
            recent version. We encourage you to review this page periodically.
          </p>
        </div>

        <div className="pp-section" id="contact-us">
          <h2>12. Contact Us</h2>
          <p>Have a question or want to make a privacy request? We are happy to help.</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@dominatelaw.com">info@dominatelaw.com</a></li>
            <li><strong>Contact form:</strong> <Link href="/contact">dominatelaw.com/contact</Link></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
