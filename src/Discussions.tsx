



import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface DiscussionRow {
  id: string;
  [key: string]: any;
}


interface DiscussionsProps {
  user: User | null;
}

export const Discussions: React.FC<DiscussionsProps> = ({ user }) => {
  const [discussions, setDiscussions] = useState<DiscussionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscussions = async () => {
    if (!user) {
      setDiscussions([]);
      return;
    }
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/Discussion`));
      const data: DiscussionRow[] = querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      }));
      setDiscussions(data);
    } catch (err) {
      console.error('Error fetching discussions:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscussions();
    // Only refetch when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Only render the fields shown in the backup
  const backupFields = [
    'description',
    'timestamp',
    'typeSay',
    'cleared',
    'activityLogs',
    'synced'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
      <h2 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 16, color: '#2d3748', letterSpacing: '0.03em' }}>Discussions Table</h2>
      {!user && <div style={{ color: 'salmon', marginBottom: 12 }}>Please sign in to view your discussions.</div>}
      {loading ? <div style={{ marginBottom: 12 }}>Loading...</div> : null}
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 600, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', overflow: 'hidden', margin: '0 auto' }}>
        <thead>
          <tr style={{ background: '#f7fafc' }}>
            {backupFields.map((key) => (
              <th key={key} style={{ padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {discussions.length > 0 ? (
            discussions.map((discussion, idx) => (
              <tr key={discussion.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                {backupFields.map((key) => {
                  let value = discussion[key];
                  if (key === 'timestamp') {
                    if (value && value.toDate) {
                      value = value.toDate().toLocaleString();
                    } else if (value instanceof Date) {
                      value = value.toLocaleString();
                    } else if (typeof value === 'string') {
                      value = value;
                    }
                  }
                  if (key === 'activityLogs' && Array.isArray(value)) {
                    value = value.length + ' logs';
                  }
                  return <td key={key} style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{String(value ?? '')}</td>;
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={backupFields.length} style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 16 }}>
                No discussions found. Check your Firestore collection or add sample data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
