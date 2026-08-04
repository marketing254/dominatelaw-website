'use client';
import { useEffect, useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';
const KIT_FORM_IDS = { podcast: '9522885', webinar: '9535001' };

// Gated media player: form unlocks ALL items of the given type (localStorage),
// submits to Apps Script (Sheet + team email) and Kit in parallel.
// `poster` (optional): thumbnail URL shown as a locked preview above the form.
export default function GateForm({ type, meta, poster, children }) {
  const storageKey = `dl_unlocked_${type}_all`;
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(storageKey)) setUnlocked(true); } catch {}
    setReady(true);
  }, [storageKey]);

  function submit(e) {
    e.preventDefault();
    const f = e.target;
    const val = n => (f.elements[n]?.value || '').trim();
    const [first, last, email, phone, firm] = ['first', 'last', 'email', 'phone', 'firm'].map(val);
    if (!first || !last || !email || !phone || !firm) return setErr('All fields are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email.');
    setErr('');
    setBusy(true);

    const payload = type === 'podcast'
      ? { form: 'podcast_gate', tab: 'Podcast Gate', first_name: first, last_name: last, email, phone, firm_name: firm,
          podcast_episode: meta.episode, podcast_title: meta.title, page_url: window.location.href }
      : { form: 'webinar_replay_gate', tab: 'Webinar Replay Gate', first_name: first, last_name: last, email, phone, firm_name: firm,
          webinar_title: meta.title, webinar_date: meta.dateLabel || '', replay_id: meta.slug, vimeo_link: meta.vimeoLink || '', page_url: window.location.href };

    // Fire both submissions in the background — don't make the user wait for
    // Apps Script cold starts. keepalive lets the requests survive navigation.
    const kitId = KIT_FORM_IDS[type];
    if (kitId) {
      const kp = new URLSearchParams();
      kp.append('email_address', email);
      kp.append('fields[first_name]', first);
      kp.append('fields[last_name]', last);
      kp.append('fields[phone]', phone);
      kp.append('fields[firm_name]', firm);
      kp.append('fields[source]', payload.form);
      kp.append('fields[page_url]', window.location.href);
      if (type === 'podcast') kp.append('fields[episode]', meta.title);
      else { kp.append('fields[webinar_title]', meta.title); kp.append('fields[replay_id]', meta.slug); }
      fetch(`https://app.kit.com/forms/${kitId}/subscriptions`, {
        method: 'POST', mode: 'no-cors', keepalive: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: kp.toString(),
      }).catch(() => {});
    }
    fetch(APPS_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    // Optimistic unlock — instant.
    try { localStorage.setItem(storageKey, String(Date.now())); } catch {}
    setUnlocked(true);
  }

  if (!ready) return null;
  if (unlocked) return children;

  return (
    <div style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {poster && (
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'linear-gradient(135deg,var(--brown),var(--brown3))' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(.75)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--brown)', boxShadow: '0 10px 34px rgba(0,0,0,.35)' }}>🔒</span>
            <span style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>
              Fill the form below to watch
            </span>
          </div>
        </div>
      )}
      <div style={{ padding: '28px 30px' }}>
      <p style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold2)', marginBottom: 6 }}>
        {type === 'podcast' ? 'Unlock this episode' : 'Unlock this replay'}
      </p>
      <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 18 }}>
        Enter your details once to unlock every {type === 'podcast' ? 'episode' : 'replay'} — free, instant access.
      </p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input name="first" placeholder="First name" required style={inputStyle} />
          <input name="last" placeholder="Last name" required style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input name="email" type="email" placeholder="you@yourfirm.com" required style={inputStyle} />
          <input name="phone" type="tel" placeholder="Phone" required style={inputStyle} />
        </div>
        <input name="firm" placeholder="Firm name" required style={inputStyle} />
        {err && <div style={{ color: '#C0392B', fontSize: '.8rem' }}>{err}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center' }}>
          {busy ? 'Unlocking…' : type === 'podcast' ? '🎙️ Listen Now' : '▶ Watch Replay Now'}
        </button>
      </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 6,
  fontSize: '.9rem', background: '#fff', color: 'var(--warm)',
};
