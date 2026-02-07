import { useEffect, useState } from 'react';


type BannerType = {
  imageUrl: string;
  clickUrl: string;
  label: string;
};

export default function SponsorBanner() {
  // Sticky styles for the outer wrapper
  const stickyStyle: React.CSSProperties = {
    width: '100%',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fafbfc',
    boxShadow: '0 2px 8px #eee',
    minHeight: 68,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '12px 0'
  };

  const banners: BannerType[] = [
    {
      imageUrl: '/sponsor_banners/banner-1.png',
      clickUrl: '/fake-advertiser.html',
      label: 'Sponsored: Industry'
    },
    {
      imageUrl: '/sponsor_banners/banner-2.png',
      clickUrl: '/fake-advertiser.html',
      label: 'Sponsored: Attorney'
    },
    {
      imageUrl: '/sponsor_banners/banner-3.png',
      clickUrl: '/fake-advertiser.html',
      label: 'Sponsored: Realtor'
    },
    {
      imageUrl: '/sponsor_banners/banner-4.png',
      clickUrl: '/fake-advertiser.html',
      label: 'Sponsored: Investor'
    },
    {
      imageUrl: '/sponsor_banners/banner-5.png',
      clickUrl: '/fake-advertiser.html',
      label: 'Sponsored: Title Company'
    },
    // Add more banners as needed
  ];

  const [banner, setBanner] = useState<BannerType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pick a random banner on mount
    const randomBanner = banners[Math.floor(Math.random() * banners.length)];
    setBanner(randomBanner);
    setLoading(false);
  }, []);

  if (loading || !banner) return null;

  return (
    <div style={stickyStyle}>
      <div style={{ border: '1px solid #eee', borderRadius: 6, background: '#fafbfc', padding: 4, minWidth: 320, maxWidth: 700, width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, color: '#888', fontSize: 13, marginRight: 8 }}>{banner.label}</span>
        <a href={banner.clickUrl} target="_blank" rel="noopener" style={{ flex: 1, display: 'block' }}>
          <img src={banner.imageUrl} alt={banner.label} style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
        </a>
      </div>
    </div>
  );
}
