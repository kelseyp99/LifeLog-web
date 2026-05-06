// filepath: /Users/tinman/Projects/LifeLog/web2/src/ExpertProfile.tsx
import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface ExpertProfileProps {
  user: User | null;
}

export interface ExpertProfileData {
  isExpert: boolean;
  name: string;
  title: string;
  bio: string;
  specialties: string;
  costPerReview: string; // "0", "Free", or "$25", etc.
  avatarEmoji: string;
  contactEmail: string;
  website: string;
}

const DEFAULT: ExpertProfileData = {
  isExpert: false,
  name: '',
  title: '',
  bio: '',
  specialties: '',
  costPerReview: '',
  avatarEmoji: '👤',
  contactEmail: '',
  website: '',
};

const EMOJIS = ['👤','👨‍⚕️','👩‍⚕️','🧑‍⚕️','👨‍🔬','👩‍🔬','🧑‍🔬','👨‍💼','👩‍💼','🧑‍💼','🏋️','🧘','🥗','💊','🫀','🧠','🦷','👁️'];

function isFree(cost: string) {
  if (!cost) return true;
  const c = cost.trim().toLowerCase().replace(/\$/g, '');
  return c === '' || c === '0' || c === 'free';
}

export const ExpertProfile: React.FC<ExpertProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<ExpertProfileData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getDoc(doc(db, `Users/${user.uid}/Profile/expert`))
      .then(snap => {
        if (snap.exists()) setProfile({ ...DEFAULT, ...snap.data() as ExpertProfileData });
        else setProfile({ ...DEFAULT, name: user.displayName || '', contactEmail: user.email || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (field: keyof ExpertProfileData, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    // Save to user's private profile
    await setDoc(doc(db, `Users/${user.uid}/Profile/expert`), profile);
    // Also write to top-level experts collection so DietitianList can find it
    if (profile.isExpert) {
      await setDoc(doc(db, `experts/${user.uid}`), { ...profile, uid: user.uid });
    } else {
      // If they turned off isExpert, remove from public directory
      await setDoc(doc(db, `experts/${user.uid}`), { isExpert: false, uid: user.uid });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return <div style={{ padding: 32, color: '#a0aec0' }}>Please sign in to manage your expert profile.</div>;
  if (loading) return <div style={{ padding: 32, color: '#a0aec0' }}>Loading…</div>;

  const free = isFree(profile.costPerReview);

  return (
    <div style={{ maxWidth: 760, margin: '32px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d3748', marginBottom: 4 }}>Expert Profile</h2>
      <p style={{ color: '#718096', marginBottom: 24, fontSize: 14 }}>Set up your public expert listing so clients can find and share data with you.</p>

      {/* Is Expert toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: profile.isExpert ? '#ebf8ff' : '#f7fafc', border: `2px solid ${profile.isExpert ? '#3182ce' : '#e2e8f0'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 28, cursor: 'pointer' }}
        onClick={() => handleChange('isExpert', !profile.isExpert)}>
        <div style={{ width: 46, height: 26, borderRadius: 13, background: profile.isExpert ? '#3182ce' : '#cbd5e1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 3, left: profile.isExpert ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: profile.isExpert ? '#2b6cb0' : '#4a5568' }}>
            {profile.isExpert ? '✅ I am an Expert' : 'I am an Expert'}
          </div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Enable this to appear in the expert directory and receive client data shares</div>
        </div>
      </div>

      {profile.isExpert && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={() => setPreviewMode(false)} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', fontWeight: 700, cursor: 'pointer', background: !previewMode ? '#3182ce' : '#e2e8f0', color: !previewMode ? '#fff' : '#4a5568' }}>✏️ Edit</button>
            <button onClick={() => setPreviewMode(true)} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', fontWeight: 700, cursor: 'pointer', background: previewMode ? '#3182ce' : '#e2e8f0', color: previewMode ? '#fff' : '#4a5568' }}>👁️ Preview Card</button>
          </div>

          {previewMode ? (
            /* PREVIEW CARD */
            <div style={{ background: 'linear-gradient(135deg, #ebf8ff 0%, #e9d8fd 100%)', border: '2px solid #bee3f8', borderRadius: 18, padding: 28, maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 52, lineHeight: 1 }}>{profile.avatarEmoji}</div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: '#1a365d' }}>{profile.name || 'Your Name'}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#3182ce', marginTop: 2 }}>{profile.title || 'Your Title'}</div>
                </div>
              </div>
              <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{profile.bio || 'Your bio will appear here…'}</p>
              {profile.specialties && (
                <div style={{ marginBottom: 12 }}>
                  {profile.specialties.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} style={{ display: 'inline-block', background: '#bee3f8', color: '#2b6cb0', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, marginRight: 6, marginBottom: 4 }}>{s}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #bee3f8' }}>
                <div>
                  {profile.contactEmail && <div style={{ fontSize: 12, color: '#718096' }}>✉️ {profile.contactEmail}</div>}
                  {profile.website && <div style={{ fontSize: 12, color: '#3182ce', marginTop: 2 }}>🔗 {profile.website}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {free
                    ? <span style={{ background: '#c6f6d5', color: '#276749', fontWeight: 900, fontSize: 18, borderRadius: 10, padding: '6px 18px' }}>🎁 Free</span>
                    : <span style={{ background: '#fefcbf', color: '#744210', fontWeight: 900, fontSize: 18, borderRadius: 10, padding: '6px 18px' }}>{profile.costPerReview} / review</span>
                  }
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Avatar emoji picker */}
              <div>
                <label style={labelStyle}>Avatar Emoji</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => handleChange('avatarEmoji', e)}
                      style={{ fontSize: 28, background: profile.avatarEmoji === e ? '#bee3f8' : '#f7fafc', border: profile.avatarEmoji === e ? '2px solid #3182ce' : '2px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Display Name *</label>
                  <input value={profile.name} onChange={e => handleChange('name', e.target.value)} placeholder="Dr. Jane Smith" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Title / Role *</label>
                  <input value={profile.title} onChange={e => handleChange('title', e.target.value)} placeholder="Registered Dietitian" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Bio</label>
                <textarea value={profile.bio} onChange={e => handleChange('bio', e.target.value)} rows={3}
                  placeholder="Tell clients about your background, experience, and how you can help…"
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div>
                <label style={labelStyle}>Specialties <span style={{ color: '#a0aec0', fontWeight: 400 }}>(comma-separated)</span></label>
                <input value={profile.specialties} onChange={e => handleChange('specialties', e.target.value)}
                  placeholder="Nutrition, Weight Loss, Diabetes, Sleep" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Contact Email</label>
                  <input value={profile.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} placeholder="jane@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input value={profile.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://yoursite.com" style={inputStyle} />
                </div>
              </div>

              <div style={{ maxWidth: 220 }}>
                <label style={labelStyle}>Cost Per Review</label>
                <input value={profile.costPerReview} onChange={e => handleChange('costPerReview', e.target.value)}
                  placeholder="e.g. $25  or  0  or  Free" style={inputStyle} />
                <div style={{ fontSize: 12, color: free ? '#38a169' : '#d69e2e', marginTop: 4, fontWeight: 600 }}>
                  {free ? '🎁 Will show as FREE — no payment required' : `💳 Clients will see: ${profile.costPerReview} / review`}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '11px 32px', borderRadius: 9, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving…' : '💾 Save Profile'}
            </button>
            {saved && <span style={{ color: '#38a169', fontWeight: 700 }}>✅ Saved!</span>}
          </div>
        </>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 700, color: '#4a5568', fontSize: 13, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', fontFamily: 'sans-serif' };
