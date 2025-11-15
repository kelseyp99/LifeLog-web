import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface ActivityLogRow {
  id: string;
  [key: string]: any;
}

interface ActivityLogProps {
  user: User | null;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ user }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivityLogs = async () => {
    if (!user) {
      setActivityLogs([]);
      return;
    }
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/ActivityLog`));
      const data: ActivityLogRow[] = querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivityLogs(data);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivityLogs();
    // Only refetch when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Only render the fields shown in the backup
  const backupFields = [
    'discussionId',
    'category',
    'description',
    'timestamp',
    'cleared',
    'responseType',
    'uid',
    'synced',
    'syncTimestamp',
    'lockedCategory',
    'lockedDescription',
    'categoryId',
    'attachedFile'
  ];

  return (
    <div>
      <h2>ActivityLog Table</h2>
      {!user && <div style={{ color: 'salmon' }}>Please sign in to view your activity logs.</div>}
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
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                {backupFields.map((key) => {
                  let value = log[key];
                  if (key === 'timestamp' || key === 'syncTimestamp') {
                    if (value && value.toDate) {
                      value = value.toDate().toLocaleString();
                    } else if (value instanceof Date) {
                      value = value.toLocaleString();
                    } else if (typeof value === 'string') {
                      value = value;
                    }
                  }
                  return <td key={key}>{String(value ?? '')}</td>;
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={backupFields.length + 1} style={{ textAlign: 'center' }}>
                No activity logs found. Check your Firestore collection or add sample data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
