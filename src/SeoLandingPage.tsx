import React from 'react';
import { SEO_PAGES } from './seoPages';
import type { SeoPageKey } from './seoPages';

export function SeoLandingPage({ pageKey }: { pageKey: SeoPageKey }) {
  const page = SEO_PAGES[pageKey];
  React.useEffect(() => {
    document.title = `${page.title} | LifeLog`;
    const description = document.querySelector('meta[name="description"]') || document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', page.description);
    document.head.appendChild(description);
  }, [page]);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 56px', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#2b6cb0', fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0, marginBottom: 8 }}>
        {page.eyebrow}
      </p>
      <h1 style={{ color: '#1a365d', fontSize: '2.4rem', lineHeight: 1.1, margin: '0 0 14px' }}>
        {page.title}
      </h1>
      <p style={{ color: '#4a5568', fontSize: 17, lineHeight: 1.7, marginBottom: 28 }}>
        {page.description}
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ color: '#2d3748', fontSize: 20, marginBottom: 12 }}>What this page supports</h2>
        <ul style={{ color: '#4a5568', lineHeight: 1.8, paddingLeft: 22 }}>
          {page.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
      </section>

      <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: 22 }}>
        <h2 style={{ color: '#2d3748', fontSize: 20, marginBottom: 12 }}>Future product direction</h2>
        <ul style={{ color: '#4a5568', lineHeight: 1.8, paddingLeft: 22 }}>
          {page.futureFeatures.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
      </section>
    </main>
  );
}
