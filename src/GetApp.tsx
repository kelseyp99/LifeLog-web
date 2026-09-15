import React from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
};

type DeviceChoice = 'this_device' | 'ios' | 'android';

const iosAppUrl = import.meta.env.NEXT_PUBLIC_IOS_APP_URL || '';
const iosStoreSearchUrl = 'https://apps.apple.com/us/search?term=LifeLog%20smartcitiesfl';
const androidAppUrl =
  import.meta.env.NEXT_PUBLIC_ANDROID_APP_URL ||
  'https://play.google.com/store/apps/details?id=com.anonymous.lifelog';
const publicSiteUrl = import.meta.env.NEXT_PUBLIC_SITE_URL || 'https://lifelog42.com';
const installPath = '/get-the-app';
const seoTitle = 'LifeLog App | Daily Life Logging App for Web, iPhone, and Android';
const seoDescription =
  'Get the LifeLog app, a private daily life logging app for web, iPhone, iPad, and Android. Keep notes, meals, activities, and health observations together.';

const guideLinks = [
  { href: '/ai-life-log', label: 'AI life log' },
  { href: '/daily-journal', label: 'Daily journal' },
  { href: '/health-journal', label: 'Health journal' },
  { href: '/food-log', label: 'Food log' },
  { href: '/activity-log', label: 'Activity log' },
  { href: '/ai-summary', label: 'AI summaries' },
  { href: '/what-is-a-life-log', label: 'What is a life log?' },
];

