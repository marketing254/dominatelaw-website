import { driveId } from '@/lib/sheets';

// Server-rendered transcript — collapsible <details>, zero client JS.
// The full text ships in the HTML, so search engines and AI crawlers index
// every word (the legacy site loaded this client-side and crawlers saw nothing).
const SPEAKER_COLORS = {
  1: '#60270F', 2: '#9E7C08', 3: '#1F5F5B', 4: '#7A3515', 5: '#4A5568', 6: '#8B3A62',
};

export default function Transcript({ parsed, transcriptUrl }) {
  if (!parsed || !parsed.entries?.length) return null;
  const { entries, wordCount, readMins } = parsed;
  const dlId = driveId(transcriptUrl);

  return (
    <details className="dl-transcript" style={{ marginTop: 38 }}>
      <summary style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
        cursor: 'pointer', listStyle: 'none',
        padding: '16px 20px', background: 'var(--cream)',
        border: '1.5px solid var(--border)', borderRadius: 12,
        userSelect: 'none',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.05rem' }}>📄</span>
          <span style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 900, fontSize: '1.05rem', color: 'var(--brown3)' }}>
            Full Transcript
          </span>
          <span style={{ fontSize: '.74rem', color: 'var(--muted)', fontWeight: 500 }}>
            ~{wordCount.toLocaleString()} words · {readMins} min read
          </span>
        </span>
        <span className="dl-ts-chev" style={{ fontSize: '.8rem', color: 'var(--brown)', fontWeight: 700, flexShrink: 0 }}>
          Read ▾
        </span>
      </summary>

      <div style={{
        marginTop: 14, border: '1px solid var(--border)', borderRadius: 12,
        maxHeight: 560, overflowY: 'auto', padding: '22px 24px', background: '#fff',
      }}>
        {dlId && (
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <a
              href={`https://drive.google.com/uc?export=download&id=${dlId}`}
              target="_blank" rel="noopener"
              style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--brown)', textDecoration: 'underline' }}
            >
              ⇩ Download transcript
            </a>
          </div>
        )}
        {entries.map((e, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {(e.showSpeaker && e.label) || e.time ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 3 }}>
                {e.showSpeaker && e.label && (
                  <span style={{
                    fontSize: '.72rem', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase',
                    color: SPEAKER_COLORS[e.colorIdx] || 'var(--brown)',
                  }}>
                    {e.label}
                  </span>
                )}
                {e.time && <span style={{ fontSize: '.68rem', color: '#b3a396', fontVariantNumeric: 'tabular-nums' }}>{e.time}</span>}
              </div>
            ) : null}
            <p style={{ fontSize: '.88rem', lineHeight: 1.75, color: 'var(--warm)', margin: 0 }}>{e.text}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
