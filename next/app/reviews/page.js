import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
  title: 'Law Firm Marketing Reviews & Success Stories',
  description:
    'Verified success stories from law firms and attorney guests of the Dominate Law Podcast. Reviews covering SEO rankings, consultation growth, and law firm marketing results.',
  alternates: { canonical: '/reviews' },
};

const SHEET_ID = '1Kqtgrii6peL3DxEp7PO45zSYd3sSeTN-e1tHmkFdLpg';

// Fetches the 'reviews' tab of the Google Sheet server-side (ISR-cached).
// Columns: reviewer_name, firm_name, rating, review_text, platform, photo_url
async function getReviews() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=reviews`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const text = await res.text();
    const json = JSON.parse(text.replace(/^[^{]+\(/, '').replace(/\);?\s*$/, ''));
    const cols = json.table.cols.map(c => (c.label || '').trim().toLowerCase().replace(/\s+/g, '_'));
    return json.table.rows
      .map(row => {
        const obj = {};
        cols.forEach((label, i) => {
          if (!label) return;
          const cell = row.c && row.c[i];
          obj[label] = cell && cell.v != null ? String(cell.v) : '';
        });
        return obj;
      })
      .filter(r => r.review_text && r.review_text.trim());
  } catch {
    return [];
  }
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'DL';
}

function stars(n) {
  return '★'.repeat(Math.min(5, parseInt(n, 10) || 5));
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <main>
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › Reviews
          </nav>
          <span className="label">Guest Reviews</span>
          <h1>What Our Guests Say About the Dominate Law Podcast</h1>
          <p style={{ fontSize: '.96rem', color: 'rgba(255,255,255,.6)', maxWidth: 600, lineHeight: 1.75 }}>
            Hear from the attorneys and legal professionals who have appeared on the Dominate Law Podcast — in
            their own words.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: 'var(--brown)', padding: '40px 0' }} aria-label="Overall rating">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 24,
              textAlign: 'center',
            }}
          >
            {[
              ['5★', 'Average guest rating'],
              ['20', 'Episodes published'],
              ['12+', 'Attorney guest reviews'],
              ['100%', 'Free to listen & subscribe'],
            ].map(([n, l]) => (
              <div key={l}>
                <span style={{ fontFamily: 'var(--font-serif),Georgia,serif', fontSize: '2rem', fontWeight: 900, color: 'var(--gold3)', display: 'block', lineHeight: 1 }}>
                  {n}
                </span>
                <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.5)', marginTop: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="section" aria-labelledby="reviews-heading">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Guest Reviews</span>
            <h2 id="reviews-heading" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, margin: '8px 0 14px' }}>
              What Our Guests Say About Us
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Hear directly from the attorneys and legal professionals who have been guests on the Dominate Law
              Podcast.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              Reviews are loading — please check back shortly.
            </div>
          ) : (
            <div className="grid-3">
              {reviews.map((r, i) => (
                <article
                  key={`${r.reviewer_name}-${i}`}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 28,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ color: 'var(--gold)', fontSize: '1rem', letterSpacing: 2 }}>{stars(r.rating)}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{r.platform || 'Dominate Law'}</div>
                  </div>
                  <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.75, fontStyle: 'italic', flexGrow: 1 }}>
                    &ldquo;{r.review_text}&rdquo;
                  </p>
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {r.photo_url ? (
                      <img
                        src={r.photo_url}
                        alt={r.reviewer_name}
                        loading="lazy"
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'var(--brown)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '.8rem',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {initials(r.reviewer_name)}
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--warm)', display: 'block' }}>
                        {r.reviewer_name}
                      </span>
                      <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{r.firm_name}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark" style={{ padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 16 }}>
            Want to Be a Guest on the Dominate Law Podcast?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 560, margin: '0 auto 32px', fontSize: '.95rem', lineHeight: 1.75 }}>
            Join attorneys like Mitch Jackson, Gary Bennett, and Kelly Chang Rickert who have shared their
            stories and insights on the show. Apply to be a guest today.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/guest-speaker" className="btn btn-gold" style={{ padding: '16px 36px', fontSize: '1rem' }}>
              Apply to Be a Guest →
            </Link>
            <Link href="/podcast" className="btn btn-outline-w" style={{ padding: '16px 36px', fontSize: '1rem' }}>
              Listen to Episodes
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
