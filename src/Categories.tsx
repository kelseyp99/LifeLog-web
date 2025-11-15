import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface CategoryRow {
  id: string;
  [key: string]: any;
}

interface CategoriesProps {
  user: User | null;
}

export const Categories: React.FC<CategoriesProps> = ({ user }) => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      return;
    }
    setLoading(true);
    try {
  const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/Category`));
      const data: CategoryRow[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    // Only refetch when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Only render the fields shown in the backup
  const backupFields = [
    'name',
    'description',
    'synced'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
      <h2 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 16, color: '#2d3748', letterSpacing: '0.03em' }}>Categories Table</h2>
      {!user && <div style={{ color: 'salmon', marginBottom: 12 }}>Please sign in to view your categories.</div>}
      {loading ? <div style={{ marginBottom: 12 }}>Loading...</div> : null}
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 420, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', overflow: 'hidden', margin: '0 auto' }}>
        <thead>
          <tr style={{ background: '#f7fafc' }}>
            {backupFields.map((key) => (
              <th key={key} style={{ padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((cat, idx) => (
              <tr key={cat.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                {backupFields.map((key) => {
                  let value = cat[key];
                  return <td key={key} style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{String(value ?? '')}</td>;
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={backupFields.length} style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 16 }}>
                No categories found. Check your Firestore collection or add sample data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
