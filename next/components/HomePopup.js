'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const HP_KEY = 'dl_hp_popup_seen';
const SHEET_ID = '1Kqtgrii6peL3DxEp7PO45zSYd3sSeTN-e1tHmkFdLpg';

// Parse a GViz "Date(YYYY,M,D)" cell or a plain date string (legacy dlParseDate)
function parseDate(str) {
  if (!str) return null;
  const m = String(str).match(/^Date\((\d+),(\d+),(\d+)/);
  if (m) return new Date(+m[1], +m[2], +m[3]);
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Legacy banner-led "What's New" popup — latest podcast (server-passed prop)
// plus next upcoming event (fetched client-side from the events sheet tab,
// exactly like js/sheets.js did on the old site).
export default function HomePopup({ latest }) {
  const [mounted, setMounted] = useState(false);   // display:flex applied
  const [visible, setVisible] = useState(false);   // .visible class (fade in)
  const [closed, setClosed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [evt, setEvt] = useState(undefined);       // undefined=loading, null=none, {}=event

  /* Show once per session after 2.5s (legacy timing) */
  useEffect(() => {
    try { if (sessionStorage.getItem(HP_KEY)) { setClosed(true); return; } } catch (e) {}
    const t = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  /* Load next upcoming event from the events sheet tab */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=events`;
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.replace(/^[^{]+\(/, '').replace(/\);?\s*$/, ''));
        const cols = json.table.cols.map(c => (c.label || '').trim().toLowerCase().replace(/\s+/g, '_'));
        const rows = json.table.rows.map(row => {
          const obj = {};
          cols.forEach((label, i) => {
            if (!label) return;
            const cell = row.c && row.c[i];
            obj[label] = cell && cell.v != null ? String(cell.v).trim() : '';
          });
          return obj;
        });
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const sorted = rows.slice().sort((a, b) => (parseDate(a.date_iso) || 0) - (parseDate(b.date_iso) || 0));
        const upcoming = sorted.find(ev => {
          const d = parseDate(ev.date_iso);
          return d && d >= today;
        });
        if (!cancelled) setEvt(upcoming || null);
      } catch (e) {
        if (!cancelled) setEvt(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setVisible(false);
    setTimeout(() => setClosed(true), 380);
    try { sessionStorage.setItem(HP_KEY, '1'); } catch (e) {}
  }

  if (closed || (!latest && !evt)) return null;

  const epNum = latest ? (parseInt(String(latest.episode).replace(/[^\d]/g, ''), 10) || 0) : 0;
  const speakerCount = latest && latest.speakers
    ? String(latest.speakers).split('|').map(s => s.trim()).filter(Boolean).length
    : 0;
  const isPanel = speakerCount > 1;
  const baseByline = isPanel
    ? `Featuring a panel of ${speakerCount - 1}`
    : (latest && latest.guest_name ? `With ${latest.guest_name}` : 'Dominate Law Podcast');
  const byline = latest && latest.dateLabel ? `${baseByline} · ${latest.dateLabel}` : baseByline;
  const epHref = latest ? `/podcast-episode/${latest.slug}` : '/podcast';
  const photoUrl = latest ? latest.photoUrl : '';

  return (
    <div
      id="home-popup-backdrop"
      role="dialog" aria-modal="true" aria-labelledby="hp-title"
      className={visible ? 'visible' : ''}
      style={{ display: mounted ? 'flex' : 'none' }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div id="home-popup">
        <button id="home-popup-close" aria-label="Close" onClick={close}>✕</button>

        {/* Header */}
        <div className="hp-header">
          <span className="hp-header-label" id="hp-title">What&apos;s New on Dominate Law</span>
          <span className="hp-header-dot" />
          <span className="hp-header-label" style={{ color: 'rgba(255,255,255,.45)', fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontSize: '.72rem' }}>Don&apos;t miss these →</span>
        </div>

        {/* Two cards */}
        <div className="hp-cards">

          {/* Podcast card */}
          {latest && (
            <div className="hp-card hp-card-pod">
              <div className="hp-card-tag podcast">
                <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M2.5 8a5.5 5.5 0 1 1 11 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M1 8a7 7 0 1 1 14 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".4" /></svg>
                Latest Podcast
              </div>
              <Link href={epHref} id="hp-pod-banner-link" className="hp-pod-banner" onClick={close} aria-label="Listen to latest episode">
                {photoUrl && !imgFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    id="hp-pod-img"
                    src={photoUrl}
                    alt={`Episode ${latest.episode}: ${latest.title}`}
                    loading="lazy"
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  <div className="hp-pod-banner-fallback" id="hp-pod-fallback">DL</div>
                )}
                <span className="hp-pod-num" id="hp-pod-ep">Episode {latest.episode}</span>
                <span className={`hp-pod-flag${epNum >= 21 ? ' visible' : ''}`} id="hp-pod-flag">NEW</span>
              </Link>
              <div className="hp-pod-meta" id="hp-pod-byline">{byline}</div>
              <p className="hp-pod-title" id="hp-pod-title">{latest.title}</p>
              <div className="hp-pod-actions">
                <Link href={epHref} id="hp-pod-link" className="hp-btn hp-btn-podcast" onClick={close}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><polygon points="5,3 13,8 5,13" /></svg>
                  Listen Now
                </Link>
              </div>
            </div>
          )}

          {/* Event card — hidden when there is no upcoming event (legacy behavior) */}
          {evt !== null && (
            <div className="hp-card">
              <div className="hp-card-tag event">
                <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                Next Event
              </div>
              <div className="hp-evt-date">
                <div className="hp-evt-date-day" id="hp-evt-day">{evt ? (evt.day || '') : '—'}</div>
                <div className="hp-evt-date-month" id="hp-evt-month">{evt ? (evt.month_year || '') : ''}</div>
              </div>
              <p className="hp-evt-title" id="hp-evt-title">{evt ? (evt.title || 'Upcoming Event') : 'Loading...'}</p>
              <p className="hp-evt-desc" id="hp-evt-desc">{evt ? (evt.description || '') : ''}</p>
              <a href={(evt && evt.register_url) || '/events'} id="hp-evt-link" className="hp-btn hp-btn-event" onClick={close}>
                Register Free →
              </a>
            </div>
          )}

        </div>{/* /hp-cards */}
      </div>
    </div>
  );
}
