import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function ManageSharedData({ userId }: { userId: string }) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTokens = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'share_tokens'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e: any) {
      setError(e.message || 'Failed to fetch shared data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this share?')) return;
    await deleteDoc(doc(db, 'share_tokens', id));
    fetchTokens();
  };

  const handleUpdate = async (id: string, updates: any) => {
    await updateDoc(doc(db, 'share_tokens', id), updates);
    fetchTokens();
  };

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2>Manage Shared Data</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {tokens.length === 0 && !loading && <div>No shared data found.</div>}
      {tokens.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Expert</th>
              <th>Categories</th>
              <th>Date Range</th>
              <th>Expiration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(token => (
              <tr key={token.id} style={{ background: token.used ? '#f9f9f9' : '#fff' }}>
                <td>{token.expert}</td>
                <td>{(token.categories || []).join(', ')}</td>
                <td>{token.dateRange?.start} - {token.dateRange?.end}</td>
                <td>{token.expiration?.toDate?.().toLocaleDateString?.() || (token.expiration && new Date(token.expiration.seconds * 1000).toLocaleDateString()) || ''}</td>
                <td>{token.used ? 'Used' : 'Active'}</td>
                <td>
                  <button onClick={() => handleDelete(token.id)} style={{ color: '#e53e3e', border: 'none', background: 'none', cursor: 'pointer' }}>Revoke</button>
                  {/* Add edit functionality as needed */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
