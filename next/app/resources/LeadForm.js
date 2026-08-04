'use client';
import { useState } from 'react';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8,
  fontSize: '.9rem', outline: 'none', background: '#fff', color: 'var(--warm)',
};
const labelStyle = {
  display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--warm)', marginBottom: 6,
};

// Lead magnet form — submits to Apps Script, which emails the PDF guide.
export default function LeadForm() {
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    const val = n => (f.elements[n]?.value || '').trim();
    const name = val('name');
    const email = val('email');
    const firm = val('firm');
    if (!name || !email || !firm) return;

    setBusy(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tab: 'Free Downloads Gate',
          'First Name': name.split(' ')[0],
          'Last Name': name.split(' ').slice(1).join(' '),
          'Email': email,
          'Firm Name': firm,
          'Role': '',
          sendGuide: true,
        }),
      });
    } catch {}
    setSentTo(email);
    setBusy(false);
  }

  if (sentTo) {
    return (
      <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, background: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h3 style={{ fontSize: '1.15rem', margin: '0 0 8px', color: 'var(--brown)' }}>Your guide is on its way!</h3>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', margin: '0 0 18px', lineHeight: 1.6 }}>
          Check your inbox at <strong>{sentTo}</strong> — we&apos;ve sent you the<br />
          <em>Law Firm Growth Blueprint 2026</em> directly.
        </p>
        <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0 }}>
          Didn&apos;t get it? Check your spam folder or <a href="/contact" style={{ color: 'var(--brown)', textDecoration: 'underline' }}>contact us</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="r-name">Your Name</label>
        <input id="r-name" name="name" style={inputStyle} type="text" placeholder="Jane Smith" required />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="r-email">Work Email</label>
        <input id="r-email" name="email" style={inputStyle} type="email" placeholder="jane@smithlawfirm.com" required />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle} htmlFor="r-firm">Firm Name</label>
        <input id="r-firm" name="firm" style={inputStyle} type="text" placeholder="Smith & Associates" required />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '16px 36px', fontSize: '1rem' }}>
        {busy ? 'Sending your guide…' : 'Send Me the Free Guide →'}
      </button>
      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
        We respect your privacy. Unsubscribe anytime.
      </p>
    </form>
  );
}
