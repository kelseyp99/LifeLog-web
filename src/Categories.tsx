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
    'createdAt',
    'updatedAt',
    'uid',
    'synced',
    'syncTimestamp'
  ];

  return (
    <div>
      <h2>Categories Table</h2>
      {!user && <div style={{ color: 'salmon' }}>Please sign in to view your categories.</div>}
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
          {categories.length > 0 ? (
            categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                {backupFields.map((key) => {
                  let value = cat[key];
                  if (key === 'createdAt' || key === 'updatedAt' || key === 'syncTimestamp') {
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
                No categories found. Check your Firestore collection or add sample data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
