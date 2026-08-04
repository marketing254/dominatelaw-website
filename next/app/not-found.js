import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section" style={{ textAlign: 'center', padding: '120px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="btn btn-primary">Back to Home</Link>
    </main>
  );
}
