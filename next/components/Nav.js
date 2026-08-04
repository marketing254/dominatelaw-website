'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Chevron = () => (
  <svg className="nav-chevron" viewBox="0 0 10 6" fill="none">
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MobChevron = () => (
  <svg viewBox="0 0 10 6" fill="none">
    <path d="M1 1l4 4 4-4" stroke="var(--brown)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);   // 'events' | 'res' | null
  const [mobOpen, setMobOpen] = useState(false);
  const [mobAcc, setMobAcc] = useState(null);        // 'events' | 'res' | null
  const [logoFailed, setLogoFailed] = useState(false);
  const closeTimer = useRef(null);
  const navRef = useRef(null);

  /* Nav shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdowns on outside click / Escape / tab hidden (legacy behavior) */
  useEffect(() => {
    const onDocClick = e => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrop(null);
    };
    const onKey = e => { if (e.key === 'Escape') setOpenDrop(null); };
    const onVis = () => { if (document.visibilityState === 'hidden') setOpenDrop(null); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  /* Lock body scroll while mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobOpen]);

  /* Close dropdowns + mobile menu on route change */
  useEffect(() => { setOpenDrop(null); setMobOpen(false); setMobAcc(null); }, [pathname]);

  const dropEnter = id => { clearTimeout(closeTimer.current); setOpenDrop(id); };
  const dropLeave = () => { closeTimer.current = setTimeout(() => setOpenDrop(null), 200); };
  const dropClick = id => { clearTimeout(closeTimer.current); setOpenDrop(cur => (cur === id ? cur : id)); };

  const toggleAcc = id => setMobAcc(cur => (cur === id ? null : id));
  const closeMob = () => { setMobOpen(false); setMobAcc(null); };
  const isActive = href => pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
  const cls = href => (isActive(href) ? 'active' : undefined);

  return (
    <>
      {/* ═══ NAV ══════════════════════════════════════════════════ */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav" ref={navRef}>
        <div className="wrap">
          <div className="nav-inner">
            {/* Logo */}
            <Link href="/" className="nav-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png" alt="Dominate Law" width={360} height={196}
                style={logoFailed ? { display: 'none' } : undefined}
                onError={() => setLogoFailed(true)}
              />
              <div className={`nav-logo-fb${logoFailed ? ' show' : ''}`} id="nav-fb">
                <div className="nav-mark">DL</div>
                <div className="nav-brand"><strong>Dominate Law</strong><em>by Ekwa</em></div>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="nav-links" id="navLinks">

              <div className="nav-item"><Link href="/about" className={cls('/about')}>About Us</Link></div>

              {/* Events dropdown */}
              <div
                className={`nav-item${openDrop === 'events' ? ' open' : ''}`} id="ni-events"
                onMouseEnter={() => dropEnter('events')} onMouseLeave={dropLeave}
              >
                <button
                  type="button" className="nav-drop-trigger" aria-haspopup="true"
                  aria-expanded={openDrop === 'events'} onClick={() => dropClick('events')}
                >
                  Events <Chevron />
                </button>
                <div className="nav-drop">
                  <Link href="/events">
                    <div className="nav-drop-icon">
                      <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="var(--brown)" strokeWidth="1.4" /><path d="M5 2v2M11 2v2M2 7h12" stroke="var(--brown)" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    </div>
                    <div className="nav-drop-text"><strong>Webinars &amp; Events</strong><span>Live &amp; on-demand sessions</span></div>
                  </Link>
                  <Link href="/webinar-replays">
                    <div className="nav-drop-icon">
                      <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="var(--brown)" strokeWidth="1.4" /><path d="M6.8 6.2l3 1.8-3 1.8V6.2z" fill="var(--brown)" /></svg>
                    </div>
                    <div className="nav-drop-text"><strong>Webinar Replays</strong><span>Watch past sessions on-demand</span></div>
                  </Link>
                </div>
              </div>

              <div className="nav-item"><Link href="/podcast" className={cls('/podcast')}>Podcast</Link></div>

              <div className="nav-item"><Link href="/reviews" className={cls('/reviews')}>Reviews</Link></div>

              {/* Resources dropdown */}
              <div
                className={`nav-item${openDrop === 'res' ? ' open' : ''}`} id="ni-res"
                onMouseEnter={() => dropEnter('res')} onMouseLeave={dropLeave}
              >
                <button
                  type="button" className="nav-drop-trigger" aria-haspopup="true"
                  aria-expanded={openDrop === 'res'} onClick={() => dropClick('res')}
                >
                  Resources <Chevron />
                </button>
                <div className="nav-drop">
                  <a href="/blog">
                    <div className="nav-drop-icon">
                      <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="var(--brown)" strokeWidth="1.4" /><path d="M5 6h6M5 9h4" stroke="var(--brown)" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    </div>
                    <div className="nav-drop-text"><strong>Blog &amp; Insights</strong><span>Articles, guides, tips</span></div>
                  </a>
                  <Link href="/resources">
                    <div className="nav-drop-icon">
                      <svg viewBox="0 0 16 16" fill="none"><path d="M4 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="var(--brown)" strokeWidth="1.4" /><path d="M5 6h6M5 9h3M10 13v-3l2 1.5-2 1.5z" stroke="var(--brown)" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    </div>
                    <div className="nav-drop-text"><strong>Free Downloads</strong><span>Templates &amp; guides</span></div>
                  </Link>
                  <Link href="/tools">
                    <div className="nav-drop-icon">
                      <svg viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="var(--brown)" strokeWidth="1.4" /><path d="M5 6h6M5 9h3" stroke="var(--brown)" strokeWidth="1.3" strokeLinecap="round" /><path d="M10 11l1.5-1.5L10 8" stroke="var(--brown)" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    </div>
                    <div className="nav-drop-text"><strong>Legal Tools</strong><span>Free calculators for attorneys</span></div>
                  </Link>
                </div>
              </div>

              <div className="nav-item"><Link href="/guest-speaker" className={cls('/guest-speaker')}>Guest / Speaker</Link></div>

              <div className="nav-item"><Link href="/community" className={cls('/community')}>Community</Link></div>

              <div className="nav-item"><Link href="/msm" className={cls('/msm')}>Marketing Consultation</Link></div>

            </div>{/* /nav-links */}

            <Link href="/contact" className="btn btn-primary nav-cta-btn">Contact Us</Link>
            <button
              className={`burger${mobOpen ? ' open' : ''}`} id="burger" aria-label="Open menu"
              onClick={() => setMobOpen(o => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE MENU ═══════════════════════════════════════════ */}
      <div className={`mob-overlay${mobOpen ? ' open' : ''}`} id="mob-overlay" onClick={closeMob} />
      <div className={`mob-menu${mobOpen ? ' open' : ''}`} id="mob-menu" aria-label="Mobile navigation">
        <div className="mob-header">
          <div className="nav-mark">DL</div>
          <button className="mob-close" id="mob-close" aria-label="Close menu" onClick={closeMob}>✕</button>
        </div>
        <div className="mob-body">
          <Link href="/" className={`mob-link${pathname === '/' ? ' active' : ''}`} onClick={closeMob}>Home</Link>

          <Link href="/about" className="mob-link" onClick={closeMob}>About Us</Link>

          {/* Events accordion */}
          <button
            className={`mob-acc-trigger${mobAcc === 'events' ? ' open' : ''}`} id="mob-events-trig"
            onClick={() => toggleAcc('events')}
          >
            Events
            <MobChevron />
          </button>
          <div className={`mob-acc-panel${mobAcc === 'events' ? ' open' : ''}`} id="mob-events-panel">
            <Link href="/events" onClick={closeMob}>Webinars &amp; Events</Link>
            <Link href="/webinar-replays" onClick={closeMob}>Webinar Replays</Link>
          </div>

          <Link href="/podcast" className="mob-link" onClick={closeMob}>Podcast</Link>
          <Link href="/reviews" className="mob-link" onClick={closeMob}>Reviews</Link>

          {/* Resources accordion */}
          <button
            className={`mob-acc-trigger${mobAcc === 'res' ? ' open' : ''}`} id="mob-res-trig"
            onClick={() => toggleAcc('res')}
          >
            Resources
            <MobChevron />
          </button>
          <div className={`mob-acc-panel${mobAcc === 'res' ? ' open' : ''}`} id="mob-res-panel">
            <a href="/blog" onClick={closeMob}>Blog &amp; Insights</a>
            <Link href="/resources" onClick={closeMob}>Free Downloads</Link>
            <Link href="/tools" onClick={closeMob}>⚖ Legal Tools</Link>
          </div>

          <Link href="/guest-speaker" className="mob-link" onClick={closeMob}>Guest / Speaker</Link>
          <Link href="/community" className="mob-link" onClick={closeMob}>Community</Link>

          <Link href="/msm" className="mob-link" onClick={closeMob}>Marketing Consultation</Link>

          <div className="mob-sep" />
          <div className="mob-cta-wrap">
            <Link href="/contact" className="btn btn-primary" onClick={closeMob}>Contact Us →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
