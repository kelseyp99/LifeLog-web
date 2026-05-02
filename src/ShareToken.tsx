import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function ShareToken({ userId, preselectedExpert }: { userId: string, preselectedExpert?: string }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [expiration, setExpiration] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [experts, setExperts] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState(preselectedExpert || '');

  useEffect(() => {
    if (preselectedExpert) setSelectedExpert(preselectedExpert);
  }, [preselectedExpert]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, `Users/${userId}/Category`));
        const cats = querySnapshot.docs.map((doc: any) => doc.data().name).filter(Boolean);
        setAllCategories(cats);
      } catch (e) {
        setAllCategories([]);
      }
    }
    fetchCategories();
  }, [userId]);

  useEffect(() => {
    async function fetchExperts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'experts'));
        const expertList = querySnapshot.docs.map((doc: any) => doc.data().name).filter(Boolean);
        // Always include preselectedExpert even if not in Firestore
        const combined = preselectedExpert
          ? [...new Set([preselectedExpert, ...expertList])]
          : [...new Set(expertList)];
        setExperts(combined);
      } catch (e) {
        // If fetch fails, still show preselected expert
        setExperts(preselectedExpert ? [preselectedExpert] : []);
      }
    }
    fetchExperts();
  }, [preselectedExpert]);

  const handleGenerate = async () => {
    setError('');

    // Validate required fields
    if (!selectedExpert) {
      setError('Please select an expert.');
      return;
    }
    if (categories.length === 0) {
      setError('Please select at least one category.');
      return;
    }
    if (!expiration) {
      setError('Please set an expiration date.');
      return;
    }
    const expirationDate = new Date(expiration);
    if (isNaN(expirationDate.getTime())) {
      setError('Invalid expiration date.');
      return;
    }

    setLoading(true);
    try {
      const tokenId = uuidv4();
      await addDoc(collection(db, 'share_tokens'), {
        token: tokenId,
        userId,
        expert: selectedExpert,
        categories,
        dateRange,
        expiration: Timestamp.fromDate(expirationDate),
        createdAt: Timestamp.now(),
        used: false
      });
      setToken(tokenId);
    } catch (e: any) {
      console.error('Token generation error:', e);
      setError(e?.message ? `Failed to generate token: ${e.message}` : 'Failed to generate token. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ maxWidth: 400, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2>Share Data with Expert</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Expert:<br />
          <select value={selectedExpert} onChange={e => setSelectedExpert(e.target.value)} style={{ width: '100%' }}>
            <option value="">Select expert</option>
            {experts.map((expert: string) => (
              <option key={expert} value={expert}>{expert}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Categories:<br />
          <select multiple value={categories} onChange={e => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setCategories(selected);
          }} style={{ width: '100%', minHeight: 80 }}>
            {[...new Set(allCategories)].map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Date Range:<br />
          <input type="date" value={dateRange.start} onChange={e => setDateRange((r: { start: string; end: string }) => ({ ...r, start: e.target.value }))} />
          {' '}to{' '}
          <input type="date" value={dateRange.end} onChange={e => setDateRange((r: { start: string; end: string }) => ({ ...r, end: e.target.value }))} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Expiration Date:<br />
          <input type="date" value={expiration} onChange={e => setExpiration(e.target.value)} />
        </label>
      </div>
      <button onClick={handleGenerate} disabled={loading} style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>
        {loading ? 'Generating...' : 'Generate Token'}
      </button>
      {token && (
        <div style={{ marginTop: 16, wordBreak: 'break-all' }}>
          <strong>Share this token with your expert:</strong>
          <div style={{ background: '#f7fafc', padding: 8, borderRadius: 6, marginTop: 8 }}>{token}</div>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
