import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function MyReviews({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(collection(db, 'reviews'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        setReviews(snapshot.docs.map(doc => doc.data()));
      } catch (e: any) {
        setError(e.message || 'Failed to fetch reviews');
      }
      setLoading(false);
    };
    fetchReviews();
  }, [userId]);

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2>My Reviews</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {reviews.length === 0 && !loading && <div>No reviews found.</div>}
      {reviews.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Expert</th>
              <th>Question</th>
              <th>Price</th>
              <th>Status</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, idx) => (
              <tr key={idx} style={{ background: r.status === 'completed' ? '#f9f9f9' : '#fff' }}>
                <td>{r.expertName}</td>
                <td>{r.requestDetails || r.question}</td>
                <td>${r.price}</td>
                <td>{r.status}</td>
                <td>{r.response ? r.response : <span style={{ color: '#888' }}>Pending</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
