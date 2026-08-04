import ToolsClient from './ToolsClient';

export const metadata = {
  title: 'Free Legal Calculators & Tools for Attorneys',
  description:
    'Free legal calculators for attorneys: contingency fees, billable hours, statute of limitations deadlines, settlement estimates, retainers, case ROI, and client lifetime value.',
  keywords:
    'legal calculators, contingency fee calculator, statute of limitations calculator, settlement calculator, attorney tools, law firm calculators',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Free Legal Calculators & Niche Tools for Attorneys | Dominate Law',
    description:
      'Precision-built calculators designed for how attorneys actually work — contingency fees, statute of limitations, settlement estimates, retainers, case ROI, and CLV.',
    url: '/tools',
  },
};

const TOOLS_CSS = `
.tools-hero{background:linear-gradient(135deg,var(--brown3) 0%,#1d0600 100%);padding:72px 0 64px;position:relative;overflow:hidden}
.tools-hero-inner{max-width:760px}
.tools-hero .lbl-w{display:inline-block;font-size:.68rem;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--gold3);margin-bottom:14px}
.tools-hero h1{font-family:var(--font-serif),Georgia,serif;font-size:clamp(1.9rem,4vw,3rem);font-weight:900;color:#fff;line-height:1.2;margin-bottom:16px}
.tools-hero h1 em{color:var(--gold3);font-style:normal}
.tools-hero p{font-size:.96rem;color:rgba(255,255,255,.6);max-width:600px;line-height:1.75}
.tools-hero-badges{display:flex;gap:14px;flex-wrap:wrap;margin-top:26px}
.tools-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(232,196,74,.3);border-radius:100px;padding:8px 16px;font-size:.78rem;font-weight:600;color:rgba(255,255,255,.85)}
.tools-hero-badge svg{width:15px;height:15px;flex-shrink:0}
.tools-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:28px;align-items:start}
@media(max-width:900px){.tools-grid{grid-template-columns:1fr}}
.tool-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:box-shadow .25s,transform .25s}
.tool-card:hover{box-shadow:0 12px 40px rgba(58,13,0,.1)}
.tool-card-header{display:flex;gap:16px;align-items:flex-start;padding:24px 26px 18px;background:var(--brown3)}
.tool-icon{width:44px;height:44px;border-radius:10px;background:rgba(232,196,74,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tool-icon svg{width:24px;height:24px}
.tool-card-title{font-family:var(--font-serif),Georgia,serif;font-size:1.02rem;font-weight:900;color:#fff;line-height:1.3;margin-bottom:4px}
.tool-card-desc{font-size:.78rem;color:rgba(255,255,255,.55);line-height:1.55}
.tool-card-body{padding:22px 26px 26px}
.calc-row{margin-bottom:12px}
.calc-row label{display:block;font-size:.75rem;font-weight:600;color:var(--warm);margin-bottom:5px}
.calc-row input,.calc-row select{width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:.86rem;color:var(--warm);background:var(--cream);outline:none;transition:border-color .2s,box-shadow .2s}
.calc-row input:focus,.calc-row select:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(96,39,15,.07);background:#fff}
.calc-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:480px){.calc-2col{grid-template-columns:1fr}}
.calc-btn{width:100%;padding:12px;background:var(--brown);color:#fff;border:none;border-radius:8px;font-weight:700;font-size:.88rem;cursor:pointer;transition:background .2s,box-shadow .2s;margin-top:4px}
.calc-btn:hover{background:var(--brown3);box-shadow:0 8px 24px rgba(58,13,0,.2)}
.calc-result{display:none;margin-top:16px;background:var(--cream);border-left:4px solid var(--gold);border-radius:8px;padding:16px 18px}
.calc-result.show{display:block}
.calc-result-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
.calc-result-val{font-family:var(--font-serif),Georgia,serif;font-size:1.6rem;font-weight:900;color:var(--brown3);line-height:1.2;margin-bottom:10px}
.calc-result-sub{font-size:.8rem;font-weight:600;color:var(--warm);margin-bottom:8px}
.calc-result-breakdown{border-top:1px solid var(--border);padding-top:10px}
.calc-result-row{display:flex;justify-content:space-between;gap:12px;font-size:.79rem;color:var(--muted);padding:3px 0}
.calc-reset{display:inline-block;margin-top:10px;font-size:.74rem;font-weight:700;color:var(--brown);cursor:pointer;text-decoration:underline}
.calc-warn{font-size:.7rem;color:var(--muted);line-height:1.6;margin-top:12px}
.bh-input{width:100%;padding:8px;border:1.5px solid var(--border);border-radius:4px;font-size:.8rem;background:var(--cream);outline:none}
.gate-overlay{position:fixed;inset:0;background:rgba(8,2,0,.78);backdrop-filter:blur(6px);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
.gate-box{background:#fff;border-radius:20px;width:100%;max-width:520px;padding:40px 38px 30px;position:relative;box-shadow:0 40px 100px rgba(0,0,0,.4);margin:auto}
.gate-badge{width:56px;height:56px;border-radius:14px;background:var(--brown3);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.gate-badge svg{width:30px;height:30px}
.gate-eyebrow{font-size:.66rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold2);margin-bottom:8px}
.gate-box h2{font-family:var(--font-serif),Georgia,serif;font-size:1.5rem;font-weight:900;color:var(--brown3);line-height:1.25;margin-bottom:10px}
.gate-box>p{font-size:.85rem;color:var(--muted);line-height:1.65;margin-bottom:20px}
.gate-field{margin-bottom:14px}
.gate-field label{display:block;font-size:.76rem;font-weight:700;color:var(--warm);margin-bottom:5px}
.gate-field input,.gate-field select{width:100%;padding:11px 13px;border:1.5px solid var(--border);border-radius:8px;font-size:.88rem;color:var(--warm);outline:none;transition:border-color .2s;background:#fff}
.gate-field input:focus,.gate-field select:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(96,39,15,.08)}
.gate-err{display:none;font-size:.7rem;color:#c0392b;font-weight:700;margin-top:4px}
.gate-err.on{display:block}
.gate-submit{width:100%;padding:13px;background:var(--brown);color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:800;cursor:pointer;transition:background .2s;margin-top:6px}
.gate-submit:hover{background:var(--brown3)}
.gate-note{font-size:.7rem;color:var(--muted);text-align:center;margin-top:14px}
.gate-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;background:rgba(96,39,15,.1);border:2px solid rgba(96,39,15,.15);cursor:pointer;font-size:1.1rem;font-weight:700;color:var(--brown);display:flex;align-items:center;justify-content:center;transition:all .2s}
.gate-close:hover{background:rgba(96,39,15,.2);border-color:rgba(96,39,15,.3)}
.dl-hp{position:absolute;left:-9999px;top:-9999px;opacity:0;height:0;overflow:hidden;pointer-events:none}
`;

