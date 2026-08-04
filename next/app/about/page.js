import Link from 'next/link';

export const metadata = {
  title: 'About Us',
  description:
    'Dominate Law is built by Ekwa Marketing — digital marketing specialists for law firms. Meet Naren Arulrajah and the team behind the podcast and platform helping attorneys grow.',
  alternates: { canonical: '/about' },
};

const narenSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Naren Arulrajah',
  jobTitle: 'CEO, Ekwa Marketing',
  worksFor: {
    '@type': 'Organization',
    name: 'Dominate Law',
    url: 'https://www.dominatelaw.com',
  },
  description:
    'Pioneer in Digital Marketing helping law firms across North America grow through smart, data-driven marketing strategies. Host and Founder of the Dominate Law Podcast.',
  image: 'https://www.dominatelaw.com/images/naren.jpg',
  sameAs: ['https://www.linkedin.com/company/dominatelaw/'],
};

const LinkedInIcon = ({ fill = '#0A66C2' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={fill} aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const team = [
  {
    name: 'Lester',
    role: 'Assistant Marketing Manager',
    img: '/images/Lester.jpg',
    alt: 'Lester',
    linkedin: 'https://lk.linkedin.com/in/lester-de-alwis',
    imgPosition: 'center top',
    bio: 'Lester believes real growth takes patience — like the Chinese bamboo tree that builds deep roots before it flourishes. As an advisor and consultant, he has driven growth across Ekwa Marketing, Thriving Dentist, Business of Aesthetics, and Dominate Law through strategic partnerships, event management, and high-impact marketing. At Dominate Law, he brings that same people-first philosophy to law firm owners — giving attorneys the tools, clarity, and confidence to lead.',
  },
  {
    name: 'Ashani',
    role: 'Content & Community Lead',
    img: '/images/Ashani.jpg',
    alt: 'Ashani',
    linkedin: 'https://www.linkedin.com/in/ashani-hanks-751ba82aa/',
    imgPosition: 'center center',
    bio: "Ashani is the Content & Community Lead at Dominate Law — the voice behind the platform. From podcast writeups and content planning to community initiatives, she shapes how Dominate Law connects with legal professionals. With a sharp eye for storytelling, she knows the best content doesn't just inform — it builds trust. Driven by a passion for law and media, Ashani makes complex legal topics accessible, relevant, and worth reading.",
  },
  {
    name: 'Don Adeesha Achalanka',
    role: 'Host & Moderator',
    img: '/images/Adeesha.jpg',
    alt: 'Don Adeesha Achalanka',
    linkedin: 'https://www.linkedin.com/in/adeesha-achalanka/',
    imgPosition: 'center top',
    bio: 'Don Adeesha Achalanka is a host and moderator known for leading thoughtful, high-value conversations across podcasts, panels, webinars, and virtual summits. He currently represents multiple professional media brands, helping leaders in dentistry, aesthetics, veterinary medicine, insurance, and law share their expertise in a way that feels clear, engaging, and credible. With experience in broadcasting, live events, and marketing strategy, Don brings a polished on-camera presence and a strong understanding of how to create conversations that build audience trust and brand authority.',
  },
  {
    name: 'Reshani Tamasha',
    role: 'Partnership Consultant',
    img: '/images/reshani.jpg',
    alt: 'Reshani Tamasha',
    linkedin: 'https://www.linkedin.com/in/reshani-tamasha-0a7a66171/',
    imgPosition: 'center top',
    bio: 'Reshani Tamasha is the Partnership Consultant at Dominate Law, driving strategic collaborations that connect law firm owners with the experts, innovators, and organizations shaping the legal industry. An internationally certified corporate trainer and speaker, she brings a refined, results-driven approach to partnership development — focused on long-term impact, scalability, and growth. Beyond Dominate Law, she is a founder and co-founder of several companies and an emerging voice on leadership, personal branding, and professional development.',
  },
];

function TeamCard({ member, reverse }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: reverse ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 240,
          background: 'linear-gradient(160deg,var(--cream2) 0%,#e8ddd4 100%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '32px 24px 0',
          overflow: 'hidden',
        }}
      >
        <img
          src={member.img}
          alt={member.alt}
          loading="lazy"
          style={{
            width: 200,
            height: 260,
            objectFit: 'cover',
            objectPosition: member.imgPosition,
            borderRadius: '12px 12px 0 0',
            display: 'block',
          }}
        />
      </div>
      <div
        style={{
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: '1 1 320px',
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: '.62rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--gold2)',
            display: 'block',
            marginBottom: 8,
          }}
        >
          {member.role}
        </span>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown)', margin: '0 0 4px' }}>
          {member.name}
        </h3>
        <div style={{ width: 36, height: 3, background: 'var(--gold)', borderRadius: 2, marginBottom: 18 }} />
        <p style={{ fontSize: '.87rem', color: 'var(--warm)', lineHeight: 1.85, margin: '0 0 24px' }}>
          {member.bio}
        </p>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontSize: '.78rem',
            fontWeight: 600,
            color: 'var(--brown)',
            border: '1.5px solid var(--border)',
            padding: '9px 18px',
            borderRadius: 8,
            width: 'fit-content',
            background: '#fff',
          }}
        >
          <LinkedInIcon />
          LinkedIn
        </a>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(narenSchema) }}
      />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › About Us
          </nav>
          <span className="label">About Dominate Law</span>
          <h1>The Team Behind Dominate Law</h1>
          <p style={{ fontSize: '.96rem', color: 'rgba(255,255,255,.6)', maxWidth: 600, lineHeight: 1.75 }}>
            Curious Attorney Minds — a platform where outstanding leaders in the legal field share their
            journeys, insights, and wisdom.
          </p>
        </div>
      </section>

      {/* About + Naren feature */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 72 }}>
            <div>
              <span className="label">About Dominate Law</span>
              <div style={{ width: 48, height: 3, background: 'var(--gold)', borderRadius: 2, margin: '8px 0 20px' }} />
              <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 16 }}>
                A Unique Platform for Outstanding Legal Leaders
              </h2>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78, marginBottom: 12 }}>
                Dominate Law is a unique platform that brings together outstanding leaders in the legal field
                whose final goal is not just achievement, but fulfillment.
              </p>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78, marginBottom: 12 }}>
                This platform provides an opportunity to thousands of new and aspiring lawyers who can learn
                from the shared experiences, insights and wisdom of the leaders in the field and contribute to
                overall growth of the legal profession.
              </p>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.78 }}>
                Dominate Law invites you to be a part of this inspiring process of mutual growth and happiness
                – both as a podcaster and as a listener.
              </p>
              <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/guest-speaker" className="btn btn-primary">Be a Guest →</Link>
                <Link href="/podcast" className="btn btn-secondary">Listen to Podcast</Link>
              </div>
            </div>

            {/* Naren card */}
            <div style={{ background: 'var(--brown3)', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg,var(--gold),var(--gold3))' }} />
              <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div
                  style={{
                    width: 160,
                    height: 200,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '3px solid rgba(196,154,10,.4)',
                    marginBottom: 24,
                    flexShrink: 0,
                    boxShadow: '0 16px 40px rgba(0,0,0,.4)',
                  }}
                >
                  <img
                    src="/images/naren.jpg"
                    alt="Naren Arulrajah – Host, Dominate Law Podcast"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                </div>
                <span style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--gold3)', display: 'block', marginBottom: 8 }}>
                  Host &amp; Founder
                </span>
                <strong style={{ fontFamily: 'var(--font-serif),Georgia,serif', fontSize: '1.55rem', fontWeight: 900, color: '#fff', display: 'block', marginBottom: 6 }}>
                  Naren Arulrajah
                </strong>
                <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 20 }}>
                  CEO, Ekwa Marketing
                </span>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                  {['18+ Years', '2,400+ Law Firms', 'North America'].map(badge => (
                    <span
                      key={badge}
                      style={{
                        background: 'rgba(196,154,10,.15)',
                        border: '1px solid rgba(196,154,10,.3)',
                        borderRadius: 100,
                        padding: '5px 14px',
                        fontSize: '.72rem',
                        fontWeight: 700,
                        color: 'var(--gold3)',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '.83rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.75, marginBottom: 20 }}>
                  Pioneer in Digital Marketing helping law firms across North America grow through smart,
                  data-driven marketing strategies — one conversation at a time.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="https://www.linkedin.com/company/dominatelaw/"
                    target="_blank"
                    rel="noopener"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '.78rem',
                      fontWeight: 600,
                      color: 'var(--brown3)',
                      background: 'var(--gold3)',
                      borderRadius: 6,
                      padding: '8px 16px',
                    }}
                  >
                    <LinkedInIcon fill="currentColor" />
                    LinkedIn
                  </a>
                  <Link
                    href="/podcast"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '.78rem',
                      fontWeight: 600,
                      color: 'var(--gold3)',
                      border: '1.5px solid rgba(232,196,74,.35)',
                      borderRadius: 6,
                      padding: '8px 16px',
                    }}
                  >
                    Podcast →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="section section-cream">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">The People Behind the Platform</span>
            <div style={{ width: 48, height: 3, background: 'var(--gold)', borderRadius: 2, margin: '8px auto 20px' }} />
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, margin: '8px 0 14px' }}>Meet the Team</h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto' }}>
              Every episode, every resource, and every strategy behind Dominate Law is driven by a team that
              genuinely cares about helping law firms grow.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 860, margin: '0 auto' }}>
            {team.map((member, i) => (
              <TeamCard key={member.name} member={member} reverse={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Podcast Your Ideas */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="label">Share Your Voice</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, margin: '8px 0 14px' }}>
              Podcast Your Ideas to the World!
            </h2>
            <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.75 }}>
              Let Dominate Law podcasts ignite your core values of passion, purpose, and perspective.
            </p>
          </div>
          <div className="grid-2" style={{ alignItems: 'stretch', gap: 32 }}>
            {/* Card 1 — Share Your Journey */}
            <div
              style={{
                position: 'relative',
                background: 'var(--brown3)',
                borderRadius: 16,
                padding: '40px 36px 36px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--gold),var(--gold3))' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <span style={{ fontFamily: 'var(--font-serif),Georgia,serif', fontSize: '.78rem', fontWeight: 900, color: 'var(--gold3)', letterSpacing: '.1em' }}>01</span>
                <span style={{ flex: 1, height: 1, background: 'rgba(232,196,74,.25)' }} />
                <span style={{ fontSize: '.66rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold3)' }}>For Guests</span>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(196,154,10,.14)', border: '1px solid rgba(196,154,10,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C44A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.35rem', lineHeight: 1.3, marginBottom: 14 }}>Share Your Journey</h3>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', lineHeight: 1.8, marginBottom: 24, flexGrow: 1 }}>
                Record an exclusive interview and share your experience as an attorney on a topic you know best.
                We&apos;ll produce the episode, publish it across our platform, and promote it through our digital
                channels.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.08)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.74rem', color: 'rgba(255,255,255,.45)', letterSpacing: '.02em' }}>Distinguished guests only</span>
                <Link
                  href="/guest-speaker"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '.82rem',
                    fontWeight: 700,
                    color: 'var(--gold3)',
                    padding: '10px 18px',
                    border: '1.5px solid rgba(232,196,74,.35)',
                    borderRadius: 6,
                  }}
                >
                  Apply as a Guest
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8M7 3l3 3-3 3" /></svg>
                </Link>
              </div>
            </div>

            {/* Card 2 — Learn from the Best */}
            <div
              style={{
                position: 'relative',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '40px 36px 36px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--brown),var(--brown2))' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <span style={{ fontFamily: 'var(--font-serif),Georgia,serif', fontSize: '.78rem', fontWeight: 900, color: 'var(--gold2)', letterSpacing: '.1em' }}>02</span>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '.66rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold2)' }}>For Listeners</span>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--cream2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60270F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 13a8 8 0 0 1 16 0" />
                  <path d="M4 13v5a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 1z" />
                  <path d="M20 13v5a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 1z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.35rem', lineHeight: 1.3, marginBottom: 14 }}>Learn from the Best</h3>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 24, flexGrow: 1 }}>
                Every episode puts you face-to-face with attorneys and industry leaders who have built remarkable
                practices. Tune in weekly and walk away with strategies you can put to work in your own firm.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 22, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.74rem', color: 'var(--muted)', letterSpacing: '.02em' }}>New episodes weekly</span>
                <Link
                  href="/podcast"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '.82rem',
                    fontWeight: 700,
                    color: 'var(--brown)',
                    padding: '10px 18px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 6,
                  }}
                >
                  Browse Episodes
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8M7 3l3 3-3 3" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Professional Authority */}
      <section style={{ background: 'var(--brown3)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            right: -20,
            bottom: -24,
            fontFamily: 'var(--font-serif),Georgia,serif',
            fontSize: 'clamp(5rem,16vw,13rem)',
            fontWeight: 900,
            color: 'rgba(255,255,255,.04)',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          AUTHORITY
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold3)', marginBottom: 18 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: 'var(--gold3)' }} />
              Build Your Authority
            </span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, lineHeight: 1.25, marginBottom: 24 }}>
              Build Professional Authority with an Exclusive Dominate Law Podcast Episode!
            </h2>
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 36, marginBottom: 36, textAlign: 'left' }}>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.95rem', lineHeight: 1.8, marginBottom: 16 }}>
                Are you a lawyer or a consultant or expert in the Law field?
              </p>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.95rem', lineHeight: 1.8, marginBottom: 16 }}>
                Do you have interesting marketing or business management tips, insights, guidance or experience
                to share with the law community?
              </p>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.95rem', lineHeight: 1.8, marginBottom: 24 }}>
                If your answer is <strong style={{ color: 'var(--gold3)' }}>YES</strong> to both, then we would
                love to feature you as a distinguished guest in an exclusive podcast episode on Dominate Law!
              </p>
              <div style={{ background: 'rgba(196,154,10,.1)', border: '1px solid rgba(196,154,10,.25)', borderRadius: 10, padding: '18px 22px' }}>
                <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.86rem', lineHeight: 1.7, margin: 0 }}>
                  Fill in the simple online form and we will set up your exclusive podcast interview with{' '}
                  <strong style={{ color: '#fff' }}>Naren Arulrajah</strong>, the Host of Dominate Law.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/guest-speaker" className="btn btn-gold" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                YES, I&apos;d Love to Record a Podcast! →
              </Link>
              <Link href="/contact" className="btn btn-outline-w" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
