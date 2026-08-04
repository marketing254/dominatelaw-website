import Link from 'next/link';

// Faithful port of the legacy index.html footer (same columns, links, logo, socials).
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-logo-row" id="f-logo-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/footer-logo.jpg" alt="Dominate Law" width={600} height={327}
                style={{ height: 50, width: 'auto' }} loading="lazy"
              />
              <div className="footer-logo-fb" id="footer-fb">
                <div className="footer-mark">DL</div>
                <div className="footer-brand-t"><strong>Dominate Law</strong><em>by Ekwa Marketing</em></div>
              </div>
            </div>
            <p className="footer-desc">
              The complete resource hub for attorneys and law firm owners. Marketing, management,
              technology, and growth — all in one place. Powered by Ekwa Marketing.
            </p>
            <div className="footer-social">
              <a href="https://www.linkedin.com/company/dominatelaw/" target="_blank" rel="noopener" title="LinkedIn">in</a>
              <a href="https://www.facebook.com/DominateLawPodcast" target="_blank" rel="noopener" title="Facebook">f</a>
              <a href="https://www.instagram.com/dominatelawpodcast/" target="_blank" rel="noopener" title="Instagram">◎</a>
              <a href="https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q" target="_blank" rel="noopener" title="YouTube">YT</a>
              <a href="mailto:info@dominatelaw.com" title="Email Us">✉</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Resource Hub</h4>
            <ul>
              <li><Link href="/msm">Marketing &amp; SEO</Link></li>
              <li><a href="/blog/law-firm-practice-management-guide">Practice Management</a></li>
              <li><a href="/blog/legal-technology-guide-2026">Legal Technology</a></li>
              <li><a href="/blog/law-firm-practice-management-guide">Business Growth</a></li>
              <li><a href="/blog/law-firm-client-experience-guide">Client Experience</a></li>
              <li><Link href="/resources">Ethics &amp; Compliance</Link></li>
              <li><a href="/blog/law-firm-practice-management-guide">Finance &amp; Billing</a></li>
              <li><Link href="/resources">Attorney Wellness</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Content</h4>
            <ul>
              <li><Link href="/tools">⚖ Legal Tools (Free)</Link></li>
              <li><Link href="/podcast">Podcast Show</Link></li>
              <li><Link href="/resources">Free Downloads</Link></li>
              <li><Link href="/webinar-replays">Webinar Replays</Link></li>
              <li><a href="/blog">Blog &amp; Insights</a></li>
              <li><Link href="/events">Events &amp; Webinars</Link></li>
              <li><Link href="/reviews">Success Stories</Link></li>
              <li><Link href="/about">About Ekwa</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Practice Areas</h4>
            <ul>
              <li><a href="#">Personal Injury</a></li>
              <li><a href="#">Family Law</a></li>
              <li><a href="#">Criminal Defense</a></li>
              <li><a href="#">Immigration</a></li>
              <li><a href="#">Estate Planning</a></li>
              <li><a href="#">Business Law</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Dominate Law by Ekwa Marketing. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <a href="#">Terms of Use</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
