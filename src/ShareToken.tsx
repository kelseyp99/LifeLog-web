import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

interface ShareTokenProps {
  preselectedExpert?: string;
}

const DEFAULT_CATEGORIES = ['diet', 'exercise', 'sleep', 'mood', 'medication', 'energy', 'stress', 'weight'];

export const ShareToken: React.FC<ShareTokenProps> = ({ preselectedExpert }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [experts, setExperts] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string>(preselectedExpert || '');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expiration, setExpiration] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch experts
  useEffect(() => {
    getDocs(collection(db, 'experts')).then(snap => {
      const list = snap.docs.map(d => d.data().name || d.id).filter(Boolean) as string[];
      if (preselectedExpert && !list.includes(preselectedExpert)) {
        setExperts([preselectedExpert, ...list]);
      } else {
        setExperts(list);
      }
    }).catch(() => {
      if (preselectedExpert) setExperts([preselectedExpert]);
    });
  }, [preselectedExpert]);

  // Sync preselected expert
  useEffect(() => {
    if (preselectedExpert) setSelectedExpert(preselectedExpert);
  }, [preselectedExpert]);

  // Fetch categories from user's ActivityLog
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, `Users/${user.uid}/ActivityLog`)).then(snap => {
      const cats = Array.from(new Set(
        snap.docs.map(d => (d.data() as any).category).filter(Boolean)
      )) as string[];
      setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES);
    }).catch(() => setCategories(DEFAULT_CATEGORIES));
  }, [user?.uid]);

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerate = async () => {
    setError('');
    if (!selectedExpert) { setError('Please select an expert.'); return; }
    if (selectedCategories.length === 0) { setError('Please select at least one category.'); return; }
    if (!expiration) { setError('Please set an expiration date.'); return; }
    const expDate = new Date(expiration);
    if (isNaN(expDate.getTime())) { setError('Invalid expiration date.'); return; }
    if (!user) { setError('You must be signed in.'); return; }

    setLoading(true);
    try {
      const newToken = uuidv4();
      await addDoc(collection(db, 'share_tokens'), {
        token: newToken,
        userId: user.uid,
        userName: user.displayName || user.email || user.uid,
        userEmail: user.email || '',
        expert: selectedExpert,
        categories: selectedCategories,
        dateRange: { start: dateRangeStart, end: dateRangeEnd },
        expiration: Timestamp.fromDate(expDate),
        createdAt: Timestamp.now(),
        used: false,
      });
      setToken(newToken);
    } catch (e: any) {
      setError(`Failed to generate token: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', padding: 28 }}>
      <h2 style={{ color: '#2d3748', marginTop: 0 }}>Share Data with Expert</h2>

      {/* Expert */}
      <label style={{ fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Expert</label>
      <select value={selectedExpert} onChange={e => setSelectedExpert(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 16, color: '#2d3748' }}>
        <option value="">-- Select Expert --</option>
        {experts.map(e => <option key={e} value={e}>{e}</option>)}
      </select>

      {/* Categories */}
      <label style={{ fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>
        Categories to Share {categories.length === 0 && <span style={{ color: '#e53e3e', fontWeight: 400 }}>(loading…)</span>}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {categories.map(cat => (
          <button key={cat} type="button" onClick={() => handleToggleCategory(cat)}
            style={{ padding: '5px 14px', borderRadius: 20, border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              borderColor: selectedCategories.includes(cat) ? '#3182ce' : '#cbd5e1',
              background: selectedCategories.includes(cat) ? '#ebf8ff' : '#f7fafc',
              color: selectedCategories.includes(cat) ? '#2b6cb0' : '#4a5568' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Date Range */}
      <label style={{ fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Date Range</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="date" value={dateRangeStart} onChange={e => setDateRangeStart(e.target.value)}
          style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#2d3748' }} />
        <span style={{ alignSelf: 'center', color: '#718096' }}>→</span>
        <input type="date" value={dateRangeEnd} onChange={e => setDateRangeEnd(e.target.value)}
          style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#2d3748' }} />
      </div>

      {/* Expiration */}
      <label style={{ fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Token Expiration</label>
      <input type="date" value={expiration} onChange={e => setExpiration(e.target.value)}
        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 18, color: '#2d3748' }} />

      {error && <div style={{ color: '#c53030', marginBottom: 12, fontWeight: 600 }}>{error}</div>}

      <button onClick={handleGenerate} disabled={loading}
        style={{ width: '100%', padding: '11px 0', borderRadius: 7, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Generating…' : 'Generate Token'}
      </button>

      {token && (
        <div style={{ marginTop: 20, background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: 14 }}>
          <div style={{ fontWeight: 700, color: '#276749', marginBottom: 6 }}>✅ Token Generated!</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all', color: '#2d3748', background: '#fff', padding: 8, borderRadius: 4, border: '1px solid #e2e8f0' }}>{token}</div>
          <button onClick={() => { navigator.clipboard.writeText(token); }}
            style={{ marginTop: 8, padding: '6px 16px', borderRadius: 4, background: '#3182ce', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Copy Token
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareToken;
