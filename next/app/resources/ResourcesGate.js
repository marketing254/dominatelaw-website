'use client';
import { useEffect, useRef, useState } from 'react';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';
const KIT_FORM_ID = '9534993'; // free_downloads
const RES_KEY = 'dl_res_gate_v2';

const ROLES = [
  'Attorney / Lawyer', 'Managing Partner', 'Solo Practitioner', 'Law Firm Owner',
  'Paralegal', 'Legal Administrator', 'Other Legal Professional',
];

function submitted() {
  try { if (localStorage.getItem(RES_KEY)) return true; } catch {}
  return document.cookie.indexOf(RES_KEY + '=1') > -1;
}
function save(d) {
  try { localStorage.setItem(RES_KEY, JSON.stringify(d)); } catch {}
  try { document.cookie = `${RES_KEY}=1;max-age=31536000;path=/`; } catch {}
}

// Full-page gate overlay for the Free Downloads library.
export default function ResourcesGate() {
  const [open, setOpen] = useState(false);
  const [errs, setErrs] = useState({});
  const loadTs = useRef(Date.now());

  useEffect(() => {
    // ?reset_gate — force clear and re-show (for testing), same as old page
    if (window.location.search.indexOf('reset_gate') > -1) {
      try { localStorage.removeItem(RES_KEY); } catch {}
      document.cookie = `${RES_KEY}=;max-age=0;path=/`;
      history.replaceState(null, '', window.location.pathname);
    }
    if (!submitted()) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function submit(e) {
    e.preventDefault();
    const f = e.target;
    const val = n => (f.elements[n]?.value || '').trim();
    const fn = val('first');
    const ln = val('last');
    const em = val('email');
    const fi = val('firm');
    const ro = val('role');
    // Honeypot + too-fast guard
    if (val('dl_hp') || Date.now() - loadTs.current < 2000) return;

    const next = {};
    if (!fn) next.first = true;
    if (!ln) next.last = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) next.email = true;
    setErrs(next);
    if (Object.keys(next).length) return;

    save({ firstName: fn, lastName: ln, email: em, firm: fi, role: ro, ts: Date.now() });
    try {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tab: 'Free Downloads Gate',
          'First Name': fn, 'Last Name': ln, 'Email': em, 'Firm Name': fi, 'Role': ro,
          sendGuide: true,
        }),
      }).catch(() => {});
    } catch {}
    try {
      const kp = new URLSearchParams();
      kp.append('email_address', em);
      kp.append('fields[first_name]', fn);
      kp.append('fields[last_name]', ln || '');
      kp.append('fields[firm_name]', fi || '');
      kp.append('fields[role]', ro || '');
      kp.append('fields[source]', 'free_downloads');
      kp.append('fields[page_url]', window.location.href);
      fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: kp.toString(),
      }).catch(() => {});
    } catch {}

    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="res-gate-ov">
      <div className="res-gate-box" role="dialog" aria-modal="true" aria-labelledby="dlResGateTitle">
        <button className="res-gate-close" onClick={() => { window.location.href = '/'; }} aria-label="Close">✕</button>
        <div className="res-gate-badge">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 2h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#E8C44A" strokeWidth="1.8" />
            <path d="M7 7h10M7 11h7M17 18v4l-3-2-3 2v-4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="res-gate-eyebrow">Free Resources — Legal Professionals Only</div>
        <h2 id="dlResGateTitle">Unlock Your Free<br />Resource Library</h2>
        <p>
          Get instant, free access to all Dominate Law templates, guides, and checklists — built specifically
          for law firm owners and attorneys.
        </p>
        <form onSubmit={submit} noValidate>
          <div className="dl-hp" aria-hidden="true">
            <input type="text" name="dl_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
            <div className="res-gate-field">
              <label htmlFor="dlrFirst">First Name <span style={{ color: '#c0392b' }}>*</span></label>
              <input type="text" id="dlrFirst" name="first" placeholder="e.g. Sarah" autoComplete="given-name" />
              <span className={`res-gate-err${errs.first ? ' on' : ''}`}>Required.</span>
            </div>
            <div className="res-gate-field">
              <label htmlFor="dlrLast">Last Name <span style={{ color: '#c0392b' }}>*</span></label>
              <input type="text" id="dlrLast" name="last" placeholder="e.g. Mitchell" autoComplete="family-name" />
              <span className={`res-gate-err${errs.last ? ' on' : ''}`}>Required.</span>
            </div>
          </div>
          <div className="res-gate-field">
            <label htmlFor="dlrEmail">Email Address <span style={{ color: '#c0392b' }}>*</span></label>
            <input type="email" id="dlrEmail" name="email" placeholder="you@yourfirm.com" autoComplete="email" />
            <span className={`res-gate-err${errs.email ? ' on' : ''}`}>Please enter a valid email address.</span>
          </div>
          <div className="res-gate-field">
            <label htmlFor="dlrFirm">Firm Name</label>
            <input type="text" id="dlrFirm" name="firm" placeholder="Smith & Associates" autoComplete="organization" />
          </div>
          <div className="res-gate-field">
            <label htmlFor="dlrRole">Your Role</label>
            <select id="dlrRole" name="role" defaultValue="">
              <option value="">— Select your role —</option>
              {ROLES.map(r => <option value={r} key={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" className="res-gate-submit">Get Free Access → Unlock All Resources</button>
        </form>
        <p className="res-gate-note">🔒 We respect your privacy. No spam, no selling your data. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
