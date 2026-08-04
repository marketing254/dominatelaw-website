'use client';
import { useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';
const KIT_FORM_ID = '9534968';

const TYPES = [
  'Podcast Guest',
  'Speaker / Panelist (Events)',
  'Both — Podcast Guest & Speaker',
];
const TOPICS = [
  'Law Firm Marketing & SEO',
  'Social Media for Attorneys',
  'Practice Management & Operations',
  'Legal Technology & AI',
  'Client Experience & Retention',
  'Business Development & Growth',
  'Finance, Billing & Pricing',
  'Attorney Wellness & Mindset',
  'Ethics & Compliance',
  'Niche Practice Area Strategies',
  'Other',
];

export default function GuestForm() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    if ((f.elements.website_url?.value || '').trim()) return; // honeypot

    const val = n => (f.elements[n]?.value || '').trim();
    const fname = val('fname'), lname = val('lname'), title = val('title'),
      org = val('org'), email = val('email'), phone = val('phone'),
      type = val('type'), topic = val('topic'), bio = val('bio'), links = val('links');

    if (!fname || !lname || !title || !org || !email) return setErr('Please fill in all required fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email address.');
    setErr('');
    setBusy(true);

    try {
      /* Kit — parallel, fire-and-forget (bio/links excluded) */
      try {
        const kp = new URLSearchParams();
        kp.append('email_address', email);
        kp.append('fields[first_name]', fname);
        kp.append('fields[last_name]', lname || '');
        kp.append('fields[phone]', phone || '');
        kp.append('fields[title]', title || '');
        kp.append('fields[organization]', org || '');
        kp.append('fields[application_type]', type || '');
        kp.append('fields[topic]', topic || '');
        kp.append('fields[source]', 'guest_speaker');
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
          tab: 'Guest Speaker',
          'First Name': fname,
          'Last Name': lname,
          'Title': title,
          'Organization': org,
          'Email': email,
          'Phone': phone,
          'Type': type,
          'Topic': topic,
          'Bio': bio,
          'Links': links,
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
      <div className="gs-success">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#27ae60" strokeWidth="2.5" />
          <path d="M18 28l7 7 13-14" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3>Application Received!</h3>
        <p>Thank you! Naren and the team will review your application and get back to you within 3 business days at the email you provided.</p>
      </div>
    );
  }

  return (
    <form className="gs-form" onSubmit={submit} noValidate>
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <input type="text" name="website_url" tabIndex={-1} autoComplete="new-password" />
      </div>
      <div className="gs-row">
        <div className="gs-field">
          <label htmlFor="gs-fname">First Name *</label>
          <input type="text" id="gs-fname" name="fname" placeholder="John" required />
        </div>
        <div className="gs-field">
          <label htmlFor="gs-lname">Last Name *</label>
          <input type="text" id="gs-lname" name="lname" placeholder="Carter" required />
        </div>
      </div>
      <div className="gs-field">
        <label htmlFor="gs-title">Professional Title / Designation *</label>
        <input type="text" id="gs-title" name="title" placeholder="e.g. Managing Partner, Legal Tech Founder" required />
      </div>
      <div className="gs-field">
        <label htmlFor="gs-org">Firm / Organization *</label>
        <input type="text" id="gs-org" name="org" placeholder="e.g. Carter Law Group" required />
      </div>
      <div className="gs-field">
        <label htmlFor="gs-email">Email Address *</label>
        <input type="email" id="gs-email" name="email" placeholder="john@carterlawgroup.com" required />
      </div>
      <div className="gs-field">
        <label htmlFor="gs-phone">Phone Number</label>
        <input type="tel" id="gs-phone" name="phone" placeholder="(555) 000-0000" />
      </div>
      <div className="gs-field">
        <label htmlFor="gs-type">I’m applying as a *</label>
        <select id="gs-type" name="type" required defaultValue="">
          <option value="">— Select —</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="gs-field">
        <label htmlFor="gs-topic">Proposed Topic / Area of Expertise *</label>
        <select id="gs-topic" name="topic" defaultValue="">
          <option value="">— Select the closest match —</option>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="gs-field">
        <label htmlFor="gs-bio">Brief Bio / Why You? *</label>
        <textarea id="gs-bio" name="bio" placeholder="Tell us about your background, what makes you a great guest, and what value you'll bring to our attorney audience..." style={{ minHeight: 96 }} />
      </div>
      <div className="gs-field">
        <label htmlFor="gs-links">Website / LinkedIn / Social Profiles</label>
        <input type="text" id="gs-links" name="links" placeholder="https://" />
      </div>
      {err && <div style={{ color: '#c0392b', fontSize: '.78rem' }}>{err}</div>}
      <button type="submit" className="gs-submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit My Application →'}
      </button>
    </form>
  );
}
