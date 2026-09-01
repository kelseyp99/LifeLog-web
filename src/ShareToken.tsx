import React, { useCallback, useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface ShareTokenProps {
  user: User | null;
  preselectedExpert?: ExpertSummary;
}

interface ExpertSummary {
  id: string;
  name?: string;
  title?: string;
  avatarEmoji?: string;
  isExpert?: boolean;
  approvalStatus?: string;
}

import { auth } from './firebaseConfig';
import { logGenerateLead, trackShare } from './analytics';
import {
  callExpertWorkflow,
  type ShareTokenRecord,
} from './expertSharing';
import { resolveShareCategories } from './shareCategoryScope';

export const ShareToken: React.FC<ShareTokenProps> = ({ user: userProp, preselectedExpert }) => {
  // Use prop if available, fall back to auth.currentUser for cases where prop arrives late
  const user = userProp ?? auth.currentUser;
  const [experts, setExperts] = useState<ExpertSummary[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ExpertSummary | null>(preselectedExpert || null);
  const [categories, setCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [shareAllCategories, setShareAllCategories] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokens, setTokens] = useState<ShareTokenRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchTokens = useCallback(async () => {
    if (!user) return;
    try {
      const result = await callExpertWorkflow<{shares: ShareTokenRecord[]}>(
        'listOwnerShares'
      );
      setTokens(result.shares);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Shares could not be loaded.');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Load experts
    getDocs(collection(db, 'experts')).then(snap => {
      setExperts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExpertSummary))
        .filter((expert) => expert.isExpert && expert.approvalStatus === 'approved'));
    });
    // Load user's activity log categories
    getDocs(collection(db, `Users/${user.uid}/ActivityLog`)).then(snap => {
      const cats = Array.from(new Set(snap.docs.map(d => d.data().category).filter(Boolean))) as string[];
      setAllCategories(cats);
    });
    // Load existing tokens
    void fetchTokens();
  }, [fetchTokens, user]);

  const handleGenerate = async () => {
    if (!user || !selectedExpert) return;
    setLoading(true);
    setError('');
    try {
      const selectedCategories = resolveShareCategories(categories, allCategories, shareAllCategories);
      if (selectedCategories.length === 0) {
        setError('Select at least one category, or explicitly choose all categories.');
        return;
      }
      const result = await callExpertWorkflow<{share: ShareTokenRecord}>(
        'createShare',
        {
          expertUid: selectedExpert.id,
          categories: selectedCategories,
          shareAllCategories: shareAllCategories || undefined,
          expiresInDays: expiryDays,
        }
      );
      setGeneratedToken(result.share.tokenId);
      logGenerateLead('share_token_created');
      trackShare('health_data_access');
      await fetchTokens();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Share could not be created.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!window.confirm('Revoke this share immediately?')) return;
    setError('');
    try {
      await callExpertWorkflow('revokeShare', {tokenId});
      await fetchTokens();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Share could not be revoked.');
    }
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
      <p style={{ color: '#718096', marginBottom: 24, fontSize: 14 }}>Choose exactly which categories an approved expert can review and when access expires.</p>
      {error && <div style={{ padding: 12, color: '#c53030', background: '#fff5f5', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {/* Expert Picker */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Select Expert *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          {experts.map(e => (
            <div key={e.id} onClick={() => setSelectedExpert(e)}
              style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${selectedExpert?.id === e.id ? '#3182ce' : '#e2e8f0'}`, background: selectedExpert?.id === e.id ? '#ebf8ff' : '#f7fafc', cursor: 'pointer', fontWeight: 600, color: selectedExpert?.id === e.id ? '#2b6cb0' : '#4a5568', fontSize: 14 }}>
              {e.avatarEmoji || '👤'} {e.name || e.id}
              <div style={{ fontSize: 11, fontWeight: 400, color: '#718096', marginTop: 2 }}>{e.title || ''}</div>
            </div>
          ))}
          {experts.length === 0 && <span style={{ color: '#a0aec0', fontSize: 13 }}>No approved experts found in directory.</span>}
        </div>
      </div>

      {/* Category Picker */}
      {allCategories.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Categories to Share <span style={{ color: '#a0aec0', fontWeight: 400 }}>(choose specific categories below, or enable Share All)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {allCategories.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${categories.includes(cat) ? '#3182ce' : '#e2e8f0'}`, background: categories.includes(cat) ? '#ebf8ff' : '#f7fafc', cursor: shareAllCategories ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: categories.includes(cat) ? '#2b6cb0' : '#4a5568', opacity: shareAllCategories ? 0.5 : 1 }}>
                <input type="checkbox" checked={categories.includes(cat)} disabled={shareAllCategories} onChange={e => setCategories(prev => e.target.checked ? [...prev, cat] : prev.filter(c => c !== cat))} style={{ accentColor: '#3182ce' }} />
                {cat}
              </label>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, fontWeight: 700, color: '#4a5568' }}>
            <input type="checkbox" checked={shareAllCategories} onChange={e => {
              setShareAllCategories(e.target.checked);
              if (e.target.checked) setCategories([]);
            }} style={{ accentColor: '#3182ce' }} />
            Share all categories
          </label>
          {shareAllCategories && <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>All categories you log will be shared; individual selections below are cleared.</div>}
        </div>
      )}
      {allCategories.length === 0 && (
        <div style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: '#fffbeb', color: '#744210' }}>
          Add at least one Activity Log category before sharing.
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

      <button onClick={handleGenerate} disabled={loading || !selectedExpert || allCategories.length === 0 || (!shareAllCategories && categories.length === 0)}
        style={{ padding: '12px 32px', borderRadius: 9, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: (!selectedExpert || loading || allCategories.length === 0 || (!shareAllCategories && categories.length === 0)) ? 0.6 : 1, marginBottom: 24 }}>
        {loading ? '⏳ Sharing…' : (!selectedExpert ? '🔒 Select an expert' : (allCategories.length === 0 ? '🔒 No categories yet' : (!shareAllCategories && categories.length === 0 ? '🔒 Choose categories or enable Share All' : '🔗 Share with Expert')))}
        {loading ? '⏳ Sharing…' : '🔗 Share with Expert'}
      </button>

      {/* Generated Token Display */}
      {generatedToken && (
        <div style={{ background: '#f0fff4', border: '2px solid #9ae6b4', borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ fontWeight: 800, color: '#276749', fontSize: 16, marginBottom: 8 }}>✅ Data Shared</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #9ae6b4', wordBreak: 'break-all', marginBottom: 10 }}>{generatedToken}</div>
          <button onClick={() => handleCopy(generatedToken)} style={{ padding: '8px 20px', borderRadius: 7, background: '#38a169', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            {copied ? '✅ Copied!' : '📋 Copy Token'}
          </button>
          <div style={{ fontSize: 13, color: '#4a5568', marginTop: 10 }}><strong>{selectedExpert?.name}</strong> will see this share automatically in Shared With Me. The token remains available as a fallback.</div>
        </div>
      )}

      {/* Existing Tokens */}
      {tokens.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, color: '#4a5568', fontSize: 15, marginBottom: 10 }}>Your Shares</div>
          {tokens.map((t) => {
            const exp = new Date(t.expiresAt);
            const expired = exp.getTime() <= Date.now();
            const active = t.status === 'active' && !expired;
            return (
              <div key={t.tokenId} style={{ background: active ? '#f7fafc' : '#fff5f5', border: `1px solid ${active ? '#e2e8f0' : '#fed7d7'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#2d3748', fontSize: 14 }}>
                    👤 {t.expertName || t.expertUid} {!active && <span style={{ color: '#e53e3e', fontSize: 12, fontWeight: 400 }}>· {t.status === 'revoked' ? 'REVOKED' : 'EXPIRED'}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 3 }}>
                    Categories: {t.shareAllCategories ? 'All categories' : t.categories.join(', ')} · Expires: {exp.toLocaleDateString()}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#a0aec0', marginTop: 4 }}>{t.tokenId}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {active && <button onClick={() => handleCopy(t.tokenId)} style={{ padding: '4px 10px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Copy</button>}
                  {active && <button onClick={() => handleRevoke(t.tokenId)} style={{ padding: '4px 10px', borderRadius: 6, background: '#e53e3e', color: '#fff', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Revoke</button>}
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
