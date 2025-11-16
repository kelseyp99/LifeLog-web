import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
  // Date range filter
  const [dateRange, setDateRange] = useState<'ALL' | '1' | '10' | '30'>('ALL');
  // Per-column filters
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [form, setForm] = useState<Partial<ActivityLogRow>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add new activity log
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user) return;
    try {
      const newDoc = {
        category: form.category || '',
        description: form.description || '',
        timestamp: new Date(),
        cleared: form.cleared || '',
        responseType: form.responseType || '',
      };
      await addDoc(collection(db, `Users/${user.uid}/ActivityLog`), newDoc);
      setForm({});
      fetchActivityLogs();
    } catch (err) {
      setFormError('Failed to add activity log.');
    }
  };

  // Start editing an activity log
  const handleEdit = (row: ActivityLogRow) => {
    setEditingId(row.id);
    setForm({ ...row });
  };

  // Save edited activity log
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user || !editingId) return;
    try {
      const ref = doc(db, `Users/${user.uid}/ActivityLog`, editingId);
      const updatedDoc = {
        category: form.category || '',
        description: form.description || '',
        cleared: form.cleared || '',
        responseType: form.responseType || '',
        // Don't update timestamp here
      };
      await updateDoc(ref, updatedDoc);
      setEditingId(null);
      setForm({});
      fetchActivityLogs();
    } catch (err) {
      setFormError('Failed to update activity log.');
    }
  };

  // Delete an activity log
  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Delete this activity log?')) return;
    try {
      await deleteDoc(doc(db, `Users/${user.uid}/ActivityLog`, id));
      fetchActivityLogs();
    } catch (err) {
      alert('Failed to delete activity log.');
    }
  };

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
    setSortKey('');
    setSortAsc(true);
    // Only refetch when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sorting logic
  const sortedActivityLogs = React.useMemo(() => {
    if (!sortKey) return activityLogs;
    const sorted = [...activityLogs].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      // Handle timestamp
      if (sortKey === 'timestamp') {
        if (aValue && aValue.toDate) aValue = aValue.toDate();
        if (bValue && bValue.toDate) bValue = bValue.toDate();
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
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
  }, [activityLogs, sortKey, sortAsc]);

  // Per-column dropdown filtering
  const filteredActivityLogs = React.useMemo(() => {
    let filtered = sortedActivityLogs;
    // Date range filter
    if (dateRange !== 'ALL') {
      const now = new Date();
      const days = parseInt(dateRange, 10);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((row: ActivityLogRow) => {
        let ts = row.timestamp;
        if (ts && ts.toDate) ts = ts.toDate();
        if (typeof ts === 'string') ts = new Date(ts);
        return ts && ts >= cutoff;
      });
    }
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value !== '__ALL__') {
        filtered = filtered.filter((row: ActivityLogRow) => String(row[key] ?? '') === value);
      }
    });
    return filtered;
  }, [sortedActivityLogs, columnFilters, dateRange]);

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
    'category',
    'description',
    'timestamp',
    'cleared',
    'responseType'
  ];

  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
      <h2 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 16, color: '#2d3748', letterSpacing: '0.03em' }}>Activity Log Table</h2>
      {!user && <div style={{ color: 'salmon', marginBottom: 12 }}>Please sign in to view your Activity Log.</div>}
      {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
      {/* Add/Edit Form */}
      {user && (
        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', background: '#f7fafc', padding: 12, borderRadius: 8 }}>
          <input
            name="category"
            placeholder="Category"
            value={form.category || ''}
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
          <input
            name="cleared"
            placeholder="Cleared"
            value={form.cleared || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 70 }}
          />
          <input
            name="responseType"
            placeholder="Response Type"
            value={form.responseType || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 90 }}
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
      {/* Date Range Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, width: '100%', maxWidth: 900, justifyContent: 'flex-end' }}>
        <label htmlFor="dateRange" style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>Show:</label>
        <select
          id="dateRange"
          value={dateRange}
          onChange={e => setDateRange(e.target.value as any)}
          style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}
        >
          <option value="ALL">All</option>
          <option value="1">Last 1 day</option>
          <option value="10">Last 10 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>
      <div style={{ maxHeight: 420, overflowY: 'auto', width: '100%', minWidth: 700, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: '0 auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 700, width: '100%' }}>
          <thead>
            <tr style={{ background: '#f7fafc', position: 'sticky', top: 0, zIndex: 2 }}>
              {backupFields.map((key) => {
                // Get unique values for dropdown
                let uniqueValues: string[] = Array.from(new Set(activityLogs.map(row => String(row[key] ?? '')))).filter(v => v !== '');
                // Compact all columns, set custom width for description
                let thStyle: React.CSSProperties = {
                  cursor: 'pointer',
                  padding: '8px 10px',
                  fontWeight: 600,
                  color: '#4a5568',
                  fontSize: 15,
                  borderBottom: '2px solid #e2e8f0',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  userSelect: 'none',
                  background: '#f7fafc',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 80,
                  maxWidth: 180
                };
                if (key === 'description') {
                  thStyle.minWidth = 120;
                  thStyle.maxWidth = 220;
                }
                return (
                  <th
                    key={key}
                    style={thStyle}
                    onClick={() => handleSort(key)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : ''}
                      </span>
                      {uniqueValues.length > 0 && (
                        <select
                          value={columnFilters[key] || '__ALL__'}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setColumnFilters(f => ({ ...f, [key]: e.target.value }))}
                          style={{ marginTop: 4, padding: 2, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13 }}
                        >
                          <option value="__ALL__">All</option>
                          {uniqueValues.map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </th>
                );
              })}
              <th style={{ background: '#f7fafc', position: 'sticky', top: 0, zIndex: 2 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivityLogs.length > 0 ? (
              filteredActivityLogs.map((log, idx) => (
                <tr key={log.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  {backupFields.map((key) => {
                    let value = log[key];
                    if (key === 'timestamp') {
                      if (value && value.toDate) {
                        value = value.toDate().toLocaleString();
                      } else if (value instanceof Date) {
                        value = value.toLocaleString();
                      } else if (typeof value === 'string') {
                        value = value;
                      }
                    }
                    // Compact all columns, set custom width for description
                    let tdStyle: React.CSSProperties = {
                      padding: '6px 8px',
                      textAlign: 'center',
                      color: '#2d3748',
                      fontSize: 14,
                      borderBottom: '1px solid #e2e8f0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minWidth: 80,
                      maxWidth: 180
                    };
                    if (key === 'description') {
                      tdStyle.minWidth = 120;
                      tdStyle.maxWidth = 220;
                    }
                    return <td key={key} style={tdStyle}>{String(value ?? '')}</td>;
                  })}
                  <td style={{ textAlign: 'center', padding: '8px 8px', borderBottom: '1px solid #e2e8f0' }}>
                    <button onClick={() => handleEdit(log)} style={{ marginRight: 8, padding: '4px 10px', borderRadius: 4, border: 'none', background: '#ecc94b', color: '#2d3748', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(log.id)} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={backupFields.length + 1} style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 16 }}>
                  No activity logs found. Check your Firestore collection or add sample data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
