import { driveId } from '@/lib/sheets';

// Server-rendered transcript panel (lives inside the Key Notes / Transcript
// tabs). Full text ships in the HTML — search engines and AI crawlers index
// every word; the legacy site loaded this client-side and crawlers saw nothing.
const SPEAKER_COLORS = {
  1: '#60270F', 2: '#9E7C08', 3: '#1F5F5B', 4: '#7A3515', 5: '#4A5568', 6: '#8B3A62',
};

export default function Transcript({ parsed, transcriptUrl }) {
  if (!parsed || !parsed.entries?.length) return null;
  const { entries, wordCount } = parsed;
  const dlId = driveId(transcriptUrl);

  return (
    <div>
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '.76rem', color: 'var(--muted)', fontWeight: 500 }}>
          ~{wordCount.toLocaleString()} words
        </span>
        {dlId && (
          <a
            href={`https://drive.google.com/uc?export=download&id=${dlId}`}
            target="_blank" rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '.74rem', fontWeight: 700, color: 'var(--brown)',
              border: '1.5px solid var(--border)', borderRadius: 8,
              padding: '7px 14px', background: '#fff',
            }}
          >
            ⇩ Download
          </a>
        )}
      </div>

      {/* Transcript body */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 12,
        maxHeight: 620, overflowY: 'auto', padding: '24px 26px', background: 'var(--cream)',
      }}>
        {entries.map((e, i) => (
          <div key={i} style={{ marginBottom: 15 }}>
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
                {e.time && (
                  <span style={{
                    fontSize: '.66rem', fontWeight: 700, color: 'var(--gold2)',
                    background: 'rgba(196,154,10,.09)', border: '1px solid rgba(196,154,10,.22)',
                    padding: '2px 9px', borderRadius: 100, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {e.time}
                  </span>
                )}
              </div>
            ) : null}
            <p style={{ fontSize: '.88rem', lineHeight: 1.75, color: 'var(--warm)', margin: 0 }}>{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
