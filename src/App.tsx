import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { auth, provider } from './firebaseConfig'
import { signInWithPopup, signOut } from 'firebase/auth'
import DietitianList from './DietitianList'
import { Discussions } from './Discussions';
import { ActivityLog } from './ActivityLog';
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
      <header style={{ position: 'relative', left: 0, top: 0, width: '100vw', minWidth: '100%', background: '#f5f5f5', padding: '24px 0 12px 0', marginBottom: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={lifeLinkLog} alt="LifeLog Logo" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 8, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <h1 style={{ textAlign: 'center', fontFamily: 'sans-serif', margin: 0, fontSize: '2.5rem', letterSpacing: '0.05em' }}>
          The LifeLog
        </h1>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
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
          {error && <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}
        </div>
      </header>
      <nav style={{ width: '100vw', minWidth: '100%', background: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', padding: '12px 0', marginBottom: 24, boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '1.1rem', fontWeight: 500 }}>
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
  {page !== 'dietitians' && page !== 'discussions' && page !== 'activitylog' && page !== 'categories' && (
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
    </>
  )
}

export default App
