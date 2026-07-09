import { useState } from 'react';

export default function HireExpertModal({ expert, onClose, onHired }: { expert: any, onClose: () => void, onHired: (isFree: boolean) => void }) {
  const [accepted, setAccepted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleStripeMock = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
      onHired(false);
    }, 1500);
  };

  return (
    <div style={{ minWidth: 340, maxWidth: 420 }}>
      <h2>Hire {expert.name}</h2>
      <div style={{ marginBottom: 12, color: '#444' }}>
        <strong>Service:</strong> {expert.specialty} ({expert.type})<br />
        <strong>Price:</strong> {expert.pricePerReview === 0 ? 'Free' : `$${expert.pricePerReview} per review`}
      </div>
      <div style={{ fontSize: 14, marginBottom: 16, color: '#555', background: '#f7fafc', padding: 12, borderRadius: 8 }}>
        <strong>Terms:</strong> By hiring this expert, you agree to share selected data for review. Payment is non-refundable once the review is delivered. Your data will only be shared after payment is complete. Please review our <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a>.
      </div>
      <label style={{ display: 'block', marginBottom: 16 }}>
        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /> I accept the terms and conditions
      </label>
      {expert.pricePerReview === 0 ? (
        <button disabled={!accepted} style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}
          onClick={() => onHired(true)}>
          Proceed Free
        </button>
      ) : paid ? (
        <div style={{ color: 'green', marginBottom: 12 }}>Payment successful!</div>
      ) : paying ? (
        <button disabled style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>Processing...</button>
      ) : (
        <button disabled={!accepted} style={{ padding: '8px 20px', borderRadius: 6, background: '#635bff', color: '#fff', border: 'none', fontWeight: 600 }}
          onClick={handleStripeMock}>
          Pay with Stripe
        </button>
      )}
      <button onClick={onClose} style={{ marginLeft: 16, padding: '8px 20px', borderRadius: 6, background: '#eee', color: '#333', border: 'none', fontWeight: 600 }}>Cancel</button>
    </div>
  );
}