export default function ToolsPage() {
  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: TOOLS_CSS }} />

      <section className="tools-hero">
        <div className="wrap">
          <div className="tools-hero-inner">
            <span className="lbl-w">Free for Legal Professionals</span>
            <h1>Legal Calculators &amp;<br /><em>Niche Tools</em></h1>
            <p>
              Precision-built calculators designed for how attorneys actually work — from contingency fees and
              statute of limitations to settlement estimates and client lifetime value.
            </p>
            <div className="tools-hero-badges">
              <div className="tools-hero-badge">
                <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="#E8C44A" strokeWidth="1.5" /><line x1="4" y1="6" x2="12" y2="6" stroke="#E8C44A" strokeWidth="1.2" /><line x1="4" y1="9" x2="9" y2="9" stroke="#E8C44A" strokeWidth="1.2" /></svg>
                8 Calculators
              </div>
              <div className="tools-hero-badge">
                <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8C44A" strokeWidth="1.5" /><path d="M8 5v3.5l2 1.5" stroke="#E8C44A" strokeWidth="1.3" strokeLinecap="round" /></svg>
                Instant Results
              </div>
              <div className="tools-hero-badge">
                <svg viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="#E8C44A" strokeWidth="1.5" /><path d="M6 5h4M6 8h4M6 11h2" stroke="#E8C44A" strokeWidth="1.2" strokeLinecap="round" /></svg>
                100% Free
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Attorney Toolbox</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 14 }}>
              Smart Tools That<br />Work as Hard as You Do
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Stop guessing. These calculators give you instant, accurate figures so you can make smarter
              decisions for your clients and your practice.
            </p>
          </div>

          <ToolsClient />
        </div>
      </section>
    </main>
  );
}
