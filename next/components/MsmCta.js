import Link from 'next/link';

// Marketing Strategy Session CTA — appears on every individual content page.
export default function MsmCta({ context = 'this episode' }) {
  return (
    <div className="msm-cta">
      <div>
        <h3>Want help growing your law firm?</h3>
        <p>
          Get a website analysis and a 30-minute marketing strategy session with our team —
          the same insights discussed in {context}, applied to your firm.
        </p>
      </div>
      <Link href="/msm" className="btn btn-gold">Book a Marketing Strategy Session →</Link>
    </div>
  );
}
