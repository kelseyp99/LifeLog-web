import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface ProfileData {
  [key: string]: any;
}

interface ProfileProps {
  user: User | null;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ProfileData>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setForm({});
        return;
      }
      setLoading(true);
      try {
        const profileRef = doc(db, `Users/${user.uid}/Profile`, 'profile');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
          setForm(profileSnap.data());
        } else {
          setProfile(null);
          setForm({});
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfile(null);
        setForm({});
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return <div style={{ color: 'salmon', textAlign: 'center', marginTop: 32 }}>Please sign in to view your profile.</div>;
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 32 }}>Loading...</div>;
  }

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: ProfileData) => ({ ...prev, [name]: value }));
  };

  // Save or update profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user) return;
    try {
      const profileRef = doc(db, `Users/${user.uid}/Profile`, 'profile');
      if (profile) {
        await updateDoc(profileRef, form);
      } else {
        await setDoc(profileRef, form);
      }
      setEditMode(false);
      setProfile(form);
    } catch (err) {
      setFormError('Failed to save profile.');
    }
  };

  // Delete profile
  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm('Delete your profile?')) return;
    try {
      const profileRef = doc(db, `Users/${user.uid}/Profile`, 'profile');
      await deleteDoc(profileRef);
      setProfile(null);
      setForm({});
      setEditMode(false);
    } catch (err) {
      setFormError('Failed to delete profile.');
    }
  };

  if (!profile && !editMode) {
    return (
      <div style={{ textAlign: 'center', marginTop: 32, color: '#a0aec0' }}>
        No profile data found.<br />
        <button onClick={() => setEditMode(true)} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', color: '#2d3748', marginBottom: 24 }}>Profile</h2>
      {formError && <div style={{ color: 'red', marginBottom: 12 }}>{formError}</div>}
      {editMode ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Render fields dynamically, or specify common ones below */}
          {Object.keys(profile || form).length === 0 && (
            <>
              <input name="name" placeholder="Name" value={form.name || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} required />
              <input name="email" placeholder="Email" value={form.email || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} required />
            </>
          )}
          {Object.entries(profile || form).map(([key]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ width: 100, fontWeight: 600 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input name={key} value={form[key] || ''} onChange={handleFormChange} style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>Save</button>
            <button type="button" onClick={() => { setEditMode(false); setForm(profile || {}); }} style={{ padding: '8px 20px', borderRadius: 6, background: '#a0aec0', color: '#fff', border: 'none', fontWeight: 600 }}>Cancel</button>
            {profile && <button type="button" onClick={handleDelete} style={{ padding: '8px 20px', borderRadius: 6, background: '#e53e3e', color: '#fff', border: 'none', fontWeight: 600 }}>Delete</button>}
          </div>
        </form>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(profile || {}).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                  <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => setEditMode(true)} style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>Edit Profile</button>
          </div>
        </>
      )}
    </div>
  );
};
