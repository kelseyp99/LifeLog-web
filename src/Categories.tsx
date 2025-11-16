import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
  const [sortKey, setSortKey] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [form, setForm] = useState<Partial<CategoryRow>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add new category
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user) return;
    try {
      const newDoc = {
        name: form.name || '',
        description: form.description || '',
      };
      await addDoc(collection(db, `Users/${user.uid}/Category`), newDoc);
      setForm({});
      fetchCategories();
    } catch (err) {
      setFormError('Failed to add category.');
    }
  };

  // Start editing a category
  const handleEdit = (row: CategoryRow) => {
    setEditingId(row.id);
    setForm({ ...row });
  };

  // Save edited category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user || !editingId) return;
    try {
      const ref = doc(db, `Users/${user.uid}/Category`, editingId);
      const updatedDoc = {
        name: form.name || '',
        description: form.description || '',
      };
      await updateDoc(ref, updatedDoc);
      setEditingId(null);
      setForm({});
      fetchCategories();
    } catch (err) {
      setFormError('Failed to update category.');
    }
  };

  // Delete a category
  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteDoc(doc(db, `Users/${user.uid}/Category`, id));
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

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
      console.log('Fetched categories:', data);
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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((asc) => !asc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Only render the fields shown in the backup
  const backupFields = [
    'name',
    'description'
  ];
  // Sorting logic
  const sortedCategories = React.useMemo(() => {
    if (!sortKey) return categories;
    const sorted = [...categories].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (aValue > bValue) return sortAsc ? 1 : -1;
      if (aValue < bValue) return sortAsc ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [categories, sortKey, sortAsc]);

  console.log('Categories state at render:', categories);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
      <h2 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 16, color: '#2d3748', letterSpacing: '0.03em' }}>Categories Table</h2>
      {!user && <div style={{ color: 'salmon', marginBottom: 12 }}>Please sign in to view your categories.</div>}
      {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
      {/* Add/Edit Form */}
      {user && (
        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', background: '#f7fafc', padding: 12, borderRadius: 8 }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 90 }}
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 120 }}
            required
          />
          <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({}); }} style={{ padding: '6px 12px', borderRadius: 4, background: '#a0aec0', color: '#fff', border: 'none', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </form>
      )}
      {loading ? <div style={{ marginBottom: 12 }}>Loading...</div> : null}
      <div style={{ maxHeight: 420, overflowY: 'auto', width: '100%', minWidth: 420, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: '0 auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 420, width: '100%' }}>
          <thead>
            <tr style={{ background: '#f7fafc', position: 'sticky', top: 0, zIndex: 2 }}>
              {backupFields.map((key) => (
                <th
                  key={key}
                  style={{ cursor: 'pointer', padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', userSelect: 'none', background: '#f7fafc', position: 'sticky', top: 0, zIndex: 2 }}
                  onClick={() => handleSort(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              <th style={{ background: '#f7fafc', position: 'sticky', top: 0, zIndex: 2 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.length > 0 ? (
              sortedCategories.map((cat, idx) => (
                <tr key={cat.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  {backupFields.map((key) => {
                    let value = cat[key];
                    return <td key={key} style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{String(value ?? '')}</td>;
                  })}
                  <td style={{ textAlign: 'center', padding: '8px 8px', borderBottom: '1px solid #e2e8f0' }}>
                    <button onClick={() => handleEdit(cat)} style={{ marginRight: 8, padding: '4px 10px', borderRadius: 4, border: 'none', background: '#ecc94b', color: '#2d3748', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={backupFields.length + 1} style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 16 }}>
                  No categories found. Check your Firestore collection or add sample data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
