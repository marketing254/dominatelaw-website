'use client';
import { useState } from 'react';

// SEO-safe tabs: every panel is server-rendered into the HTML (crawlers read
// all of them) — this component only toggles visibility client-side.
// `tabs`: [{ label, meta? }] — panels are children in matching order.
export default function ContentTabs({ tabs, children }) {
  const [active, setActive] = useState(0);
  const panels = Array.isArray(children) ? children : [children];

  return (
    <div>
      <div role="tablist" aria-label="Episode content" style={{
        display: 'flex', gap: 4, borderBottom: '2px solid var(--cream2)', marginBottom: 26,
      }}>
        {tabs.map((t, i) => {
          const isActive = i === active;
          return (
            <button
              key={t.label}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px 14px',
                fontSize: '.88rem', fontWeight: 700,
                fontFamily: 'var(--font-serif), Georgia, serif',
                color: isActive ? 'var(--brown3)' : 'var(--muted)',
                background: 'none', border: 'none', cursor: 'pointer',
                position: 'relative', marginBottom: -2,
                borderBottom: `2.5px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                transition: 'color .2s, border-color .2s',
              }}
            >
              {t.label}
              {t.meta && (
                <span style={{
                  fontSize: '.66rem', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif',
                  color: isActive ? 'var(--gold2)' : '#b3a396',
                  background: isActive ? 'rgba(196,154,10,.1)' : 'var(--cream)',
                  padding: '3px 9px', borderRadius: 100,
                }}>
                  {t.meta}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {panels.map((panel, i) => (
        <div key={i} role="tabpanel" hidden={i !== active}>
          {panel}
        </div>
      ))}
    </div>
  );
}
