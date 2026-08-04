'use client';
import { useEffect, useRef, useState } from 'react';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwslGsQm3MyqmI-64flX_m33A1QU5PCu3V721fnoQmp4PQraCMlPgIKFmMMgXkbrja8/exec';
const KIT_FORM_ID = '9534984'; // legal_tools

const GATE_KEY = 'dl_tools_user';
const GATE_COOKIE = 'dl_tools_ok';
const RED = '#c0392b';
const GREEN = '#1e8e3e';

// ── formatting helpers (ported verbatim) ──────────────────────────
function fmt(n) {
  if (isNaN(n) || n === null) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}
function fmtDec(n, dec = 2) {
  if (isNaN(n)) return '—';
  return '$' + n.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}
function getCookie(name) {
  const m = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
  return m ? decodeURIComponent(m[1]) : null;
}

// ── Shared result box ─────────────────────────────────────────────
function ResultBox({ res, label, onReset }) {
  if (!res) return null;
  return (
    <div className="calc-result show" style={res.borderColor ? { borderLeftColor: res.borderColor } : undefined}>
      <div className="calc-result-label">{res.label || label}</div>
      <div className="calc-result-val" style={res.valueColor ? { color: res.valueColor } : undefined}>{res.value}</div>
      {res.sub && <div className="calc-result-sub">{res.sub}</div>}
      {res.rows && res.rows.length > 0 && (
        <div className="calc-result-breakdown">
          {res.rows.map((r, i) => (
            <div
              className="calc-result-row"
              key={i}
              style={r.strong ? { fontWeight: 700, color: 'var(--brown)' } : r.color ? { color: r.color } : undefined}
            >
              <span>{r.label}</span>
              <span style={r.valueColor ? { color: r.valueColor } : undefined}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      <span className="calc-reset" onClick={onReset}>Reset</span>
    </div>
  );
}

function ToolCard({ icon, title, desc, children }) {
  return (
    <div className="tool-card">
      <div className="tool-card-header">
        <div className="tool-icon">{icon}</div>
        <div>
          <div className="tool-card-title">{title}</div>
          <div className="tool-card-desc">{desc}</div>
        </div>
      </div>
      <div className="tool-card-body">{children}</div>
    </div>
  );
}

const numOf = (form, name) => parseFloat(form.elements[name]?.value) || 0;
const strOf = (form, name) => (form.elements[name]?.value || '').trim();

/* ══════════ CALCULATOR 1: CONTINGENCY FEE ══════════ */
function ContingencyCalc() {
  const [res, setRes] = useState(null);
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const settlement = numOf(f, 'settlement');
    const feePct = numOf(f, 'pct');
    const costs = numOf(f, 'costs');
    const deduct = f.elements.deduct.value;
    let fee, clientNet;
    if (deduct === 'before') {
      const base = settlement - costs;
      fee = base * (feePct / 100);
      clientNet = base - fee;
    } else {
      fee = settlement * (feePct / 100);
      clientNet = settlement - fee - costs;
    }
    setRes({
      value: fmt(fee),
      rows: [
        { label: 'Gross Settlement', value: fmt(settlement) },
        { label: `Attorney Fee (${feePct}%)`, value: fmt(fee) },
        { label: 'Litigation Costs', value: fmt(costs) },
        { label: 'Client Net Recovery', value: fmt(clientNet), strong: true },
      ],
    });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#E8C44A" strokeWidth="1.8" /><path d="M12 7v1.5M12 15.5V17M9.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2.5-2.5 3-2.5 3v1" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" /></svg>}
      title="Contingency Fee Calculator"
      desc="Calculate your attorney's fee, client net recovery, and litigation cost impact on any settlement."
    >
      <form onSubmit={calc}>
        <div className="calc-row">
          <label htmlFor="cf-settlement">Gross Settlement Amount ($)</label>
          <input type="number" id="cf-settlement" name="settlement" placeholder="e.g. 250000" min="0" step="1000" />
        </div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="cf-pct">Fee Percentage (%)</label>
            <input type="number" id="cf-pct" name="pct" placeholder="e.g. 33.33" min="0" max="60" step="0.01" />
          </div>
          <div className="calc-row">
            <label htmlFor="cf-costs">Litigation Costs ($)</label>
            <input type="number" id="cf-costs" name="costs" placeholder="e.g. 12000" min="0" step="500" />
          </div>
        </div>
        <div className="calc-row">
          <label htmlFor="cf-deduct">Costs Deducted</label>
          <select id="cf-deduct" name="deduct" defaultValue="before">
            <option value="before">Before fee calculation</option>
            <option value="after">After fee calculation</option>
          </select>
        </div>
        <button className="calc-btn" type="submit">Calculate Fee</button>
      </form>
      <ResultBox res={res} label="Attorney's Fee" onReset={() => setRes(null)} />
      <p className="calc-warn">⚖ For estimation purposes only. Actual fee agreements vary by jurisdiction and case complexity.</p>
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 2: BILLABLE HOURS ══════════ */
function BillableCalc() {
  const [res, setRes] = useState(null);
  const placeholders = [
    { n: 'Partner', r: '350' },
    { n: 'Associate', r: '225' },
    { n: 'Paralegal', r: '120' },
    { n: 'Other', r: '95' },
  ];
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    let totalAmt = 0, totalHrs = 0;
    const rows = [];
    for (let i = 0; i < 4; i++) {
      const h = numOf(f, `h${i}`);
      const r = numOf(f, `r${i}`);
      const n = strOf(f, `n${i}`) || `Timekeeper ${i + 1}`;
      const amt = h * r;
      totalAmt += amt;
      totalHrs += h;
      if (h > 0 || r > 0) rows.push({ label: `${n} (${h}h @ ${fmt(r)}/hr)`, value: fmt(amt) });
    }
    const blended = totalHrs > 0 ? totalAmt / totalHrs : 0;
    rows.push({ label: 'Total Hours', value: `${totalHrs.toFixed(2)} hrs`, strong: true });
    rows.push({ label: 'Blended Rate', value: `${fmtDec(blended, 0)}/hr` });
    setRes({ value: fmt(totalAmt), rows });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#E8C44A" strokeWidth="1.8" /><path d="M3 9h18M7 4v2M17 4v2M7 13h4M7 16h7" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg>}
      title="Billable Hours Invoice Calculator"
      desc="Compute total invoice value, blended rate, and net revenue for up to 4 timekeepers."
    >
      <form onSubmit={calc}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--cream2)' }}>
                <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600 }}>Timekeeper</th>
                <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600 }}>Hours</th>
                <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600 }}>Rate ($/hr)</th>
              </tr>
            </thead>
            <tbody>
              {placeholders.map((p, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 4px' }}><input type="text" name={`n${i}`} placeholder={p.n} className="bh-input" /></td>
                  <td style={{ padding: '6px 4px' }}><input type="number" name={`h${i}`} placeholder="0.0" min="0" step="0.25" className="bh-input" style={{ textAlign: 'center' }} /></td>
                  <td style={{ padding: '6px 4px' }}><input type="number" name={`r${i}`} placeholder={p.r} min="0" step="5" className="bh-input" style={{ textAlign: 'center' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="calc-btn" style={{ marginTop: 14 }} type="submit">Calculate Invoice</button>
      </form>
      <ResultBox res={res} label="Total Invoice" onReset={() => setRes(null)} />
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 3: STATUTE OF LIMITATIONS ══════════ */
const SOL_TYPES = [
  ['1', 'Personal Injury (1 year)'], ['2', 'Personal Injury (2 years)'], ['3', 'Personal Injury (3 years)'],
  ['2', 'Medical Malpractice (2 years)'], ['3', 'Medical Malpractice (3 years)'], ['4', 'Medical Malpractice (4 years)'],
  ['3', 'Contract Dispute – Written (3 years)'], ['4', 'Contract Dispute – Written (4 years)'],
  ['5', 'Contract Dispute – Written (5 years)'], ['6', 'Contract Dispute – Written (6 years)'],
  ['3', 'Contract Dispute – Oral (3 years)'], ['4', 'Contract Dispute – Oral (4 years)'],
  ['2', 'Fraud / Misrepresentation (2 years)'], ['3', 'Fraud / Misrepresentation (3 years)'], ['6', 'Fraud / Misrepresentation (6 years)'],
  ['2', 'Wrongful Death (2 years)'], ['3', 'Wrongful Death (3 years)'],
  ['1', 'Product Liability (1 year)'], ['2', 'Product Liability (2 years)'], ['3', 'Product Liability (3 years)'],
  ['4', 'Defamation / Libel (1 year)'], ['2', 'Defamation / Libel (2 years)'],
  ['4', 'Employment Discrimination (180 days)'], ['10', 'Custom: 10 years'],
];
function SolCalc() {
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const incidentDate = f.elements.date.value;
    const yearsStr = f.elements.type.value;
    const tollMonths = parseInt(f.elements.toll.value, 10) || 0;
    if (!incidentDate || !yearsStr) {
      setErr('Please select both an incident date and a case type.');
      return;
    }
    setErr('');
    const years = parseFloat(yearsStr);
    const deadline = new Date(incidentDate);
    deadline.setFullYear(deadline.getFullYear() + Math.floor(years));
    deadline.setDate(deadline.getDate() + Math.round((years % 1) * 365));
    deadline.setMonth(deadline.getMonth() + tollMonths);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadline - today) / 86400000);
    const diffMon = Math.round(diffDays / 30.44);

    let sub, borderColor;
    if (diffDays < 0) {
      sub = `⚠ DEADLINE HAS PASSED — ${Math.abs(diffDays)} days ago.`;
      borderColor = RED;
    } else if (diffDays <= 90) {
      sub = `⚠ URGENT: ${diffDays} days remaining (≈${diffMon} months). Act immediately.`;
      borderColor = RED;
    } else if (diffDays <= 180) {
      sub = `⚠ Approaching: ${diffDays} days remaining (≈${diffMon} months). File promptly.`;
      borderColor = '#e67e22';
    } else {
      sub = `${diffDays} days remaining (≈${diffMon} months).`;
      borderColor = GREEN;
    }
    setRes({
      value: deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      sub,
      borderColor,
    });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#E8C44A" strokeWidth="1.8" /><path d="M12 7v5l3.5 2" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="1" fill="#E8C44A" /></svg>}
      title="Statute of Limitations Calculator"
      desc="Calculate the filing deadline based on incident date, case type, and applicable limitations period."
    >
      <form onSubmit={calc}>
        <div className="calc-row">
          <label htmlFor="sol-date">Date of Incident / Discovery</label>
          <input type="date" id="sol-date" name="date" />
        </div>
        <div className="calc-row">
          <label htmlFor="sol-type">Case Type</label>
          <select id="sol-type" name="type" defaultValue="">
            <option value="">— Select case type —</option>
            {SOL_TYPES.map(([v, label], i) => <option value={v} key={i}>{label}</option>)}
          </select>
        </div>
        <div className="calc-row">
          <label htmlFor="sol-toll">Tolling Period (months, if any)</label>
          <input type="number" id="sol-toll" name="toll" placeholder="0" min="0" max="120" step="1" />
        </div>
        {err && <p style={{ fontSize: '.76rem', color: RED, fontWeight: 700, marginBottom: 8 }}>{err}</p>}
        <button className="calc-btn" type="submit">Calculate Deadline</button>
      </form>
      <ResultBox res={res} label="Filing Deadline" onReset={() => setRes(null)} />
      <p className="calc-warn">⚠ This is a general estimate. Always verify the applicable SOL with current state statutes. Jurisdictional rules and tolling vary significantly.</p>
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 4: SETTLEMENT ESTIMATOR ══════════ */
function SettlementCalc() {
  const [res, setRes] = useState(null);
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const med = numOf(f, 'med');
    const lost = numOf(f, 'lost');
    const prop = numOf(f, 'prop');
    const future = numOf(f, 'future');
    const mult = parseFloat(f.elements.severity.value) || 1.5;
    const fault = numOf(f, 'fault');

    const specials = med + lost + prop + future;
    const painSuff = (med + future) * mult;
    const gross = specials + painSuff;
    const faultFactor = 1 - fault / 100;
    const low = gross * faultFactor * 0.7;
    const mid = gross * faultFactor;
    const high = gross * faultFactor * 1.35;

    setRes({
      value: `${fmt(low)} – ${fmt(high)}`,
      rows: [
        { label: 'Special Damages (economic)', value: fmt(specials) },
        { label: `Pain & Suffering (${mult}× medical)`, value: fmt(painSuff) },
        { label: 'Gross Estimate', value: fmt(gross) },
        { label: `After ${fault}% Comparative Fault`, value: fmt(gross * faultFactor) },
        { label: 'Midpoint Estimate', value: fmt(mid), strong: true },
      ],
    });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><path d="M3 17l4-8 4 5 3-3 4 6" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 20h18" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /></svg>}
      title="Personal Injury Settlement Estimator"
      desc="Estimate a reasonable settlement range using the multiplier method and special damages."
    >
      <form onSubmit={calc}>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="si-med">Medical Bills ($)</label>
            <input type="number" id="si-med" name="med" placeholder="e.g. 45000" min="0" step="500" />
          </div>
          <div className="calc-row">
            <label htmlFor="si-lost">Lost Wages ($)</label>
            <input type="number" id="si-lost" name="lost" placeholder="e.g. 15000" min="0" step="500" />
          </div>
        </div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="si-prop">Property Damage ($)</label>
            <input type="number" id="si-prop" name="prop" placeholder="e.g. 8000" min="0" step="500" />
          </div>
          <div className="calc-row">
            <label htmlFor="si-future">Future Medical ($)</label>
            <input type="number" id="si-future" name="future" placeholder="e.g. 20000" min="0" step="500" />
          </div>
        </div>
        <div className="calc-row">
          <label htmlFor="si-severity">Injury Severity (Pain &amp; Suffering Multiplier)</label>
          <select id="si-severity" name="severity" defaultValue="1.5">
            <option value="1.5">Minor (1.5×) — bruises, minor soft tissue</option>
            <option value="2.5">Moderate (2.5×) — fractures, short recovery</option>
            <option value="4">Serious (4×) — surgery, 6–12 month recovery</option>
            <option value="5">Severe (5×) — permanent disability, major surgery</option>
            <option value="7">Catastrophic (7×) — life-altering, permanent injury</option>
          </select>
        </div>
        <div className="calc-row">
          <label htmlFor="si-fault">Client Comparative Fault (%)</label>
          <input type="number" id="si-fault" name="fault" placeholder="0" min="0" max="100" step="1" />
        </div>
        <button className="calc-btn" type="submit">Estimate Settlement</button>
      </form>
      <ResultBox res={res} label="Estimated Settlement Range" onReset={() => setRes(null)} />
      <p className="calc-warn">⚖ The multiplier method is a common estimation tool, not a guaranteed outcome. Case-specific facts, jurisdiction, and negotiation skill all affect actual settlements.</p>
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 5: RETAINER ══════════ */
function RetainerCalc() {
  const [res, setRes] = useState(null);
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const rate = numOf(f, 'rate');
    const hours = numOf(f, 'hours');
    const months = numOf(f, 'months') || 1;
    const initial = numOf(f, 'initial');

    const monthlyBurn = rate * hours;
    const totalEst = monthlyBurn * months;
    const recommended = monthlyBurn * 2; // 2-month cushion
    const shortage = Math.max(0, recommended - initial);
    const surplus = Math.max(0, initial - recommended);
    const depletion = initial > 0 && monthlyBurn > 0 ? (initial / monthlyBurn).toFixed(1) : '∞';

    setRes({
      value: fmt(recommended),
      rows: [
        { label: 'Monthly Billing Estimate', value: fmt(monthlyBurn) },
        { label: 'Total Matter Estimate', value: fmt(totalEst) },
        { label: 'Recommended Retainer (2-mo buffer)', value: fmt(recommended) },
        { label: 'Initial Retainer Paid', value: fmt(initial) },
        shortage > 0
          ? { label: 'Retainer Shortage', value: fmt(shortage), color: RED }
          : { label: 'Retainer Surplus', value: fmt(surplus), color: GREEN },
        { label: 'Estimated Depletion', value: `${depletion} months` },
      ],
    });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="#E8C44A" strokeWidth="1.8" /><path d="M3 10h18M7 6V4M17 6V4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" /><path d="M7 14h3M7 17h5" stroke="#E8C44A" strokeWidth="1.3" strokeLinecap="round" /></svg>}
      title="Retainer Fee Calculator"
      desc="Determine optimal retainer size, projected depletion date, and monthly replenishment needs."
    >
      <form onSubmit={calc}>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="ret-rate">Hourly Rate ($)</label>
            <input type="number" id="ret-rate" name="rate" placeholder="e.g. 350" min="0" step="10" />
          </div>
          <div className="calc-row">
            <label htmlFor="ret-hours">Estimated Monthly Hours</label>
            <input type="number" id="ret-hours" name="hours" placeholder="e.g. 10" min="0" step="0.5" />
          </div>
        </div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="ret-months">Matter Duration (months)</label>
            <input type="number" id="ret-months" name="months" placeholder="e.g. 6" min="1" max="120" step="1" />
          </div>
          <div className="calc-row">
            <label htmlFor="ret-initial">Initial Retainer Paid ($)</label>
            <input type="number" id="ret-initial" name="initial" placeholder="e.g. 5000" min="0" step="500" />
          </div>
        </div>
        <button className="calc-btn" type="submit">Calculate Retainer</button>
      </form>
      <ResultBox res={res} label="Recommended Retainer" onReset={() => setRes(null)} />
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 6: HOURLY vs FLAT FEE ══════════ */
function HourlyFlatCalc() {
  const [res, setRes] = useState(null);
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const rate = numOf(f, 'rate');
    const hours = numOf(f, 'hours');
    const flatFee = numOf(f, 'flat');
    const overhead = numOf(f, 'overhead');

    const hourlyRevenue = rate * hours;
    const flatNet = flatFee - overhead;
    const hourlyNet = hourlyRevenue - overhead;
    const flatEffective = hours > 0 ? flatNet / hours : 0;
    const diff = hourlyNet - flatNet;
    const winner = hourlyNet >= flatNet ? 'Hourly Billing' : 'Flat Fee';

    setRes({
      value: winner,
      rows: [
        { label: `Hourly Revenue (${hours}h @ ${fmt(rate)})`, value: fmt(hourlyRevenue) },
        { label: 'Hourly Net (after costs)', value: fmt(hourlyNet) },
        { label: 'Flat Fee Revenue', value: fmt(flatFee) },
        { label: 'Flat Fee Net (after costs)', value: fmt(flatNet) },
        { label: 'Flat Fee Effective Rate', value: `${fmt(flatEffective)}/hr` },
        {
          label: 'Advantage', value: `${winner} by ${fmt(Math.abs(diff))}`, strong: true,
          valueColor: hourlyNet >= flatNet ? GREEN : 'var(--brown)',
        },
      ],
    });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 16l4-5 3 3 5-7" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      title="Hourly vs Flat Fee Analyzer"
      desc="Compare profitability between hourly billing and flat-fee arrangements for a specific matter."
    >
      <form onSubmit={calc}>
        <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--brown)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Hourly Scenario</div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="hf-rate">Hourly Rate ($)</label>
            <input type="number" id="hf-rate" name="rate" placeholder="e.g. 350" min="0" step="10" />
          </div>
          <div className="calc-row">
            <label htmlFor="hf-hours">Actual Hours Worked</label>
            <input type="number" id="hf-hours" name="hours" placeholder="e.g. 22" min="0" step="0.25" />
          </div>
        </div>
        <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--brown)', margin: '8px 0', textTransform: 'uppercase', letterSpacing: '.06em' }}>Flat Fee Scenario</div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="hf-flat">Flat Fee Quoted ($)</label>
            <input type="number" id="hf-flat" name="flat" placeholder="e.g. 6000" min="0" step="250" />
          </div>
          <div className="calc-row">
            <label htmlFor="hf-overhead">Overhead/Costs ($)</label>
            <input type="number" id="hf-overhead" name="overhead" placeholder="e.g. 800" min="0" step="100" />
          </div>
        </div>
        <button className="calc-btn" type="submit">Compare Billing Models</button>
      </form>
      <ResultBox res={res} label="Better Option" onReset={() => setRes(null)} />
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 7: CASE ROI ══════════ */
function RoiCalc() {
  const [res, setRes] = useState(null);
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const fee = numOf(f, 'fee');
    const prob = numOf(f, 'prob');
    const hours = numOf(f, 'hours');
    const rate = numOf(f, 'rate');
    const costs = numOf(f, 'costs');

    const expectedRevenue = fee * (prob / 100);
    const timeInvestment = hours * rate;
    const totalInvestment = timeInvestment + costs;
    const netExpected = expectedRevenue - totalInvestment;
    const roi = totalInvestment > 0 ? (netExpected / totalInvestment) * 100 : 0;

    const verdict =
      roi >= 50 ? '✅ High ROI — Take the Case'
      : roi >= 15 ? '⚠ Moderate ROI — Consider Carefully'
      : roi >= 0 ? '⚠ Low ROI — Marginal Value'
      : '❌ Negative ROI — Reconsider';

    setRes({
      value: `${roi.toFixed(0)}% ROI`,
      valueColor: roi >= 50 ? GREEN : roi >= 0 ? 'var(--gold2)' : RED,
      rows: [
        { label: 'Expected Fee Revenue', value: fmt(fee) },
        { label: 'Win Probability Adjusted', value: fmt(expectedRevenue) },
        { label: `Time Investment (${hours}h)`, value: fmt(timeInvestment) },
        { label: 'Case Costs', value: fmt(costs) },
        { label: 'Net Expected Profit', value: fmt(netExpected), valueColor: netExpected >= 0 ? GREEN : RED },
        { label: 'Verdict', value: verdict, strong: true },
      ],
    });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.8 5.3.77-3.85 3.75.9 5.3L12 14.1l-4.75 2.52.9-5.3L4.3 7.57l5.3-.77L12 2z" stroke="#E8C44A" strokeWidth="1.7" strokeLinejoin="round" /></svg>}
      title="Case Return on Investment (ROI)"
      desc="Assess whether a case is worth taking by calculating net ROI against time investment and overhead."
    >
      <form onSubmit={calc}>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="roi-fee">Expected Attorney Fee ($)</label>
            <input type="number" id="roi-fee" name="fee" placeholder="e.g. 85000" min="0" step="1000" />
          </div>
          <div className="calc-row">
            <label htmlFor="roi-prob">Win Probability (%)</label>
            <input type="number" id="roi-prob" name="prob" placeholder="e.g. 70" min="0" max="100" step="1" />
          </div>
        </div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="roi-hours">Estimated Hours to Resolve</label>
            <input type="number" id="roi-hours" name="hours" placeholder="e.g. 120" min="0" step="5" />
          </div>
          <div className="calc-row">
            <label htmlFor="roi-rate">Your Effective Hourly Rate ($)</label>
            <input type="number" id="roi-rate" name="rate" placeholder="e.g. 350" min="0" step="10" />
          </div>
        </div>
        <div className="calc-row">
          <label htmlFor="roi-costs">Case Costs &amp; Disbursements ($)</label>
          <input type="number" id="roi-costs" name="costs" placeholder="e.g. 8000" min="0" step="500" />
        </div>
        <button className="calc-btn" type="submit">Calculate Case ROI</button>
      </form>
      <ResultBox res={res} label="Risk-Adjusted ROI" onReset={() => setRes(null)} />
    </ToolCard>
  );
}

/* ══════════ CALCULATOR 8: CLIENT LIFETIME VALUE ══════════ */
function ClvCalc() {
  const [res, setRes] = useState(null);
  function calc(e) {
    e.preventDefault();
    const f = e.target;
    const avgMatter = numOf(f, 'avg');
    const matters = numOf(f, 'matters') || 1;
    const retention = numOf(f, 'retention') || 50;
    const referrals = numOf(f, 'referrals');
    const acq = numOf(f, 'acq');
    const years = numOf(f, 'years') || 1;

    const directRevenue = avgMatter * matters * years * (retention / 100);
    const referralRevenue = referrals * avgMatter * matters;
    const totalCLV = directRevenue + referralRevenue;
    const netCLV = totalCLV - acq;
    const clvRatio = acq > 0 ? totalCLV / acq : 0;

    const rows = [
      { label: `Direct Revenue (over ${years}yr)`, value: fmt(directRevenue) },
      { label: `Referral Revenue (${referrals} referrals)`, value: fmt(referralRevenue) },
      { label: 'Acquisition Cost', value: fmt(acq) },
      { label: 'Net CLV', value: fmt(netCLV), strong: true },
    ];
    if (clvRatio > 0) {
      rows.push({ label: 'CLV:CAC Ratio', value: `${clvRatio.toFixed(1)}:1 ${clvRatio >= 3 ? '✅ Healthy' : '⚠ Low'}` });
    }
    setRes({ value: fmt(totalCLV), rows });
  }
  return (
    <ToolCard
      icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="#E8C44A" strokeWidth="1.8" /><path d="M2 21c0-3.87 3.13-7 7-7h6c3.87 0 7 3.13 7 7" stroke="#E8C44A" strokeWidth="1.8" strokeLinecap="round" /><path d="M19 5l1.5 1.5L23 4" stroke="#E8C44A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      title="Client Lifetime Value (CLV) Calculator"
      desc="Measure the long-term revenue value of each client, including referrals and repeat matters."
    >
      <form onSubmit={calc}>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="clv-avg">Avg Matter Revenue ($)</label>
            <input type="number" id="clv-avg" name="avg" placeholder="e.g. 12000" min="0" step="500" />
          </div>
          <div className="calc-row">
            <label htmlFor="clv-matters">Matters per Client (avg)</label>
            <input type="number" id="clv-matters" name="matters" placeholder="e.g. 2" min="0" step="0.1" />
          </div>
        </div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="clv-retention">Client Retention Rate (%)</label>
            <input type="number" id="clv-retention" name="retention" placeholder="e.g. 65" min="0" max="100" step="1" />
          </div>
          <div className="calc-row">
            <label htmlFor="clv-referrals">Avg Referrals per Client</label>
            <input type="number" id="clv-referrals" name="referrals" placeholder="e.g. 1.2" min="0" step="0.1" />
          </div>
        </div>
        <div className="calc-2col">
          <div className="calc-row">
            <label htmlFor="clv-acq">Client Acquisition Cost ($)</label>
            <input type="number" id="clv-acq" name="acq" placeholder="e.g. 1800" min="0" step="100" />
          </div>
          <div className="calc-row">
            <label htmlFor="clv-years">Client Lifespan (years)</label>
            <input type="number" id="clv-years" name="years" placeholder="e.g. 5" min="1" max="50" step="1" />
          </div>
        </div>
        <button className="calc-btn" type="submit">Calculate CLV</button>
      </form>
      <ResultBox res={res} label="Client Lifetime Value" onReset={() => setRes(null)} />
    </ToolCard>
  );
}

/* ══════════ SIGNUP GATE ══════════ */
const ROLES = [
  'Attorney / Lawyer', 'Partner', 'Managing Partner', 'Associate', 'Solo Practitioner', 'Paralegal',
  'Law Student', 'Legal Administrator', 'Law Firm Owner', 'Other Legal Professional', 'Other (Non-Legal) Professional',
];

function Gate({ onUnlock }) {
  const [errs, setErrs] = useState({});
  const loadTs = useRef(Date.now());

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function submit(e) {
    e.preventDefault();
    const f = e.target;
    const val = n => (f.elements[n]?.value || '').trim();
    const firstName = val('firstName');
    const lastName = val('lastName');
    const email = val('email');
    const role = val('role');
    // Honeypot + too-fast guard
    if (val('dl_hp') || Date.now() - loadTs.current < 2000) return;

    const next = {};
    if (!firstName) next.firstName = true;
    if (!lastName) next.lastName = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = true;
    if (!role) next.role = true;
    setErrs(next);
    if (Object.keys(next).length) return;

    try { localStorage.setItem(GATE_KEY, JSON.stringify({ firstName, lastName, email, role, ts: Date.now() })); } catch {}
    setCookie(GATE_COOKIE, '1', 365);

    try {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ tab: 'Legal Tools Gate', 'First Name': firstName, 'Last Name': lastName, 'Email': email, 'Role': role }),
      }).catch(() => {});
    } catch {}
    try {
      const kp = new URLSearchParams();
      kp.append('email_address', email);
      kp.append('fields[first_name]', firstName);
      kp.append('fields[last_name]', lastName || '');
      kp.append('fields[role]', role || '');
      kp.append('fields[source]', 'legal_tools');
      kp.append('fields[page_url]', window.location.href);
      fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: kp.toString(),
      }).catch(() => {});
    } catch {}

    onUnlock();
  }

  return (
    <div className="gate-overlay">
      <div className="gate-box" role="dialog" aria-modal="true" aria-labelledby="gateTitle">
        <button className="gate-close" onClick={() => { window.location.href = '/'; }} aria-label="Close">✕</button>
        <div className="gate-badge">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="10.4" y="2" width="3.2" height="18" fill="#E8C44A" rx="1.6" />
            <rect x="4" y="19" width="16" height="3" fill="#E8C44A" rx="1.5" />
            <rect x="0" y="7" width="24" height="2.2" fill="#C49A0A" rx="1.1" />
            <path d="M1 11 Q4 16 7 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="rgba(255,255,255,.1)" />
            <path d="M17 11 Q20 16 23 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="rgba(255,255,255,.1)" />
            <circle cx="12" cy="2.5" r="2.5" fill="#fff" />
          </svg>
        </div>
        <div className="gate-eyebrow">Free Access — Legal Professionals Only</div>
        <h2 id="gateTitle">Unlock Your Free<br />Legal Toolkit</h2>
        <p>
          Get instant, free access to 8 specialized legal calculators — contingency fees, statute of
          limitations, settlement estimates, and more. Built for attorneys by attorneys.
        </p>
        <form onSubmit={submit} noValidate>
          <div className="dl-hp" aria-hidden="true">
            <input type="text" name="dl_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
            <div className="gate-field">
              <label htmlFor="gFirstName">First Name <span style={{ color: RED }}>*</span></label>
              <input type="text" id="gFirstName" name="firstName" placeholder="e.g. Sarah" autoComplete="given-name" />
              <span className={`gate-err${errs.firstName ? ' on' : ''}`}>Required.</span>
            </div>
            <div className="gate-field">
              <label htmlFor="gLastName">Last Name <span style={{ color: RED }}>*</span></label>
              <input type="text" id="gLastName" name="lastName" placeholder="e.g. Mitchell" autoComplete="family-name" />
              <span className={`gate-err${errs.lastName ? ' on' : ''}`}>Required.</span>
            </div>
          </div>
          <div className="gate-field">
            <label htmlFor="gEmail">Email Address <span style={{ color: RED }}>*</span></label>
            <input type="email" id="gEmail" name="email" placeholder="you@yourfirm.com" autoComplete="email" />
            <span className={`gate-err${errs.email ? ' on' : ''}`}>Please enter a valid email address.</span>
          </div>
          <div className="gate-field">
            <label htmlFor="gRole">Your Role <span style={{ color: RED }}>*</span></label>
            <select id="gRole" name="role" defaultValue="">
              <option value="">— Select your role —</option>
              {ROLES.map(r => <option value={r} key={r}>{r}</option>)}
            </select>
            <span className={`gate-err${errs.role ? ' on' : ''}`}>Please select your role.</span>
          </div>
          <button type="submit" className="gate-submit">Get Free Access → Unlock All 8 Tools</button>
        </form>
        <p className="gate-note">🔒 We respect your privacy. No spam, no selling your data. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}

/* ══════════ PAGE CLIENT ROOT ══════════ */
export default function ToolsClient() {
  const [unlocked, setUnlocked] = useState(true); // assume unlocked until checked (no flash on repeat visits)
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    let submitted = false;
    try { if (localStorage.getItem(GATE_KEY)) submitted = true; } catch {}
    if (!submitted && getCookie(GATE_COOKIE)) submitted = true;
    if (!submitted) {
      setUnlocked(false);
      const t = setTimeout(() => setShowGate(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      {!unlocked && showGate && <Gate onUnlock={() => { setUnlocked(true); setShowGate(false); }} />}
      <div className="tools-grid" id="toolsGrid">
        <ContingencyCalc />
        <BillableCalc />
        <SolCalc />
        <SettlementCalc />
        <RetainerCalc />
        <HourlyFlatCalc />
        <RoiCalc />
        <ClvCalc />
      </div>
    </>
  );
}
