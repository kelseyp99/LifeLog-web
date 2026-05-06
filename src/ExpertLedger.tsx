import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ExpertLedger({ expertName, platformFeePercent = 20 }: { expertName: string, platformFeePercent?: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(collection(db, 'reviews'), where('expertName', '==', expertName), where('status', '==', 'completed'));
        const snapshot = await getDocs(q);
        setReviews(snapshot.docs.map(doc => doc.data()));
      } catch (e: any) {
        setError(e.message || 'Failed to fetch ledger');
      }
      setLoading(false);
    };
    fetchReviews();
  }, [expertName]);

  const totalEarned = reviews.reduce((sum, r) => sum + (r.price || 0), 0);
  const platformFee = Math.round(totalEarned * platformFeePercent / 100 * 100) / 100;
  const payout = Math.round((totalEarned - platformFee) * 100) / 100;

  return (
    <div style={{ maxWidth: 500, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2>Expert Ledger</h2>
      <div style={{ marginBottom: 12 }}><strong>Expert:</strong> {expertName}</div>
      <div style={{ marginBottom: 12 }}><strong>Platform Fee:</strong> {platformFeePercent}%</div>
      <div style={{ marginBottom: 12 }}><strong>Total Earned:</strong> ${totalEarned.toFixed(2)}</div>
      <div style={{ marginBottom: 12 }}><strong>Platform Fee:</strong> ${platformFee.toFixed(2)}</div>
      <div style={{ marginBottom: 12 }}><strong>Payout:</strong> ${payout.toFixed(2)}</div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {reviews.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Price</th>
              <th>Date</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, idx) => (
              <tr key={idx}>
                <td>{r.userId}</td>
                <td>${r.price}</td>
                <td>{r.respondedAt?.toDate?.().toLocaleDateString?.() || (r.respondedAt && new Date(r.respondedAt.seconds * 1000).toLocaleDateString()) || ''}</td>
                <td>{r.response?.slice(0, 40)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
