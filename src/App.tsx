function About() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 700, margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1a365d', marginBottom: 8 }}>
          Life<span style={{ fontStyle: 'italic', fontWeight: 400, color: '#3182ce' }}>Log</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#4a5568', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Your all-in-one AI-powered health journal — track, reflect, and connect with experts who can help you thrive.
        </p>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
        {[
          { emoji: '📓', title: 'Activity Log', desc: 'Log daily health events, notes, and responses. Organized by category and searchable.' },
          { emoji: '🤖', title: 'AI Assistant', desc: 'Ask health questions and get AI-powered insights based on your personal log data.' },
          { emoji: '🔗', title: 'Share Data', desc: 'Generate a secure token to share your health data with a trusted expert.' },
          { emoji: '👩‍⚕️', title: 'Expert Directory', desc: 'Browse registered experts — dietitians, therapists, coaches, trainers and more.' },
          { emoji: '🧑‍💼', title: 'Expert Profile', desc: 'Experts can list their specialty, bio, and pricing (including free reviews).' },
          { emoji: '🔍', title: 'Expert View', desc: 'Experts can look up client data using a shared token and leave notes or advice.' },
          { emoji: '📊', title: 'Discussions', desc: 'Keep a log of conversations, decisions, and follow-ups all in one place.' },
          { emoji: '🔒', title: 'Private & Secure', desc: 'All data is stored in Firebase. Only you — and experts you explicitly share with — can see your data.' },
        ].map(f => (
          <div key={f.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{f.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#2d3748', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: 'linear-gradient(135deg, #ebf8ff 0%, #e9d8fd 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 32 }}>
        <h3 style={{ fontWeight: 900, color: '#2b6cb0', marginBottom: 16, fontSize: '1.1rem' }}>🚀 How it works</h3>
        <ol style={{ paddingLeft: 20, color: '#4a5568', lineHeight: 2, fontSize: 14, margin: 0 }}>
          <li>Sign in with your Google account</li>
          <li>Start logging your health activities and notes</li>
          <li>Use the AI assistant to get insights about your data</li>
          <li>Browse the Expert Directory and find someone to help you</li>
          <li>Generate a Share Token and send it to your chosen expert</li>
          <li>Your expert views your data and leaves feedback — securely</li>
        </ol>
      </div>

      {/* For experts */}
      <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
        <h3 style={{ fontWeight: 900, color: '#276749', marginBottom: 8, fontSize: '1.1rem' }}>👩‍⚕️ Are you an expert?</h3>
        <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
          Sign in and visit <strong>Expert Profile</strong> to create your listing. Set your specialty, write a bio, and choose your price — even <span style={{ color: '#38a169', fontWeight: 700 }}>$0 / Free</span>. Your card will appear in the Expert Directory for clients to find you.
        </p>
      </div>

      {/* Mission */}
      <div style={{ textAlign: 'center', color: '#718096', fontSize: 13, lineHeight: 1.8 }}>
        <p>LifeLog is continually evolving. We welcome your feedback and suggestions.</p>
        <p style={{ marginTop: 4 }}>Your privacy is our priority — your data is yours, always.</p>
        <p style={{ marginTop: 12, fontWeight: 700, color: '#a0aec0' }}>© {new Date().getFullYear()} LifeLog</p>
      </div>

    </div>
  );
}
import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { auth, provider } from './firebaseConfig'
import { signInWithPopup, signOut } from 'firebase/auth'
import ExpertList from './DietitianList'
import SponsorBanner from './SponsorBanner';
import { Discussions } from './Discussions';
import { ActivityLog } from './ActivityLog';
import { Profile } from './Profile';
import { Categories } from './Categories';
import ShareToken from './ShareToken';
import ExpertTokenView from './ExpertTokenView';
import ManageSharedData from './ManageSharedData';
import './App.css'
import lifeLinkLog from './assets/LifeLinkLog.png';
import Home from './Home';
import AskAndLog from './AskAndLog';
import GetApp from './GetApp';
import { ExpertProfile } from './ExpertProfile';
import { SeoLandingPage } from './SeoLandingPage';
import { SEO_PAGE_LINKS, SEO_PAGE_PATHS } from './seoPages';
import type { SeoPageKey } from './seoPages';
import {
  logEvent,
  logLogin,
  logScreenView,
  logSelectContent,
  logSignUp,
  setAnalyticsUser,
  trackOnboardingStarted,
} from './analytics';

const pageToPath: Record<string, string> = {
  home: '/',
  about: '/about',
  getApp: '/get-the-app',
};

function pageFromPath(pathname: string): string {
  const seoPage = SEO_PAGE_PATHS[pathname];
  if (seoPage) return `seo:${seoPage}`;
  if (pathname === '/about') return 'about';
  if (pathname === '/get-the-app') return 'getApp';
  return 'home';
}

function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname));
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUserDataMenu, setShowUserDataMenu] = useState(false);
  const signedInName = user?.displayName || user?.email || 'Signed in user';
  const signedInInitial = signedInName.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAnalyticsUser(u?.uid || null, {
        auth_state: u ? 'signed_in' : 'signed_out',
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    logScreenView(page);
  }, [page]);

  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToPage = (nextPage: string, path = pageToPath[nextPage]) => {
    setPage(nextPage);
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    logSelectContent('navigation', nextPage);
  };

  const handleSignIn = async () => {
    try {
      const credential = await signInWithPopup(auth, provider);
      const isNewUser = credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime;
      if (isNewUser) {
        logSignUp('Google');
        trackOnboardingStarted();
      } else {
        logLogin('Google');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      logEvent('exception', {
        description: 'google_sign_in_failed',
        fatal: false,
      });
    }
  };

  const handleSignOut = async () => {
    logEvent('logout');
    await signOut(auth);
  };

  return (
    <>
  <header style={{ width: 1000, maxWidth: '100vw', margin: '32px auto 0 auto', background: '#f5f5f5', padding: '0 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', paddingLeft: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <img src={lifeLinkLog} alt="LifeLog Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginRight: 0 }} />
            <h1 style={{ marginLeft: 0, textAlign: 'left', fontFamily: 'sans-serif', margin: 0, fontSize: '2.2rem', letterSpacing: '0.05em', fontWeight: 700, color: '#2d3748', whiteSpace: 'nowrap' }}>
              Life<span style={{ fontStyle: 'italic', fontWeight: 400 }}>Log</span>
            </h1>
          </div>
          <span style={{ fontSize: 13, color: '#3182ce', marginLeft: 64, marginTop: -2 }}>
            AI powered journaling app to help manage your health and more.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingRight: 32 }}>
          {!user ? (
            <button onClick={handleSignIn} style={{ padding: '8px 24px', fontSize: 16, borderRadius: 8, background: '#4285F4', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Sign in with Google
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1', background: '#fff' }}
                />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid #cbd5e1', background: '#2b6cb0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17 }}>
                  {signedInInitial}
                </div>
              )}
              <div style={{ minWidth: 0, maxWidth: 190 }}>
                <div style={{ color: '#718096', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Signed in as
                </div>
                <div title={signedInName} style={{ color: '#2d3748', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {signedInName}
                </div>
              </div>
              <button onClick={handleSignOut} style={{ padding: '8px 18px', fontSize: 16, borderRadius: 8, background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          )}
          {error && <div style={{ color: 'salmon', marginLeft: 12 }}>{error}</div>}
        </div>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f7fafc', width: 1000, maxWidth: '100vw', margin: '0 auto' }}>
        <nav style={{ width: 1000, maxWidth: '100vw', margin: '0 auto', background: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', padding: '12px 0', marginBottom: 24, boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '1.1rem', fontWeight: 500 }}>
            <button onClick={() => goToPage('home')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Home</button>
            <div style={{ position: 'relative', display: 'inline-block' }}
                 onMouseEnter={() => setShowUserDataMenu(true)}
                 onMouseLeave={() => setShowUserDataMenu(false)}>
              <button style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>
                User Data ▼
              </button>
              {showUserDataMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 1100, minWidth: 180, padding: '8px 0' }}>
                  <button onClick={() => { goToPage('discussions'); setShowUserDataMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', color: '#333', background: 'none', border: 'none', padding: '8px 16px', fontSize: 'inherit', cursor: 'pointer' }}>Discussions</button>
                  <button onClick={() => { goToPage('activitylog'); setShowUserDataMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', color: '#333', background: 'none', border: 'none', padding: '8px 16px', fontSize: 'inherit', cursor: 'pointer' }}>Activity Log</button>
                  <button onClick={() => { goToPage('categories'); setShowUserDataMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', color: '#333', background: 'none', border: 'none', padding: '8px 16px', fontSize: 'inherit', cursor: 'pointer' }}>Categories</button>
                </div>
              )}
            </div>
            <button onClick={() => goToPage('dietitians')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Experts</button>
            <button onClick={() => goToPage('profile')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Profile</button>
            <button onClick={() => goToPage('sharetoken')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Share Data</button>
            <button onClick={() => goToPage('manageshared')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Manage Shared</button>
            <button onClick={() => goToPage('expertview')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Expert View</button>
            {user && <button onClick={() => goToPage('expertprofile')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Expert Profile</button>}
            <button onClick={() => goToPage('getApp')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Get the App</button>
            <button onClick={() => goToPage('about')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>About</button>
        </nav>
        <SponsorBanner />
        <div style={{ flex: 1, minWidth: 0, maxWidth: 700, margin: '0 auto', width: '100%' }}>
          {page === 'home' && <Home />}
          {page === 'getApp' && <GetApp />}
          {page === 'askandlog' && <AskAndLog />}
          {page === 'about' && <About />}
          {page === 'dietitians' && <ExpertList user={user} />}
          {page === 'discussions' && <Discussions user={user} />}
          {page === 'activitylog' && <ActivityLog user={user} />}
          {page === 'categories' && <Categories user={user} />}
          {page === 'profile' && <Profile user={user} />}
          {page === 'sharetoken' && user && <ShareToken user={user} />}
          {page === 'sharetoken' && !user && <div style={{ padding: 32, color: 'salmon' }}>Please sign in to share data with an expert.</div>}
          {page === 'manageshared' && user && <ManageSharedData userId={user.uid} />}
          {page === 'expertview' && <ExpertTokenView user={user} />}
          {page === 'expertprofile' && <ExpertProfile user={user} />}
          {page.startsWith('seo:') && <SeoLandingPage pageKey={page.slice(4) as SeoPageKey} />}
          {page === 'home' && (
            <div style={{ padding: '0 16px 40px', fontFamily: 'sans-serif' }}>
              <h2 style={{ color: '#1a365d', fontSize: 18 }}>LifeLog guides</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SEO_PAGE_LINKS.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => goToPage(`seo:${link.key}`, link.path)}
                    style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '8px 12px', color: '#2d3748', cursor: 'pointer' }}
                  >
                    {link.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
