import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

interface ActivityRow { [key: string]: any; }
interface Props {
  open: boolean;
  onClose: () => void;
  tokenDoc: any;
  expertName?: string;
  clientName?: string;
}

function tsOf(r: ActivityRow): Date | null {
  let ts = r.timestamp;
  if (ts?.toDate) ts = ts.toDate();
  if (typeof ts === 'string') ts = new Date(ts);
  return ts instanceof Date && !isNaN(ts.getTime()) ? ts : null;
}

export const ExpertDataDialog: React.FC<Props> = ({ open, onClose, tokenDoc, expertName, clientName }) => {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'data' | 'ai' | 'notes' | 'advice'>('data');
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [catFilter, setCatFilter] = useState('__ALL__');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // Free advice state
  const [adviceText, setAdviceText] = useState('');
  const [adviceCategory, setAdviceCategory] = useState('Expert Advice');
  const [adviceSaving, setAdviceSaving] = useState(false);
  const [adviceSaved, setAdviceSaved] = useState(false);

  useEffect(() => {
    if (!open || !tokenDoc?.userId) return;
    setLoading(true);
    getDocs(collection(db, `Users/${tokenDoc.userId}/ActivityLog`))
      .then(snap => setRows(snap.docs.map(d => ({ ...d.data(), id: d.id }))))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
    if (tokenDoc?.id) {
      getDocs(collection(db, `ExpertNotes/${tokenDoc.id}/notes`))
        .then(snap => setSavedNotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
        .catch(() => setSavedNotes([]));
    }
  }, [open, tokenDoc]);

  const categories = Array.from(new Set(rows.map(r => r.category).filter(Boolean))) as string[];

  const filtered = rows.filter(r => {
    if (tokenDoc?.categories?.length && !tokenDoc.categories.includes(r.category)) return false;
    if (catFilter !== '__ALL__' && r.category !== catFilter) return false;
    const ts = tsOf(r);
    if (dateFrom && ts && ts < new Date(dateFrom)) return false;
    if (dateTo && ts) { const e = new Date(dateTo); e.setHours(23,59,59,999); if (ts > e) return false; }
    return true;
  }).sort((a, b) => {
    let av: any = sortKey === 'timestamp' ? (tsOf(a)?.getTime() ?? 0) : a[sortKey];
    let bv: any = sortKey === 'timestamp' ? (tsOf(b)?.getTime() ?? 0) : b[sortKey];
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (sortAsc ? 1 : -1);
  });

  const handleSort = (k: string) => { if (sortKey === k) setSortAsc(a => !a); else { setSortKey(k); setSortAsc(true); } };

  const handleSaveNote = async () => {
    if (!note.trim() || !tokenDoc?.id) return;
    const n = { text: note.trim(), expertName: expertName || '', createdAt: Timestamp.now() };
    await addDoc(collection(db, `ExpertNotes/${tokenDoc.id}/notes`), n);
    setSavedNotes(prev => [...prev, n]);
    setNote('');
  };

  const handlePostAdvice = async () => {
    if (!adviceText.trim() || !tokenDoc?.userId) return;
    setAdviceSaving(true);
    setAdviceSaved(false);
    try {
      await addDoc(collection(db, `Users/${tokenDoc.userId}/ActivityLog`), {
        category: adviceCategory || 'Expert Advice',
        description: adviceText.trim(),
        timestamp: Timestamp.now(),
        expertName: expertName || '',
        responseType: 'Expert Advice',
        cleared: 'false',
      });
      setAdviceText('');
      setAdviceSaved(true);
      setTimeout(() => setAdviceSaved(false), 3000);
    } catch (e: any) {
      alert('Failed to post advice: ' + e.message);
    }
    setAdviceSaving(false);
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult('');
    const apiKey = localStorage.getItem('openrouter_api_key') || '';
    const model = localStorage.getItem('openrouter_model') || 'openai/gpt-3.5-turbo';
    if (!apiKey) { setAiResult('⚠️ No API key. Go to Profile → AI Analysis to add one.'); setAiLoading(false); return; }
    try {
      const text = filtered.map(r => `[${r.category}] ${r.description || ''} (${tsOf(r)?.toLocaleDateString() ?? ''})`).join('\n');
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'LifeLog' },
        body: JSON.stringify({ model, messages: [
          { role: 'system', content: 'You are a health data analyst. Summarize key patterns and give actionable recommendations.' },
          { role: 'user', content: `Activity log:\n\n${text}` }
        ]}),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
      const d = await res.json();
      setAiResult(d.choices?.[0]?.message?.content || '(no response)');
    } catch (e: any) { setAiResult(`Error: ${e.message}`); }
    setAiLoading(false);
  };

  if (!open) return null;

  const displayName = clientName || tokenDoc?.userName || tokenDoc?.userEmail || tokenDoc?.userId || 'Unknown Client';
  const cols = ['timestamp', 'category', 'description', 'cleared'];
  const tabs: { id: 'data'|'ai'|'notes'|'advice'; label: string }[] = [
    { id: 'data', label: '📊 Data' },
    { id: 'ai', label: '🤖 AI' },
    { id: 'notes', label: '📝 Notes' },
    { id: 'advice', label: '💡 Post Advice' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '92vw', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>

        {/* HEADER */}
        <div style={{ background: '#ebf8ff', borderRadius: '14px 14px 0 0', padding: '18px 24px 0', borderBottom: '2px solid #bee3f8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#2b6cb0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>CLIENT DATA REVIEW</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1a365d', lineHeight: 1.1 }}>👤 {displayName}</div>
              <div style={{ fontSize: 13, color: '#4a5568', marginTop: 6 }}>
                {(tokenDoc?.categories || []).length > 0 && <span>Categories: <strong>{tokenDoc.categories.join(', ')}</strong></span>}
                {expertName && <span style={{ marginLeft: 12 }}>· Expert: {expertName}</span>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#718096', lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '7px 18px', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: tab === t.id ? '#fff' : '#bee3f8', color: tab === t.id ? '#2b6cb0' : '#4a5568',
                borderBottom: tab === t.id ? '2px solid #fff' : 'none', marginBottom: tab === t.id ? -2 : 0,
              }}>{t.label}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#718096', alignSelf: 'center', paddingRight: 4 }}>{filtered.length} rows</span>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {loading && <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0' }}>Loading data…</div>}

          {/* DATA TAB */}
          {!loading && tab === 'data' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}>
                  <option value="__ALL__">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
                <span style={{ color: '#718096' }}>→</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f7fafc' }}>
                    {cols.map(k => (
                      <th key={k} onClick={() => handleSort(k)} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#4a5568', borderBottom: '2px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>
                        {k.charAt(0).toUpperCase() + k.slice(1)}{sortKey === k ? (sortAsc ? ' ▲' : ' ▼') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#a0aec0' }}>No data matches filters.</td></tr>
                    : filtered.map((r, i) => (
                      <tr key={(r.id ?? '') + '-' + i} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                        {cols.map(k => {
                          if (k === 'timestamp') {
                            const ts = tsOf(r);
                            return <td key={k} style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                              {ts?.toLocaleDateString()}<br/><span style={{ fontSize: 11, color: '#a0aec0' }}>{ts?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>;
                          }
                          return <td key={k} style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', maxWidth: 320, wordBreak: 'break-word' }}>{String(r[k] ?? '')}</td>;
                        })}
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </>
          )}

          {/* AI TAB */}
          {!loading && tab === 'ai' && (
            <div>
              <p style={{ color: '#4a5568', marginBottom: 12, fontSize: 14 }}>
                Analyzing <strong>{filtered.length}</strong> rows for <strong>{displayName}</strong>
                {!localStorage.getItem('openrouter_api_key') && <span style={{ color: '#e53e3e', marginLeft: 8 }}>⚠️ No API key — set one in Profile</span>}
              </p>
              <button onClick={handleAI} disabled={aiLoading} style={{ padding: '10px 28px', borderRadius: 7, background: '#805ad5', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: aiLoading ? 0.7 : 1, marginBottom: 16 }}>
                {aiLoading ? '⏳ Analyzing…' : '🤖 Analyze with AI'}
              </button>
              {aiResult && <div style={{ background: '#faf5ff', border: '1px solid #d6bcfa', borderRadius: 8, padding: 16, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{aiResult}</div>}
            </div>
          )}

          {/* NOTES TAB */}
          {!loading && tab === 'notes' && (
            <div>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder={`Private notes about ${displayName} (only you see these)…`}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, marginBottom: 10, boxSizing: 'border-box', resize: 'vertical' }} />
              <button onClick={handleSaveNote} style={{ padding: '8px 22px', borderRadius: 6, background: '#38a169', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>
                💾 Save Note
              </button>
              {savedNotes.map((n, i) => (
                <div key={n.id ?? i} style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13 }}>
                  <div style={{ whiteSpace: 'pre-wrap', color: '#276749' }}>{n.text}</div>
                  <div style={{ color: '#a0aec0', fontSize: 11, marginTop: 4 }}>{n.expertName} · {n.createdAt?.toDate?.()?.toLocaleString?.() ?? ''}</div>
                </div>
              ))}
            </div>
          )}

          {/* FREE ADVICE TAB */}
          {!loading && tab === 'advice' && (
            <div>
              <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14, color: '#744210' }}>
                <strong>💡 Post Free Advice</strong><br/>
                Write a message that will appear directly in <strong>{displayName}</strong>'s Activity Log as an expert entry. No charge — free advice only.
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <label style={{ fontWeight: 600, color: '#4a5568', fontSize: 14, whiteSpace: 'nowrap' }}>Category:</label>
                <input
                  value={adviceCategory}
                  onChange={e => setAdviceCategory(e.target.value)}
                  placeholder="Expert Advice"
                  style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, flex: 1 }}
                />
              </div>
              <textarea
                value={adviceText}
                onChange={e => setAdviceText(e.target.value)}
                rows={6}
                placeholder={`Write your advice for ${displayName} here…`}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={handlePostAdvice}
                  disabled={adviceSaving || !adviceText.trim()}
                  style={{ padding: '10px 28px', borderRadius: 8, background: '#d69e2e', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (adviceSaving || !adviceText.trim()) ? 0.6 : 1 }}
                >
                  {adviceSaving ? '⏳ Posting…' : '💡 Post Free Advice'}
                </button>
                {adviceSaved && <span style={{ color: '#38a169', fontWeight: 700, fontSize: 14 }}>✅ Posted to client's log!</span>}
              </div>
              <p style={{ color: '#a0aec0', fontSize: 12, marginTop: 12 }}>
                This will appear in the client's Activity Log under category "<strong>{adviceCategory || 'Expert Advice'}</strong>" with your name attached.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDataDialog;
