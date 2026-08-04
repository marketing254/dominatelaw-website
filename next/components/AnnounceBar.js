import Link from 'next/link';

// Legacy announcement bar — matches the markup js/sheets.js injected on the
// old site once the latest episode loaded.
export default function AnnounceBar({ latest }) {
  if (!latest) return null;
  return (
    <div
      className="announce"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 16px' }}
    >
      <span className="a-pulse" />
      <strong style={{ color: 'var(--gold3)' }}>NEW:</strong>
      <span style={{ color: 'rgba(255,255,255,.85)', maxWidth: 340, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        Ep #{latest.episode}: {latest.title}
      </span>
      <span style={{ color: 'rgba(255,255,255,.3)' }}>·</span>
      <Link
        href={`/podcast-episode/${latest.slug}`}
        style={{ color: 'var(--gold3)', textDecoration: 'underline', fontWeight: 700, whiteSpace: 'nowrap' }}
      >
        Listen Now →
      </Link>
    </div>
  );
}
