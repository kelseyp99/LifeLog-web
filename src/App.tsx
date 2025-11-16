import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { auth, provider } from './firebaseConfig'
import { signInWithPopup, signOut } from 'firebase/auth'
import DietitianList from './DietitianList'
import { Discussions } from './Discussions';
import { ActivityLog } from './ActivityLog';
import { Profile } from './Profile';
import { Categories } from './Categories';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import lifeLinkLog from './assets/LifeLinkLog.png';


function App() {
  const [count, setCount] = useState(0)
  const [page, setPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError((err as any).message || 'Sign-in failed');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <>
  <header style={{ width: 1000, maxWidth: '100vw', margin: '0 auto', background: '#f5f5f5', padding: '0 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 32 }}>
          <img src={lifeLinkLog} alt="LifeLog Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        </div>
        <h1 style={{ flex: 1, textAlign: 'center', fontFamily: 'sans-serif', margin: 0, fontSize: '2.2rem', letterSpacing: '0.05em', fontWeight: 700, color: '#2d3748' }}>
          The LifeLog
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingRight: 32 }}>
          {!user ? (
            <button onClick={handleSignIn} style={{ padding: '8px 24px', fontSize: 16, borderRadius: 8, background: '#4285F4', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Sign in with Google
            </button>
          ) : (
            <>
              <span style={{ marginRight: 16, color: '#333', fontWeight: 500 }}>
                Signed in as: <span style={{ color: '#4285F4', fontWeight: 700 }}>{user?.email || 'Unknown'}</span>
              </span>
              <button onClick={handleSignOut} style={{ padding: '8px 24px', fontSize: 16, borderRadius: 8, background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          )}
          {error && <div style={{ color: 'salmon', marginLeft: 12 }}>{error}</div>}
        </div>
      </header>
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', background: '#f7fafc', width: 1000, maxWidth: '100vw', margin: '0 auto' }}>
  <div style={{ flex: 1, minWidth: 0, maxWidth: 700 }}>
          <nav style={{ width: 1000, maxWidth: '100vw', margin: '0 auto', background: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', padding: '12px 0', marginBottom: 24, boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '1.1rem', fontWeight: 500 }}>
            <button onClick={() => setPage('discussions')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Discussions</button>
            <button onClick={() => setPage('activitylog')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>ActivityLog</button>
            <button onClick={() => setPage('categories')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Categories</button>
            <button onClick={() => setPage('dietitians')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Dietitians</button>
            <button onClick={() => setPage('profile')} style={{ color: '#333', background: 'none', border: 'none', textDecoration: 'none', padding: '4px 12px', borderRadius: 4, fontSize: 'inherit', fontWeight: 'inherit', cursor: 'pointer' }}>Profile</button>
          </nav>
          {page === 'dietitians' && <DietitianList />}
          {page === 'discussions' && <Discussions user={user} />}
          {page === 'activitylog' && <ActivityLog user={user} />}
          {page === 'categories' && <Categories user={user} />}
          {page === 'profile' && <Profile user={user} />}
          {page !== 'dietitians' && page !== 'discussions' && page !== 'activitylog' && page !== 'categories' && page !== 'profile' && (
            <>
              <div>
                <a href="https://vite.dev" target="_blank">
                  <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                  <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
              </div>
              <h1>Vite + React</h1>
              <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                  count is {count}
                </button>
              </div>
              <p className="read-the-docs">
                Click on the Vite and React logos to learn more
              </p>
            </>
          )}
        </div>
  <div style={{ width: 220, minWidth: 180, maxWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px 0 8px', gap: 24, marginTop: 100, marginLeft: 120 }}>
          {/* AdSense Placeholder 1 */}
          <div style={{ width: 180, height: 150, background: '#e2e8f0', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
            AdSense Placeholder 1
          </div>
          {/* AdSense Placeholder 2 */}
          <div style={{ width: 180, height: 150, background: '#e2e8f0', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', fontWeight: 600, fontSize: 16 }}>
            AdSense Placeholder 2
          </div>
        </div>
      </div>
    </>
  )
}

export default App
