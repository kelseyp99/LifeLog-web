import {useCallback, useEffect, useState} from 'react';
import type {User} from 'firebase/auth';
import {ExpertDataDialog} from './ExpertDataDialog';
import {logEvent} from './analytics';
import {
  callExpertWorkflow,
  type ExpertShareSummary,
  type ShareTokenRecord,
  type SharedActivityRecord,
} from './expertSharing';

interface ExpertTokenViewProps {
  user: User | null;
}

interface SharedDataResponse {
  share: ShareTokenRecord;
  records: SharedActivityRecord[];
}

export const ExpertTokenView = ({user}: ExpertTokenViewProps) => {
  const [shares, setShares] = useState<ExpertShareSummary[]>([]);
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedShare, setSelectedShare] = useState<ShareTokenRecord | null>(null);
  const [selectedOwnerName, setSelectedOwnerName] = useState('');

  const loadShares = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const result = await callExpertWorkflow<{shares: ExpertShareSummary[]}>(
        'listSharedWithMe'
      );
      setShares(result.shares);
    } catch (caught) {
      setError(caught instanceof Error ?
        caught.message : 'Assigned shares could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadShares();
  }, [loadShares]);

  const openShare = async (tokenId: string, ownerDisplayName = '') => {
    setLoading(true);
    setError('');
    try {
      const result = await callExpertWorkflow<SharedDataResponse>(
        'getSharedData',
        {tokenId}
      );
      setSelectedShare(result.share);
      setSelectedOwnerName(ownerDisplayName ||
        `User …${result.share.ownerUid.slice(-6)}`);
      logEvent('share_token_opened', {
        categories_count: result.share.categories.length,
      });
    } catch (caught) {
      setError(caught instanceof Error ?
        caught.message : 'This share cannot be opened.');
      await loadShares();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const tokenId = tokenInput.trim();
    if (tokenId) void openShare(tokenId);
  };

  if (!user) {
    return <div style={{padding: 32}}>Sign in as an approved expert.</div>;
  }

  return (
    <div style={{maxWidth: 820, margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif'}}>
      <h2 style={{fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', marginBottom: 8}}>Shared With Me</h2>
      <p style={{color: '#718096', marginBottom: 24}}>Active shares assigned to your approved expert account. Access is checked again whenever you open data, save a note, or post advice.</p>

      {error && <div style={{color: '#c53030', background: '#fff5f5', borderRadius: 8, padding: 12, marginBottom: 16, fontWeight: 600}}>{error}</div>}
      {loading && <div style={{color: '#718096', marginBottom: 16}}>Loading…</div>}

      <div style={{fontWeight: 800, color: '#4a5568', marginBottom: 10}}>Active shares</div>
      {!loading && shares.length === 0 && (
        <div style={{padding: 20, background: '#f7fafc', borderRadius: 10, color: '#718096', marginBottom: 24}}>No users have active shares assigned to you.</div>
      )}
      {shares.map((share) => (
        <button
          key={share.tokenId}
          onClick={() => void openShare(share.tokenId, share.ownerDisplayName)}
          style={{display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 10, background: '#fff', borderRadius: 10, border: '1px solid #bee3f8', cursor: 'pointer'}}
        >
          <div style={{fontWeight: 800, fontSize: 16, color: '#1a365d'}}>{share.ownerDisplayName}</div>
          <div style={{fontSize: 13, color: '#4a5568', marginTop: 5}}>Categories: {share.shareAllCategories ? 'All categories' : share.categories.join(', ')}</div>
          <div style={{fontSize: 12, color: '#718096', marginTop: 3}}>Shared {new Date(share.createdAt).toLocaleDateString()} · Expires {new Date(share.expiresAt).toLocaleDateString()}</div>
        </button>
      ))}

      <div style={{marginTop: 28, borderTop: '1px solid #e2e8f0', paddingTop: 20}}>
        <div style={{fontWeight: 800, color: '#4a5568', marginBottom: 8}}>Manual token lookup</div>
        <form onSubmit={handleSubmit} style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <input
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Paste share token"
            style={{flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15}}
          />
          <button type="submit" disabled={loading || !tokenInput.trim()} style={{padding: '10px 22px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer'}}>
            Open share
          </button>
        </form>
      </div>

      {selectedShare && (
        <ExpertDataDialog
          open
          onClose={() => {
            setSelectedShare(null);
            void loadShares();
          }}
          tokenDoc={selectedShare}
          expertName={user.displayName || user.email || ''}
          clientName={selectedOwnerName}
        />
      )}
    </div>
  );
};

export default ExpertTokenView;
