'use client';
import { useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';
const KIT_FORM_ID = '9525833';
const SUBJECTS = ['General Enquiry', 'Partnership', 'Podcast / Guest', 'Legal Tools', 'Marketing Help', 'Other'];

export default function ContactForm() {
  const [subject, setSubject] = useState('General Enquiry');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendErr, setSendErr] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    if ((f.elements.website_url?.value || '').trim()) return; // honeypot

    const val = n => (f.elements[n]?.value || '').trim();
    const fname = val('fname'), lname = val('lname'), email = val('email'),
      phone = val('phone'), message = val('message');

    const errs = {};
    if (!fname) errs.fname = 'Please enter your first name.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!phone) errs.phone = 'Please enter your phone number.';
    if (!message) errs.message = 'Please enter your message.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setSendErr(false);
    try {
      /* Kit — parallel, fire-and-forget (message excluded) */
      try {
        const kp = new URLSearchParams();
        kp.append('email_address', email);
        kp.append('fields[first_name]', fname);
        kp.append('fields[last_name]', lname || '');
        kp.append('fields[phone]', phone || '');
        kp.append('fields[subject]', subject || '');
        kp.append('fields[source]', 'contact_us');
        kp.append('fields[page_url]', window.location.href);
        fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: kp.toString(),
        }).catch(() => {});
      } catch {}

      /* Apps Script — Sheet write + forwards the message to the team */
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          tab: 'Contact Us',
          'First Name': fname,
          'Last Name': lname,
          'Email': email,
          'Phone': phone,
          'Subject': subject,
          'Message': message,
        }),
      });
      setSent(true);
    } catch {
      setBusy(false);
      setSendErr(true);
    }
  }

  if (sent) {
    return (
      <div className="cf-success">
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <circle cx="27" cy="27" r="25" stroke="#2d8a4e" strokeWidth="2.5" />
          <path d="M17 27l7 7 13-14" stroke="#2d8a4e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3>Message Sent!</h3>
        <p>Thanks for reaching out. A member of our team will be in touch within 1 business day.</p>
      </div>
    );
  }

  return (
    <form className="cf-form" onSubmit={submit} noValidate>
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <input type="text" name="website_url" tabIndex={-1} autoComplete="new-password" />
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-fname">First Name <span className="req">*</span></label>
          <input type="text" id="cf-fname" name="fname" placeholder="Sarah" required />
          {errors.fname && <span className="cf-error">{errors.fname}</span>}
        </div>
        <div className="cf-field">
          <label htmlFor="cf-lname">Last Name</label>
          <input type="text" id="cf-lname" name="lname" placeholder="Mitchell" />
        </div>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-email">Email Address <span className="req">*</span></label>
        <input type="email" id="cf-email" name="email" placeholder="sarah@yourfirm.com" required />
        {errors.email && <span className="cf-error">{errors.email}</span>}
      </div>

      <div className="cf-field">
        <label htmlFor="cf-phone">Phone Number <span className="req">*</span></label>
        <input type="tel" id="cf-phone" name="phone" placeholder="(555) 000-0000" required />
        {errors.phone && <span className="cf-error">{errors.phone}</span>}
      </div>

      <div className="cf-field">
        <label>Subject</label>
        <div className="cf-subject-pills">
          {SUBJECTS.map(s => (
            <button
              type="button"
              key={s}
              className={`cf-pill${subject === s ? ' active' : ''}`}
              onClick={() => setSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-message">Message <span className="req">*</span></label>
        <textarea id="cf-message" name="message" placeholder="Tell us how we can help…" required />
        {errors.message && <span className="cf-error">{errors.message}</span>}
      </div>

      <button type="submit" className="cf-submit" disabled={busy}>
        {busy && <span className="cf-spinner" />}
        <span>{busy ? 'Sending…' : 'Send Message →'}</span>
      </button>

      {sendErr && (
        <div className="cf-send-error">
          ⚠️ Something went wrong. Please email us directly at{' '}
          <a href="mailto:info@dominatelaw.com" style={{ color: 'var(--brown)', fontWeight: 600 }}>info@dominatelaw.com</a>.
        </div>
      )}
    </form>
  );
}
