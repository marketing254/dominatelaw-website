'use client';
import { useRef, useState } from 'react';

// SEO-friendly pagination: every card is server-rendered into the HTML
// (crawlers see all of them); this component only toggles visibility.
// Children must carry a data-pg="N" attribute (1-based page number).
export default function PaginatedGrid({ totalPages, gridClass = 'grid-3', children }) {
  const [page, setPage] = useState(1);
  const wrapRef = useRef(null);

  if (totalPages <= 1) {
    return <div className={gridClass}>{children}</div>;
  }

  const go = p => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    if (wrapRef.current) wrapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={wrapRef} style={{ scrollMarginTop: 110 }}>
      {/* Only hide non-active pages — active items keep their own display value */}
      <style>{`.dl-pgw [data-pg]:not([data-pg="${page}"]){display:none}`}</style>
      <div className={`${gridClass} dl-pgw`}>{children}</div>

      <nav aria-label="Pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 44 }}>
        <button type="button" onClick={() => go(page - 1)} disabled={page === 1} style={pagerBtn(false, page === 1)} aria-label="Previous page">
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" onClick={() => go(n)} style={pagerBtn(n === page, false)} aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined}>
            {n}
          </button>
        ))}
        <button type="button" onClick={() => go(page + 1)} disabled={page === totalPages} style={pagerBtn(false, page === totalPages)} aria-label="Next page">
          Next →
        </button>
      </nav>
    </div>
  );
}

function pagerBtn(active, disabled) {
  return {
    minWidth: 40, padding: '9px 14px', borderRadius: 8,
    fontSize: '.82rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    border: `1.5px solid ${active ? 'var(--brown)' : 'var(--border)'}`,
    background: active ? 'var(--brown)' : '#fff',
    color: active ? '#fff' : disabled ? '#c9b8ab' : 'var(--brown)',
    transition: 'all .2s',
    opacity: disabled ? 0.6 : 1,
  };
}
