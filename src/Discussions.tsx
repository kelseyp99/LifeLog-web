



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
    'discussionId',
    'description',
    'timestamp',
    'typeSay',
    'cleared',
    'uid',
    'activityLogs',
    'syncTimestamp',
    'synced'
  ];

  return (
    <div>
      <h2>Discussions Table</h2>
      {!user && <div style={{ color: 'salmon' }}>Please sign in to view your discussions.</div>}
      {loading ? <div>Loading...</div> : null}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            {backupFields.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {discussions.length > 0 ? (
            discussions.map((discussion) => (
              <tr key={discussion.id}>
                <td>{discussion.id}</td>
                {backupFields.map((key) => {
                  let value = discussion[key];
                  if (key === 'timestamp' || key === 'syncTimestamp') {
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
                  return <td key={key}>{String(value ?? '')}</td>;
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={backupFields.length + 1} style={{ textAlign: 'center' }}>
                No discussions found. Check your Firestore collection or add sample data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
