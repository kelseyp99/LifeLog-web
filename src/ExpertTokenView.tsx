import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { ExpertDataDialog } from './ExpertDataDialog';

interface ExpertTokenViewProps { user: User | null; }

const RECENT_TOKENS_KEY = 'expert_recent_tokens';

export const ExpertTokenView: React.FC<ExpertTokenViewProps> = ({ user }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [clientName, setClientName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load from localStorage on mount
  const [recentTokens, setRecentTokens] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_TOKENS_KEY) || '[]'); } catch { return []; }
  });

  // Save to localStorage whenever recentTokens changes
  useEffect(() => {
    localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(recentTokens));
  }, [recentTokens]);

  const lookupToken = async (tokenStr: string) => {
    setError('');
    setLoading(true);
    try {
      const q = query(collection(db, 'share_tokens'), where('token', '==', tokenStr.trim()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) { setError('Token not found.'); setLoading(false); return; }
      const tokenDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };

      // Try to get client's display name from their user doc
      let name = (tokenDoc as any).userName || (tokenDoc as any).userEmail || '';
      if (!(tokenDoc as any).userName) {
        try {
          // fetch Users/{userId} doc directly
          const { getDoc, doc } = await import('firebase/firestore');
          const userDoc = await getDoc(doc(db, 'Users', (tokenDoc as any).userId));
          if (userDoc.exists()) {
            const d = userDoc.data();
            name = d.displayName || d.name || d.firstName || d.email || d.userEmail || (tokenDoc as any).userEmail || (tokenDoc as any).userId || 'Unknown';
          }
        } catch {}
      }

      setClientName(name);
      setSelectedToken(tokenDoc);

      // Add to recent tokens (dedupe by token string, keep latest at top, max 20)
      setRecentTokens(prev => {
        const filtered = prev.filter((t: any) => t.token !== tokenStr.trim());
        return [{ ...tokenDoc, _clientName: name }, ...filtered].slice(0, 20);
      });

      setDialogOpen(true);
    } catch (e: any) {
      setError(e.message || 'Error looking up token.');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    lookupToken(tokenInput.trim());
  };

  const handleRecentClick = (t: any) => {
    setClientName(t._clientName || t.userName || t.userEmail || '');
    setSelectedToken(t);
    setDialogOpen(true);
  };

  const handleRemoveRecent = (tokenStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentTokens(prev => prev.filter((t: any) => t.token !== tokenStr));
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', marginBottom: 8 }}>🔑 Expert Token View</h2>
      <p style={{ color: '#718096', marginBottom: 24 }}>Enter a client's share token to view their data.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          placeholder="Paste token here..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
        />
        <button type="submit" disabled={loading || !tokenInput.trim()} style={{
          padding: '10px 22px', borderRadius: 8, background: '#3182ce', color: '#fff',
          border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1
        }}>
          {loading ? '...' : 'View Data'}
        </button>
      </form>

      {error && <div style={{ color: '#e53e3e', marginBottom: 16, fontWeight: 600 }}>⚠️ {error}</div>}

      {recentTokens.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, color: '#4a5568', marginBottom: 10, fontSize: 15 }}>Recent Clients</div>
          {recentTokens.map((t: any, i: number) => (
            <div key={t.token + '-' + i} onClick={() => handleRecentClick(t)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: 8, background: '#f7fafc', borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ebf8ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f7fafc')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#2b6cb0' }}>
                  👤 {t._clientName || t.userName || t.userEmail || t.userId || 'Unknown Client'}
                </div>
                <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 2 }}>
                  {(t.categories || []).join(', ')} · {t.token?.slice(0, 12)}...
                </div>
              </div>
              <button onClick={e => handleRemoveRecent(t.token, e)}
                style={{ background: 'none', border: 'none', color: '#a0aec0', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
                title="Remove">✕</button>
            </div>
          ))}
        </div>
      )}

      {selectedToken && (
        <ExpertDataDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          tokenDoc={selectedToken}
          expertName={user?.displayName || user?.email || ''}
          clientName={clientName}
        />
      )}
    </div>
  );
};

export default ExpertTokenView;
