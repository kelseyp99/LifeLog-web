import React, { useState, useEffect } from 'react';
import type { ActivityLogRow } from './ActivityLog';
import { AskExportModal } from './AskExportModal';

interface AskExportIntegrationProps {
  user: any;
}

export const AskExportIntegration: React.FC<AskExportIntegrationProps> = ({ user }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Fetch activity logs from Firestore (reuse logic from ActivityLog)
    async function fetchLogs() {
      if (!user) return setActivityLogs([]);
      // @ts-ignore
      const { db } = await import('./firebaseConfig');
      // @ts-ignore
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/ActivityLog`));
      const data: ActivityLogRow[] = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      setActivityLogs(data);
    }
    fetchLogs();
  }, [user]);

  return (
    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <button onClick={() => setModalOpen(true)} style={{ padding: '12px 32px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>
        Ask / Export for ChatGPT
      </button>
      <AskExportModal activityLogs={activityLogs} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
