



import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
  const [sortKey, setSortKey] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [form, setForm] = useState<Partial<DiscussionRow>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  // const [filter, setFilter] = useState('');
  // Per-column filters
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  // Timestamp date range filter (like Activity Log)
  const [dateRange, setDateRange] = useState<'ALL' | '1' | '30' | '180' | 'CUSTOM'>('ALL');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // ...existing code...


  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add new discussion and auto-create an ActivityLog summary entry
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user) return;
    try {
      const now = new Date();
      const description = form.description || '';
      const typeSay = form.typeSay || '';

      // 1. Create a summary ActivityLog entry from the discussion description
      const activityLogDoc = {
        category: typeSay === 'ask' ? 'question' : 'activity',
        description: description,
        summary: description,
        timestamp: now,
        cleared: form.cleared || '',
        type: 'discussion',
        sourceType: typeSay || 'tell',
      };
      const activityLogRef = await addDoc(
        collection(db, `Users/${user.uid}/ActivityLog`),
        activityLogDoc
      );

      // 2. Create the discussion with the linked ActivityLog ID
      const newDoc = {
        description: description,
        timestamp: now,
        typeSay: typeSay,
        cleared: form.cleared || '',
        activityLogs: [activityLogRef.id],
      };
      await addDoc(collection(db, `Users/${user.uid}/Discussions`), newDoc);

      setForm({});
      fetchDiscussions();
    } catch (err) {
      setFormError('Failed to add discussion.');
    }
  };

  // Start editing a discussion
  const handleEdit = (row: DiscussionRow) => {
    setEditingId(row.id);
    setForm({ ...row });
  };

  // Save edited discussion and sync linked ActivityLog entry
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user || !editingId) return;
    try {
      const description = form.description || '';
      const typeSay = form.typeSay || '';

      const ref = doc(db, `Users/${user.uid}/Discussions`, editingId);
      const updatedDoc = {
        description: description,
        typeSay: typeSay,
        cleared: form.cleared || '',
        // Don't update timestamp or activityLogs here
      };
      await updateDoc(ref, updatedDoc);

      // Also update the linked ActivityLog entry (first one in the array)
      const linkedLogs: string[] = Array.isArray(form.activityLogs) ? form.activityLogs : [];
      if (linkedLogs.length > 0) {
        const logRef = doc(db, `Users/${user.uid}/ActivityLog`, linkedLogs[0]);
        await updateDoc(logRef, {
          description: description,
          summary: description,
          sourceType: typeSay || 'tell',
        });
      } else {
        // No linked log yet — create one now
        const activityLogDoc = {
          category: typeSay === 'ask' ? 'question' : 'activity',
          description: description,
          summary: description,
          timestamp: new Date(),
          cleared: form.cleared || '',
          type: 'discussion',
          sourceType: typeSay || 'tell',
        };
        const activityLogRef = await addDoc(
          collection(db, `Users/${user.uid}/ActivityLog`),
          activityLogDoc
        );
        await updateDoc(ref, { activityLogs: [activityLogRef.id] });
      }

      setEditingId(null);
      setForm({});
      fetchDiscussions();
    } catch (err) {
      setFormError('Failed to update discussion.');
    }
  };

  // Delete a discussion
  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Delete this discussion?')) return;
    try {
  await deleteDoc(doc(db, `Users/${user.uid}/Discussions`, id));
      fetchDiscussions();
    } catch (err) {
      alert('Failed to delete discussion.');
    }
  };

  const fetchDiscussions = async () => {
    if (!user) {
      setDiscussions([]);
      return;
    }
    setLoading(true);
    try {
  const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/Discussions`));
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
    setSortKey('');
    setSortAsc(true);
    // Only refetch when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sort discussions when sortKey or sortAsc changes
  const sortedDiscussions = React.useMemo(() => {
    if (!sortKey) return discussions;
    const sorted = [...discussions].sort((a, b) => {
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
  }, [discussions, sortKey, sortAsc]);

  // Filter discussions by text in any visible field and by column dropdowns
  const filteredDiscussions = React.useMemo(() => {
    let filtered = sortedDiscussions;
    // Timestamp date range filter
    if (dateRange !== 'ALL') {
      let start: Date | null = null;
      let end: Date | null = null;
      const now = new Date();
      if (dateRange === 'CUSTOM') {
        if (customStart) start = new Date(customStart);
        if (customEnd) {
          end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
        }
      } else {
        const days = parseInt(dateRange, 10);
        start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      }
      filtered = filtered.filter((row: DiscussionRow) => {
        let ts = row.timestamp;
        if (ts && ts.toDate) ts = ts.toDate();
        if (typeof ts === 'string' || typeof ts === 'number') ts = new Date(ts);
        if (!(ts instanceof Date) || isNaN(ts.getTime())) return false;
        if (start && ts < start) return false;
        if (end && ts > end) return false;
        return true;
      });
    }
    // Apply column dropdown filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value !== '__ALL__') {
        filtered = filtered.filter((row: DiscussionRow) => {
          if (key === 'activityLogs' && Array.isArray(row[key])) {
            return String(row[key].length) === value;
          }
          return String(row[key] ?? '') === value;
        });
      }
    });
    return filtered;
  }, [sortedDiscussions, columnFilters, dateRange, customStart, customEnd]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((asc) => !asc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string>('');

  // Retroactively create ActivityLog entries for discussions that are missing them
  const handleBackfill = async () => {
    if (!user) return;
    setBackfilling(true);
    setBackfillResult('');
    let created = 0;
    let skipped = 0;
    try {
      const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/Discussions`));
      for (const discussionDoc of querySnapshot.docs) {
        const data = discussionDoc.data();
        const existingLogs: string[] = Array.isArray(data.activityLogs) ? data.activityLogs : [];
        if (existingLogs.length > 0) {
          skipped++;
          continue; // already has a linked ActivityLog
        }
        const description = data.description || '';
        const typeSay = data.typeSay || 'tell';
        // Resolve timestamp to a real Date
        let ts: Date = new Date();
        if (data.timestamp && data.timestamp.toDate) {
          ts = data.timestamp.toDate();
        } else if (data.timestamp instanceof Date) {
          ts = data.timestamp;
        } else if (typeof data.timestamp === 'string' || typeof data.timestamp === 'number') {
          const parsed = new Date(data.timestamp);
          if (!isNaN(parsed.getTime())) ts = parsed;
        }
        // Create the ActivityLog entry
        const activityLogRef = await addDoc(
          collection(db, `Users/${user.uid}/ActivityLog`),
          {
            category: typeSay === 'ask' ? 'question' : 'activity',
            description: description,
            summary: description,
            timestamp: ts,
            cleared: data.cleared || '',
            type: 'discussion',
            sourceType: typeSay,
          }
        );
        // Link it back on the discussion
        await updateDoc(doc(db, `Users/${user.uid}/Discussions`, discussionDoc.id), {
          activityLogs: [activityLogRef.id],
        });
        created++;
      }
      setBackfillResult(`✅ Done! Created ${created} new Activity Log entries. (${skipped} already had entries)`);
      fetchDiscussions();
    } catch (err) {
      setBackfillResult('❌ Error during backfill. Check the console.');
      console.error(err);
    }
    setBackfilling(false);
  };

  // Only render the fields shown in the backup
  const backupFields = [
    'description',
    'timestamp',
    'typeSay',
    'cleared',
    'activityLogs'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
      <h2 style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '2rem', marginBottom: 16, color: '#2d3748', letterSpacing: '0.03em' }}>Discussions Table</h2>
      {!user && <div style={{ color: 'salmon', marginBottom: 12 }}>Please sign in to view your discussions.</div>}
      {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}

      {/* Backfill Button */}
      {user && (
        <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            style={{
              padding: '10px 28px',
              borderRadius: 8,
              background: backfilling ? '#a0aec0' : '#38a169',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              cursor: backfilling ? 'not-allowed' : 'pointer',
            }}
          >
            {backfilling ? '⏳ Creating Activity Log entries...' : '🔄 Backfill Activity Logs from Discussions'}
          </button>
          {backfillResult && (
            <div style={{ fontSize: 14, color: backfillResult.startsWith('✅') ? '#276749' : '#c53030', fontWeight: 600 }}>
              {backfillResult}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {user && (
        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap', background: '#f7fafc', padding: 12, borderRadius: 8 }}>
          <input
            name="description"
            placeholder="Description"
            value={form.description || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 120 }}
            required
          />
          <input
            name="typeSay"
            placeholder="TypeSay"
            value={form.typeSay || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 90 }}
          />
          <input
            name="cleared"
            placeholder="Cleared"
            value={form.cleared || ''}
            onChange={handleFormChange}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 70 }}
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
      <div style={{ maxHeight: 420, overflowY: 'auto', width: '100%', minWidth: 700, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: '0 auto' }}>
        {/* Timestamp Date Range Filter (like Activity Log) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, width: '100%', maxWidth: 900, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <label htmlFor="dateRange" style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>Show:</label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}
          >
            <option value="ALL">All</option>
            <option value="1">Last 1 day</option>
            <option value="30">Last 30 days</option>
            <option value="180">Last 6 months</option>
            <option value="CUSTOM">Custom range...</option>
          </select>
          {dateRange === 'CUSTOM' && (
            <>
              <label htmlFor="customStart" style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>From:</label>
              <input
                id="customStart"
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}
              />
              <label htmlFor="customEnd" style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>To:</label>
              <input
                id="customEnd"
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                style={{ padding: 6, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}
              />
            </>
          )}
        </div>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 700, width: '100%' }}>
          <thead>
            <tr style={{ background: '#f7fafc', position: 'sticky', top: 0, zIndex: 2 }}>
              {backupFields.map((key) => {
                // Get unique values for dropdown
                let uniqueValues: string[] = [];
                if (["typeSay", "cleared"].includes(key)) {
                  uniqueValues = Array.from(new Set(discussions.map(row => String(row[key] ?? "")))).filter(v => v !== "");
                } else if (key === "activityLogs") {
                  uniqueValues = Array.from(new Set(discussions.map(row => Array.isArray(row[key]) ? String(row[key].length) : "0")));
                }
                // Custom header label for typeSay
                let headerLabel = key;
                if (key === "typeSay") headerLabel = "Type";
                else headerLabel = key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <th
                    key={key}
                    style={{ cursor: "pointer", padding: "8px 10px", minWidth: 80, maxWidth: 180, fontWeight: 600, color: "#4a5568", fontSize: 15, borderBottom: "2px solid #e2e8f0", textAlign: "center", letterSpacing: "0.02em", userSelect: "none", background: "#f7fafc", position: "sticky", top: 0, zIndex: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    onClick={() => handleSort(key)}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span>
                        {headerLabel}
                        {sortKey === key ? (sortAsc ? " ▲" : " ▼") : ""}
                      </span>
                      {uniqueValues.length > 0 && (
                        <select
                          value={columnFilters[key] || "__ALL__"}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setColumnFilters(f => ({ ...f, [key]: e.target.value }))}
                          style={{ marginTop: 4, padding: 2, borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13 }}
                        >
                          <option value="__ALL__">All</option>
                          {uniqueValues.map(val => (
                            <option key={key + '-' + val} value={val}>{val}</option>
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
            {filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion: DiscussionRow, idx: number) => (
                <tr key={discussion.id + '-' + idx} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  {backupFields.map((key) => {
                    let value = discussion[key];
                    if (key === 'timestamp') {
                      let dateStr = '';
                      let timeStr = '';
                      if (value && value.toDate) {
                        const d = value.toDate();
                        dateStr = d.toLocaleDateString();
                        timeStr = d.toLocaleTimeString();
                      } else if (value instanceof Date) {
                        dateStr = value.toLocaleDateString();
                        timeStr = value.toLocaleTimeString();
                      } else if (typeof value === 'string' || typeof value === 'number') {
                        const d = new Date(value);
                        if (!isNaN(d.getTime())) {
                          dateStr = d.toLocaleDateString();
                          timeStr = d.toLocaleTimeString();
                        } else {
                          dateStr = String(value);
                        }
                      }
                      value = <span style={{ whiteSpace: 'pre-line' }}>{dateStr}{dateStr && timeStr ? '\n' : ''}{timeStr}</span>;
                    }
                    if (key === 'activityLogs' && Array.isArray(value)) {
                      value = value.length + ' logs';
                    }
                    return <td key={key + '-' + discussion.id + '-' + idx} style={{ padding: '6px 8px', minWidth: 80, maxWidth: 180, textAlign: 'center', color: '#2d3748', fontSize: 14, borderBottom: '1px solid #e2e8f0', whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value ?? ''}</td>;
                  })}
                  <td style={{ textAlign: 'center', padding: '8px 8px', borderBottom: '1px solid #e2e8f0' }}>
                    <button onClick={() => handleEdit(discussion)} style={{ marginRight: 8, padding: '4px 10px', borderRadius: 4, border: 'none', background: '#ecc94b', color: '#2d3748', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(discussion.id)} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={backupFields.length + 1} style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 16 }}>
                  No discussions found. Check your Firestore collection or add sample data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
