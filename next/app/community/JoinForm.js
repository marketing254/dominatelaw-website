'use client';
import { useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';
const KIT_FORM_ID = '9525713';

const ROLES = [
  'Solo Practitioner', 'Associate Attorney', 'Partner', 'Managing Partner',
  'Law Firm Owner', 'Paralegal / Legal Professional', 'Law Student', 'Legal Consultant',
];
const AREAS = [
  'Personal Injury', 'Family Law', 'Criminal Defense', 'Immigration', 'Estate Planning',
  'Business / Corporate', 'Employment Law', 'Real Estate', 'Other',
];

// source: 'Hero Form' | 'Main Form'
export default function JoinForm({ source = 'Main Form' }) {
  const hero = source === 'Hero Form';
  const p = hero ? 'hj' : 'j'; // unique element ids per instance
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    if ((f.elements.website_url?.value || '').trim()) return; // honeypot

    const val = n => (f.elements[n]?.value || '').trim();
    const fname = val('fname'), lname = val('lname'), email = val('email'),
      role = val('role'), area = val('area');

    if (!fname || !lname || !email || !role) return setErr('Please fill in all required fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email address.');
    setErr('');
    setBusy(true);

    try {
      /* Kit — parallel, fire-and-forget */
      try {
        const kp = new URLSearchParams();
        kp.append('email_address', email);
        kp.append('fields[first_name]', fname);
        kp.append('fields[last_name]', lname);
        kp.append('fields[role]', role || '');
        kp.append('fields[practice_area]', area || '');
        kp.append('fields[source]', 'community_join');
        kp.append('fields[page_url]', window.location.href);
        fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: kp.toString(),
        }).catch(() => {});
      } catch {}

      /* Apps Script — Sheet write + team email */
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          tab: 'Community Join',
          'Source': source,
          'First Name': fname,
          'Last Name': lname,
          'Email': email,
          'Role': role,
          'Practice Area': area || '',
        }),
      });
      setSent(true);
    } catch {
      setBusy(false);
      setErr('Something went wrong. Please try again.');
    }
  }

  if (sent) {
    return (
      <div className="join-success">
        <svg width={hero ? 40 : 56} height={hero ? 40 : 56} viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#27ae60" strokeWidth="2.5" />
          <path d="M18 28l7 7 13-14" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 style={hero ? { fontSize: '1rem' } : undefined}>Welcome to the Community!</h3>
        {hero
          ? <p style={{ fontSize: '.82rem' }}>Check your inbox for a welcome email from Naren.</p>
          : <p>You’re in! Check your inbox for a welcome email from Naren with your community access link and your first free resource download.</p>}
      </div>
    );
  }

  return (
    <form className="join-form" onSubmit={submit} noValidate>
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <input type="text" name="website_url" tabIndex={-1} autoComplete="new-password" />
      </div>
      <div className="join-row">
        <div className="jf">
          <label htmlFor={`${p}-fname`}>First Name *</label>
          <input type="text" id={`${p}-fname`} name="fname" placeholder="Alex" required />
        </div>
        <div className="jf">
          <label htmlFor={`${p}-lname`}>Last Name *</label>
          <input type="text" id={`${p}-lname`} name="lname" placeholder="Thompson" required />
        </div>
      </div>
      <div className="jf">
        <label htmlFor={`${p}-email`}>Email Address *</label>
        <input type="email" id={`${p}-email`} name="email" placeholder="alex@yourfirm.com" required />
      </div>
      <div className="jf">
        <label htmlFor={`${p}-role`}>Your Role *</label>
        <select id={`${p}-role`} name="role" required defaultValue="">
          <option value="">— Select —</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div className="jf">
        <label htmlFor={`${p}-area`}>Primary Practice Area</label>
        <select id={`${p}-area`} name="area" defaultValue="">
          <option value="">— Select —</option>
          {AREAS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>
      {err && <div style={{ color: '#c0392b', fontSize: '.78rem' }}>{err}</div>}
      <button type="submit" className="join-submit" disabled={busy}>
        {busy ? 'Joining…' : hero ? 'Join Free →' : 'Join the Community Free →'}
      </button>
    </form>
  );
}