const buttonBase: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '10px 12px',
  cursor: 'pointer',
  fontWeight: 800,
  textAlign: 'left',
  minHeight: 48,
};

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroidDevice() {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

function getInstallUrl(device: DeviceChoice) {
  if (device === 'ios') return iosAppUrl || iosStoreSearchUrl;
  if (device === 'android' && androidAppUrl) return androidAppUrl;
  return `${publicSiteUrl}${installPath}`;
}

export default function GetApp({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<DeviceChoice>('this_device');
  const [statusMessage, setStatusMessage] = React.useState('');

  React.useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(standalone || Boolean((navigator as Navigator & {standalone?: boolean}).standalone));
    if (isIosDevice()) setSelectedDevice('ios');
    if (isAndroidDevice()) setSelectedDevice('android');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  React.useEffect(() => {
    if (compact) return;
    document.title = seoTitle;

    const description = document.querySelector('meta[name="description"]') || document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', seoDescription);
    document.head.appendChild(description);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${publicSiteUrl}${installPath}`);
    document.head.appendChild(canonical);
  }, [compact]);

  const installCurrentDevice = async () => {
    setStatusMessage('');
    if (selectedDevice === 'ios') {
      window.location.href = iosAppUrl || iosStoreSearchUrl;
      return;
    }
    if (selectedDevice === 'android' && androidAppUrl) {
      window.location.href = androidAppUrl;
      return;
    }
    if (!installPrompt) {
      setStatusMessage(
        isInstalled
          ? 'LifeLog is already installed on this device.'
          : 'Open this page on the device you want to install, then use the browser install option.'
      );
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const copyInstallLink = async () => {
    const installUrl = getInstallUrl(selectedDevice);
    await navigator.clipboard.writeText(installUrl);
    setStatusMessage('Install link copied. Open it on the device you want to install or update.');
  };

  const emailInstallLink = () => {
    const installUrl = getInstallUrl(selectedDevice);
    const subject = encodeURIComponent('Install LifeLog');
    const body = encodeURIComponent(`Open this link on your device to install or update LifeLog:\n\n${installUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const checkForUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      setStatusMessage('This browser does not support app update checks.');
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      setStatusMessage('LifeLog is not installed on this browser yet.');
      return;
    }
    await registration.update();
    setStatusMessage('Checked for the latest LifeLog version on this device.');
  };

  const selectedInstallUrl = getInstallUrl(selectedDevice);
  const installButtonDisabled =
    selectedDevice === 'this_device' && !installPrompt && !isInstalled && !isIosDevice() && !isAndroidDevice();

  const deviceButtonStyle = (device: DeviceChoice): React.CSSProperties => ({
    ...buttonBase,
    background: selectedDevice === device ? '#ebf8ff' : '#fff',
    borderColor: selectedDevice === device ? '#2b6cb0' : '#cbd5e1',
    color: selectedDevice === device ? '#1a365d' : '#2d3748',
  });

  const primaryButtonStyle: React.CSSProperties = {
    background: installButtonDisabled ? '#edf2f7' : '#2563eb',
    color: installButtonDisabled ? '#64748b' : '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '11px 14px',
    cursor: installButtonDisabled ? 'default' : 'pointer',
    fontWeight: 800,
  };

  const installer = (
    <section id={compact ? undefined : 'download'} className="get-app-installer">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px' }}>
          <p style={{ margin: '0 0 6px', color: '#2b6cb0', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0 }}>
            Get the app
          </p>
          <h2 style={{ color: '#1a365d', fontSize: 24, margin: '0 0 8px' }}>Install the LifeLog app on your device</h2>
          <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Choose where you want LifeLog, then open or send the install link to that device.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 18 }}>
        <button onClick={() => setSelectedDevice('this_device')} style={deviceButtonStyle('this_device')}>
          This computer
          <span style={{ display: 'block', color: '#64748b', fontSize: 12, fontWeight: 600, marginTop: 3 }}>Install or update here</span>
        </button>
        <button onClick={() => setSelectedDevice('ios')} style={deviceButtonStyle('ios')}>
          iPhone or iPad
          <span style={{ display: 'block', color: '#64748b', fontSize: 12, fontWeight: 600, marginTop: 3 }}>Send the Safari install link</span>
        </button>
        <button onClick={() => setSelectedDevice('android')} style={deviceButtonStyle('android')}>
          Android
          <span style={{ display: 'block', color: '#64748b', fontSize: 12, fontWeight: 600, marginTop: 3 }}>Install from Chrome or Play</span>
        </button>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 14, padding: 14 }}>
        <div style={{ color: '#475569', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0, marginBottom: 6 }}>
          Selected install link
        </div>
        <div style={{ color: '#1e293b', fontFamily: 'monospace', fontSize: 12, overflowWrap: 'anywhere', marginBottom: 12 }}>
          {selectedInstallUrl}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={installCurrentDevice} disabled={installButtonDisabled} style={primaryButtonStyle}>
            {isInstalled && selectedDevice === 'this_device' ? 'Installed on this device' : 'Install on selected device'}
          </button>
          <button onClick={copyInstallLink} style={{ ...buttonBase, textAlign: 'center', background: '#fff', minHeight: 0 }}>
            Copy link
          </button>
          <button onClick={emailInstallLink} style={{ ...buttonBase, textAlign: 'center', background: '#fff', minHeight: 0 }}>
            Email link
          </button>
          <button onClick={checkForUpdate} style={{ ...buttonBase, textAlign: 'center', background: '#fff', minHeight: 0 }}>
            Check for update
          </button>
        </div>
      </div>

      <div id="ios" style={{ marginTop: 18, color: '#4a5568', fontSize: 13, lineHeight: 1.65 }}>
        {statusMessage ? (
          <span>{statusMessage}</span>
        ) : iosAppUrl || androidAppUrl ? (
          <span>Store links are used where configured. Browser install remains available from LifeLog42.com.</span>
        ) : isIosDevice() ? (
          <span>On iOS: open LifeLog in Safari, tap Share, then tap Add to Home Screen.</span>
        ) : (
          <span>From a laptop, copy or email the selected link to the phone or tablet you want to install. Installed PWAs update automatically when opened.</span>
        )}
      </div>
    </section>
  );

  if (compact) return installer;

  return (
    <article className="get-app-page">
      <section className="get-app-hero">
        <p className="get-app-eyebrow">Your day, remembered</p>
        <h1>LifeLog App: Your private daily life logging app</h1>
        <p className="get-app-lead">
          Keep daily life notes, activities, meals, health observations, and personal history together in one daily life logging app—then use AI-assisted summaries to reflect on what you recorded.
        </p>
        <div className="get-app-hero-actions">
          <a className="get-app-primary-cta" href="#download">Start your daily life log</a>
          <a className="get-app-secondary-cta" href="/daily-journal">Explore daily journaling</a>
        </div>
        <p className="get-app-support-note">Use LifeLog on the web, install it on iPhone or iPad from Safari, or get it for Android.</p>
      </section>

      <section className="get-app-benefits" aria-labelledby="life-in-one-place">
        <div>
          <p className="get-app-eyebrow">One personal timeline</p>
          <h2 id="life-in-one-place">Log the details that make up your day</h2>
          <p>
            Record everyday notes and organize entries around activities, food, health, or the categories that matter to you. Your saved history gives you one place to review events and add context over time.
          </p>
        </div>
        <ul className="get-app-feature-list">
          <li><strong>Daily life logging</strong><span>Capture moments, reflections, and notes as they happen.</span></li>
          <li><strong>Activity logging</strong><span>Record exercise, movement, routines, and recovery notes.</span></li>
          <li><strong>Food logging</strong><span>Keep meal and nutrition notes in your personal history.</span></li>
          <li><strong>Health journaling</strong><span>Save symptoms, appointments, mood, sleep, and other observations.</span></li>
          <li><strong>AI-assisted summaries</strong><span>Turn the entries you choose into useful reflections and patterns.</span></li>
          <li><strong>Notes and history</strong><span>Search and revisit the information you have recorded.</span></li>
        </ul>
      </section>

      {installer}

      <section className="get-app-watch-note" aria-labelledby="apple-watch-status">
        <div aria-hidden="true">⌚</div>
        <div>
          <h2 id="apple-watch-status">Apple Watch quick logging is in development</h2>
          <p>LifeLog has an Apple Watch quick-log prototype, but it is not yet a generally available app feature.</p>
        </div>
      </section>

      <section className="get-app-guides" aria-labelledby="explore-lifelog">
        <p className="get-app-eyebrow">See how LifeLog fits your day</p>
        <h2 id="explore-lifelog">Explore LifeLog guides</h2>
        <div className="get-app-guide-links">
          {guideLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </div>
      </section>
    </article>
  );
}
