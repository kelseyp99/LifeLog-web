import { useState } from 'react';

export default function ExpertPayout({ payoutAmount, expertName }: { payoutAmount: number, expertName: string }) {
  const [status, setStatus] = useState('pending');

  const handlePayout = () => {
    setStatus('processing');
    // Simulate payout processing
    setTimeout(() => {
      setStatus('completed');
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 400, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2>Payout to {expertName}</h2>
      <div style={{ marginBottom: 12 }}><strong>Amount:</strong> ${payoutAmount.toFixed(2)}</div>
      {status === 'pending' && (
        <button style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }} onClick={handlePayout}>
          Process Payout
        </button>
      )}
      {status === 'processing' && <div style={{ color: '#888' }}>Processing payout...</div>}
      {status === 'completed' && <div style={{ color: 'green' }}>Payout completed!</div>}
    </div>
  );
}
