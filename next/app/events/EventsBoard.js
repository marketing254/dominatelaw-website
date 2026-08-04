'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';

// ── Countdown target: event date at its start time in America/New_York ──
function countdownTarget(dateIso, time) {
  if (!dateIso) return null;
  let evHour = 20, evMin = 0; // default 8 PM ET
  if (time) {
    const m = time.match(/(\d+)(?:[:.](\d+))?\s*(AM|PM)/i);
    if (m) {
      evHour = parseInt(m[1], 10);
      evMin = parseInt(m[2] || '0', 10);
      if (m[3].toUpperCase() === 'PM' && evHour !== 12) evHour += 12;
      if (m[3].toUpperCase() === 'AM' && evHour === 12) evHour = 0;
    }
  }
  try {
    const probeUTC = new Date(`${dateIso}T${String(evHour).padStart(2, '0')}:${String(evMin).padStart(2, '0')}:00Z`);
    const nyHour = parseInt(
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }).format(probeUTC),
      10
    ) % 24;
    let shift = evHour - nyHour;
    if (shift < -12) shift += 24;
    if (shift > 12) shift -= 24;
    return new Date(probeUTC.getTime() + shift * 3600000);
  } catch {
    return new Date(`${dateIso}T00:00:00`);
  }
}

function Countdown({ dateIso, time }) {
  const target = useMemo(() => countdownTarget(dateIso, time), [dateIso, time]);
  const [parts, setParts] = useState({ d: '--', h: '--', m: '--', s: '--' });

  useEffect(() => {
    if (!target) return;
    const fmt = n => String(n).padStart(2, '0');
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) return setParts({ d: '00', h: '00', m: '00', s: '00' });
      setParts({
        d: fmt(Math.floor(diff / 86400000)),
        h: fmt(Math.floor((diff % 86400000) / 3600000)),
        m: fmt(Math.floor((diff % 3600000) / 60000)),
        s: fmt(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div>
      <div className="ev-cd-label">Event Starts In</div>
      <div className="ev-countdown">
        <div className="ev-cd-block"><div className="ev-cd-num">{parts.d}</div><div className="ev-cd-lbl">Days</div></div>
        <div className="ev-cd-block"><div className="ev-cd-num">{parts.h}</div><div className="ev-cd-lbl">Hrs</div></div>
        <div className="ev-cd-block"><div className="ev-cd-num">{parts.m}</div><div className="ev-cd-lbl">Min</div></div>
        <div className="ev-cd-block"><div className="ev-cd-num">{parts.s}</div><div className="ev-cd-lbl">Sec</div></div>
      </div>
    </div>
  );
}

function SpeakerAvatar({ speaker }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="ev-speaker">
      <div className="ev-speaker-img">
        {speaker.src && !broken
          ? <img src={speaker.src} alt={speaker.name} loading="lazy" onError={() => setBroken(true)} />
          : <span>{speaker.initials}</span>}
      </div>
      <div className="ev-speaker-name">{speaker.name}</div>
    </div>
  );
}

// ── Registration modal ─────────────────────────────────────────────
function RegModal({ ev, onClose }) {
  const regKey = `dl_reg_${ev.webinarId || ev.title || 'event'}`;
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const loadTs = useRef(Date.now());

  useEffect(() => {
    try { if (localStorage.getItem(regKey)) setDone(true); } catch {}
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [regKey, onClose]);

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    const val = n => (f.elements[n]?.value || '').trim();
    // Honeypot + too-fast guard (spam)
    if (val('dl_hp') || Date.now() - loadTs.current < 2000) return;
    const fields = {
      first_name: val('first_name'),
      last_name: val('last_name'),
      email: val('email'),
      phone: val('phone'),
      questions: val('questions'),
    };
    if (!fields.first_name || !fields.last_name || !fields.email || !fields.phone) {
      return setErr('Please fill in all required fields.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      return setErr('Please enter a valid email address.');
    }
    setErr('');
    setBusy(true);

    const payload = {
      tab: 'Event Registrations',
      ...fields,
      webinar_id: ev.webinarId || '',
      event_title: ev.title || '',
      event_date: ev.monthYear ? `${ev.day} ${ev.monthYear}` : '',
      zoom_account: ev.zoomAccount || '',
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      form: 'event_registration',
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      try { localStorage.setItem(regKey, '1'); } catch {}
      setDone(true);
    } catch {
      setErr('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  return (
    <div className="ev-modal-bg" role="dialog" aria-modal="true" aria-labelledby="ev-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ev-modal">
        <div className="ev-modal-head">
          <button className="ev-modal-close" onClick={onClose} aria-label="Close">✕</button>
          <h3 id="ev-modal-title">Reserve Your Spot</h3>
          <p>{ev.title || 'Free virtual event — seats are limited'}</p>
        </div>
        <div className="ev-modal-body">
          {done ? (
            <div className="ev-success">
              <div className="ev-success-icon">🎉</div>
              <h3>You&apos;re Registered!</h3>
              <p>Check your inbox for a Zoom confirmation email.<br />We&apos;ll also send you a reminder before the event.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="dl-hp" aria-hidden="true">
                <input type="text" name="dl_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              <div className="ev-frow">
                <div className="ev-fg">
                  <label htmlFor="evFname">First Name <em>*</em></label>
                  <input id="evFname" name="first_name" type="text" placeholder="Alex" required autoComplete="given-name" />
                </div>
                <div className="ev-fg">
                  <label htmlFor="evLname">Last Name <em>*</em></label>
                  <input id="evLname" name="last_name" type="text" placeholder="Thompson" required autoComplete="family-name" />
                </div>
              </div>
              <div className="ev-fg">
                <label htmlFor="evEmail">Email Address <em>*</em></label>
                <input id="evEmail" name="email" type="email" placeholder="alex@yourfirm.com" required autoComplete="email" />
              </div>
              <div className="ev-fg">
                <label htmlFor="evPhone">Phone <em>*</em></label>
                <input id="evPhone" name="phone" type="tel" placeholder="+1 (555) 000-0000" required autoComplete="tel" />
              </div>
              <div className="ev-fg">
                <label htmlFor="evQuestion">What questions do you have?</label>
                <textarea id="evQuestion" name="questions" placeholder="Share any questions you'd like addressed during the event…" />
              </div>
              <p style={{ fontSize: '.72rem', color: '#c0392b', fontWeight: 600, textAlign: 'center', margin: '4px 0 8px', letterSpacing: '.01em' }}>
                ⚠ Limited seats available — register now to secure your spot.
              </p>
              {err && (
                <p style={{ fontSize: '.78rem', color: '#b42318', fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }} role="alert">{err}</p>
              )}
              <button className="ev-submit" type="submit" disabled={busy}>
                {busy ? 'Registering…' : "Reserve My Spot — It's Free"}
              </button>
              <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--muted)', marginTop: 12 }}>
                No credit card required. You&apos;ll receive a Zoom confirmation email.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Featured hero + upcoming list ─────────────────────────────────
export default function EventsBoard({ featured, featuredIsPast, rest }) {
  const [modalEvent, setModalEvent] = useState(null);

  if (!featured) {
    return <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 48 }}>No events scheduled yet.</p>;
  }

  return (
    <>
      <div className="ev-hero">
        <div className="ev-hero-inner">
          <div className="ev-hero-content">
            <div className="ev-live-badge">
              <div className="ev-live-dot" />
              {featuredIsPast ? 'Past Event' : 'Next Event'}
            </div>
            <h2>{featured.title}</h2>
            <div className="ev-meta-row">
              <div className="ev-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                {featured.day} {featured.monthYear}
              </div>
              <div className="ev-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                {featured.time || 'Time TBA'}
              </div>
              <div className="ev-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /></svg>
                Virtual · Free
              </div>
            </div>

            {!featuredIsPast && (
              <div className="ev-urgency-bump" style={{ margin: '18px 0 4px', padding: '13px 16px', background: 'linear-gradient(135deg,rgba(196,154,10,.18),rgba(96,39,15,.22))', border: '1px solid rgba(196,154,10,.55)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0 }}>
                    <span style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'rgba(196,154,10,.25)', animation: 'dl-seat-ping 1.6s ease-out infinite' }} />
                    <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#E8C44A', display: 'block' }} />
                  </span>
                  <span style={{ fontSize: '.79rem', fontWeight: 700, color: '#E8C44A', letterSpacing: '.01em' }}>Seats Are Filling Up Fast</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,.09)', borderRadius: 100, height: 6, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ width: '74%', height: '100%', background: 'linear-gradient(90deg,#C49A0A,#E8C44A)', borderRadius: 100, animation: 'dl-seat-fill .9s ease-out forwards' }} />
                </div>
                <div style={{ fontSize: '.71rem', color: 'rgba(255,255,255,.6)' }}>
                  Limited capacity&nbsp;·&nbsp;Free to attend&nbsp;·&nbsp;No credit card required
                </div>
              </div>
            )}

            {featured.agenda.length > 0 && (
              <div className="ev-agenda">
                <div className="ev-agenda-lbl">What We&apos;ll Cover</div>
                {featured.agenda.map((line, i) => (
                  <div className="ev-agenda-item" key={i}>
                    <div className="ev-agenda-dot" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            )}

            {featuredIsPast ? (
              <span className="ev-reg-btn" style={{ opacity: 0.55, cursor: 'default' }}>Registration Closed</span>
            ) : (
              <div>
                <button className="ev-reg-btn ev-reg-btn-hype" onClick={() => setModalEvent(featured)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  Reserve My Free Spot Now
                </button>
                <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.55)', marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Secure registration&nbsp;·&nbsp;Zoom link sent instantly&nbsp;·&nbsp;No waitlist once full
                </p>
              </div>
            )}
          </div>

          <div className="ev-sidebar">
            <div className="ev-date-big">
              <div className="ev-day">{featured.day}</div>
              <div className="ev-mo">{featured.monthYear}</div>
            </div>
            {!featuredIsPast && <Countdown dateIso={featured.dateIso} time={featured.time} />}
            {featured.speakers.length > 0 && (
              <div>
                <div className="ev-speakers-lbl">Panelists</div>
                {featured.speakers.map((s, i) => <SpeakerAvatar speaker={s} key={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {rest.length > 0 && (
        <div>
          <p className="ev-upcoming-title">More Upcoming Events</p>
          {rest.map((ev, i) => (
            <div className="ev-upcoming-card" key={i}>
              <div className="ev-upcoming-badge">
                <div className="ev-upcoming-day">{ev.day}</div>
                <div className="ev-upcoming-mo">{(ev.monthYear || '').split(' ')[0]}</div>
              </div>
              <div className="ev-upcoming-info">
                <h4>{ev.title}</h4>
                <p>{ev.speakers.map(s => s.name).join(' · ') || 'Panelists TBA'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, flexShrink: 0 }}>
                    <span style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'rgba(196,154,10,.25)', animation: 'dl-seat-ping 1.8s ease-out infinite' }} />
                    <span style={{ position: 'relative', width: 6, height: 6, borderRadius: '50%', background: '#C49A0A', display: 'block' }} />
                  </span>
                  <span style={{ fontSize: '.69rem', fontWeight: 600, color: '#7A3515', letterSpacing: '.01em' }}>Limited seats · Register early</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '.82rem' }} onClick={() => setModalEvent(ev)}>
                  Reserve Spot →
                </button>
                <span style={{ fontSize: '.67rem', color: 'var(--muted)' }}>Free · No card needed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalEvent && <RegModal ev={modalEvent} onClose={() => setModalEvent(null)} />}
    </>
  );
}
