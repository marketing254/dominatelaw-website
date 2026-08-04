import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AnnounceBar from '@/components/AnnounceBar';
import { SITE, getEpisodes } from '@/lib/sheets';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'], variable: '--font-sans', display: 'swap' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-serif', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Dominate Law — Marketing Resources, Tools & Community for Law Firms',
    template: '%s | Dominate Law',
  },
  description: 'Law firm marketing education: The Law Firm Growth Show podcast, webinars, guides, and free tools for attorneys and law firm owners.',
  openGraph: {
    siteName: 'Dominate Law',
    type: 'website',
    images: ['/images/og-cover.jpg'],
  },
  robots: { index: true, follow: true },
};

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: 'Dominate Law',
      url: `${SITE.url}/`,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/logo.png`, width: 360, height: 196 },
      parentOrganization: { '@type': 'Organization', name: 'Ekwa Marketing' },
      contactPoint: { '@type': 'ContactPoint', email: 'info@dominatelaw.com', contactType: 'customer support', areaServed: ['US', 'CA'] },
      sameAs: [
        'https://www.linkedin.com/company/dominatelaw/',
        'https://www.facebook.com/DominateLawPodcast',
        'https://www.instagram.com/dominatelawpodcast/',
        'https://www.youtube.com/channel/UCy_D9pSX9TYOzNPRH5JBJ7Q',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: 'Dominate Law',
      publisher: { '@id': `${SITE.url}/#organization` },
    },
  ],
};

export default async function RootLayout({ children }) {
  let latest = null;
  try {
    const episodes = await getEpisodes();
    latest = episodes[0] || null;
  } catch (e) { /* sheet down — render without announcement episode */ }

  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }} />
        <AnnounceBar latest={latest} />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
