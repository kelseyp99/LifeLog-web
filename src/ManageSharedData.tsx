import {useCallback, useEffect, useState} from 'react';
import {
  callExpertWorkflow,
  type ShareTokenRecord,
} from './expertSharing';

export default function ManageSharedData() {
  const [shares, setShares] = useState<ShareTokenRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');

  const fetchShares = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await callExpertWorkflow<{shares: ShareTokenRecord[]}>(
        'listOwnerShares'
      );
      setShares(result.shares);
    } catch (caught) {
      setError(caught instanceof Error ?
        caught.message : 'Shared data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchShares();
  }, [fetchShares]);

  const handleRevoke = async (tokenId: string) => {
    if (!window.confirm('Revoke this share immediately?')) return;
    setWorking(tokenId);
    setError('');
    try {
      await callExpertWorkflow('revokeShare', {tokenId});
      await fetchShares();
    } catch (caught) {
      setError(caught instanceof Error ?
        caught.message : 'Share could not be revoked.');
    } finally {
      setWorking('');
    }
  };

  return (
    <div style={{maxWidth: 820, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24}}>
      <h2>Manage Shared Data</h2>
      <p style={{color: '#718096'}}>Revoking a share immediately blocks future expert data reads, notes, and advice.</p>
      {loading && <div>Loading...</div>}
      {error && <div style={{color: '#c53030', marginBottom: 12}}>{error}</div>}
      {shares.length === 0 && !loading && <div>No shared data found.</div>}
      {shares.length > 0 && (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 16, minWidth: 650}}>
            <thead>
              <tr>
                <th style={headerStyle}>Expert</th>
                <th style={headerStyle}>Categories</th>
                <th style={headerStyle}>Created</th>
                <th style={headerStyle}>Expiration</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share) => {
                const expired = new Date(share.expiresAt).getTime() <= Date.now();
                const active = share.status === 'active' && !expired;
                return (
                  <tr key={share.tokenId} style={{background: active ? '#fff' : '#f9f9f9'}}>
                    <td style={cellStyle}>{share.expertName || share.expertUid}</td>
                    <td style={cellStyle}>{share.shareAllCategories ? 'All categories' : share.categories.join(', ')}</td>
                    <td style={cellStyle}>{new Date(share.createdAt).toLocaleDateString()}</td>
                    <td style={cellStyle}>{new Date(share.expiresAt).toLocaleDateString()}</td>
                    <td style={cellStyle}>{share.status === 'revoked' ? 'Revoked' : expired ? 'Expired' : 'Active'}</td>
                    <td style={cellStyle}>
                      {active ? (
                        <button
                          onClick={() => void handleRevoke(share.tokenId)}
                          disabled={working === share.tokenId}
                          style={{color: '#e53e3e', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700}}
                        >
                          {working === share.tokenId ? 'Revoking…' : 'Revoke'}
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const headerStyle = {textAlign: 'left' as const, padding: '10px 8px', borderBottom: '2px solid #e2e8f0', color: '#4a5568'};
const cellStyle = {padding: '10px 8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' as const};
