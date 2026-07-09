import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface ShareTokenProps {
  user: User | null;
  preselectedExpert?: any;
}

import { auth } from './firebaseConfig';
import { logGenerateLead, logShare } from './analytics';

const MAX_QUESTION = 500;

function generateToken() {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

export const ShareToken: React.FC<ShareTokenProps> = ({ user: userProp, preselectedExpert }) => {
  // Use prop if available, fall back to auth.currentUser for cases where prop arrives late
  const user = userProp ?? auth.currentUser;
  const [experts, setExperts] = useState<any[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<any>(preselectedExpert || null);
  const [categories, setCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState(30);
  const [question, setQuestion] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Load experts
    getDocs(collection(db, 'experts')).then(snap => {
      setExperts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Load user's activity log categories
    getDocs(collection(db, `Users/${user.uid}/ActivityLog`)).then(snap => {
      const cats = Array.from(new Set(snap.docs.map(d => d.data().category).filter(Boolean))) as string[];
      setAllCategories(cats);
    });
    // Load existing tokens
    fetchTokens();
  }, [user]);

  const fetchTokens = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, 'share_tokens'));
    const myTokens = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((t: any) => t.userId === user.uid);
    setTokens(myTokens);
  };

  const handleGenerate = async () => {
    if (!user || !selectedExpert) return;
    setLoading(true);
    const token = generateToken();
    const expiration = Timestamp.fromDate(new Date(Date.now() + expiryDays * 86400000));
    await addDoc(collection(db, 'share_tokens'), {
      token,
      userId: user.uid,
      userName: user.displayName || '',
      userEmail: user.email || '',
      expertId: selectedExpert.id,
      expertName: selectedExpert.name || '',
      categories: categories.length > 0 ? categories : allCategories,
      expiration,
      createdAt: Timestamp.now(),
      question: question.trim(),
    });
    setGeneratedToken(token);
    logGenerateLead('share_token_created');
    logShare('secure_token', 'health_data_access', selectedExpert.id || 'expert');
    setQuestion('');
    fetchTokens();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Revoke this token?')) return;
    await deleteDoc(doc(db, 'share_tokens', id));
    fetchTokens();
  };

  const handleCopy = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return <div style={{ padding: 32, color: '#a0aec0' }}>Please sign in.</div>;

  return (
    <div style={{ maxWidth: 700, margin: '32px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d3748', marginBottom: 4 }}>🔗 Share Data with an Expert</h2>
      <p style={{ color: '#718096', marginBottom: 24, fontSize: 14 }}>Generate a secure token so an expert can review your data.</p>

      {/* Expert Picker */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Select Expert *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          {experts.filter(e => e.isExpert).map(e => (
            <div key={e.id} onClick={() => setSelectedExpert(e)}
              style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${selectedExpert?.id === e.id ? '#3182ce' : '#e2e8f0'}`, background: selectedExpert?.id === e.id ? '#ebf8ff' : '#f7fafc', cursor: 'pointer', fontWeight: 600, color: selectedExpert?.id === e.id ? '#2b6cb0' : '#4a5568', fontSize: 14 }}>
              {e.avatarEmoji || '👤'} {e.name || e.id}
              <div style={{ fontSize: 11, fontWeight: 400, color: '#718096', marginTop: 2 }}>{e.title || ''}</div>
            </div>
          ))}
          {experts.filter(e => e.isExpert).length === 0 && <span style={{ color: '#a0aec0', fontSize: 13 }}>No experts found in directory.</span>}
        </div>
      </div>

      {/* Category Picker */}
      {allCategories.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Categories to Share <span style={{ color: '#a0aec0', fontWeight: 400 }}>(leave all unchecked = share all)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {allCategories.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${categories.includes(cat) ? '#3182ce' : '#e2e8f0'}`, background: categories.includes(cat) ? '#ebf8ff' : '#f7fafc', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: categories.includes(cat) ? '#2b6cb0' : '#4a5568' }}>
                <input type="checkbox" checked={categories.includes(cat)} onChange={e => setCategories(prev => e.target.checked ? [...prev, cat] : prev.filter(c => c !== cat))} style={{ accentColor: '#3182ce' }} />
                {cat}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Expiry */}
      <div style={{ marginBottom: 18, maxWidth: 220 }}>
        <label style={labelStyle}>Token Expiry</label>
        <select value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))} style={inputStyle}>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={365}>1 year</option>
        </select>
      </div>

      {/* Question for Expert */}
      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>
          Your Question for the Expert
          <span style={{ color: '#a0aec0', fontWeight: 400, marginLeft: 8 }}>({question.length}/{MAX_QUESTION} chars)</span>
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value.slice(0, MAX_QUESTION))}
          rows={4}
          placeholder="Optional: ask the expert a specific question about your data. This will appear alongside your data when they open the token…"
          style={{ ...inputStyle, resize: 'vertical', marginTop: 4 }}
        />
        {question.length > MAX_QUESTION * 0.9 && (
          <div style={{ fontSize: 12, color: '#e53e3e', marginTop: 4 }}>
            {MAX_QUESTION - question.length} characters remaining
          </div>
        )}
      </div>

      <button onClick={handleGenerate} disabled={loading || !selectedExpert}
        style={{ padding: '12px 32px', borderRadius: 9, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: (!selectedExpert || loading) ? 0.6 : 1, marginBottom: 24 }}>
        {loading ? '⏳ Generating…' : '🔗 Generate Token'}
      </button>

      {/* Generated Token Display */}
      {generatedToken && (
        <div style={{ background: '#f0fff4', border: '2px solid #9ae6b4', borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ fontWeight: 800, color: '#276749', fontSize: 16, marginBottom: 8 }}>✅ Token Generated!</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #9ae6b4', wordBreak: 'break-all', marginBottom: 10 }}>{generatedToken}</div>
          <button onClick={() => handleCopy(generatedToken)} style={{ padding: '8px 20px', borderRadius: 7, background: '#38a169', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            {copied ? '✅ Copied!' : '📋 Copy Token'}
          </button>
          <div style={{ fontSize: 13, color: '#4a5568', marginTop: 10 }}>Share this token with <strong>{selectedExpert?.name}</strong>. They paste it into Expert View to access your data.</div>
        </div>
      )}

      {/* Existing Tokens */}
      {tokens.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, color: '#4a5568', fontSize: 15, marginBottom: 10 }}>Your Active Tokens</div>
          {tokens.map((t: any) => {
            const exp = t.expiration?.toDate?.();
            const expired = exp && exp < new Date();
            return (
              <div key={t.id} style={{ background: expired ? '#fff5f5' : '#f7fafc', border: `1px solid ${expired ? '#fed7d7' : '#e2e8f0'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#2d3748', fontSize: 14 }}>
                    👤 {t.expertName || t.expertId} {expired && <span style={{ color: '#e53e3e', fontSize: 12, fontWeight: 400 }}>· EXPIRED</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 3 }}>
                    Categories: {(t.categories || []).join(', ') || 'All'} · Expires: {exp?.toLocaleDateString() ?? 'N/A'}
                  </div>
                  {t.question && (
                    <div style={{ fontSize: 13, color: '#4a5568', marginTop: 6, background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 6, padding: '6px 10px' }}>
                      💬 <em>"{t.question}"</em>
                    </div>
                  )}
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#a0aec0', marginTop: 4 }}>{t.token}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => handleCopy(t.token)} style={{ padding: '4px 10px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Copy</button>
                  <button onClick={() => handleDelete(t.id)} style={{ padding: '4px 10px', borderRadius: 6, background: '#e53e3e', color: '#fff', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Revoke</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 700, color: '#4a5568', fontSize: 13 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', fontFamily: 'sans-serif' };

export default ShareToken;
