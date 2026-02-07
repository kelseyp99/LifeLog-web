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
  const [isExpert, setIsExpert] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setForm({});
        setIsExpert(false);
        return;
      }
      setLoading(true);
      try {
        const profileRef = doc(db, `Users/${user.uid}/Profile`, 'profile');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
          setForm(profileSnap.data());
          setIsExpert(!!profileSnap.data().isExpert);
        } else {
          setProfile(null);
          setForm({});
          setIsExpert(false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfile(null);
        setForm({});
        setIsExpert(false);
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
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: ProfileData) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev: ProfileData) => ({ ...prev, [name]: value }));
    }
  };

  // Save or update profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user) return;
    try {
      const profileRef = doc(db, `Users/${user.uid}/Profile`, 'profile');
      const saveData = { ...form, isExpert };
      if (profile) {
        await updateDoc(profileRef, saveData);
      } else {
        await setDoc(profileRef, saveData);
      }
      setEditMode(false);
      setProfile(saveData);
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
          <input name="name" placeholder="Name" value={form.name || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} required />
          <input name="email" placeholder="Email" value={form.email || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} required />
          <textarea name="bio" placeholder="Short bio..." value={form.bio || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', minHeight: 60 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <input type="checkbox" checked={isExpert} onChange={e => setIsExpert(e.target.checked)} />
            I am an expert and want to advertise my services
          </label>
          {isExpert && (
            <>
              <select name="expertType" value={form.expertType || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} required>
                <option value="">Select expert type</option>
                <option value="Dietitian">Dietitian</option>
                <option value="Therapist">Therapist</option>
                <option value="Coach">Coach</option>
                <option value="Trainer">Trainer</option>
                <option value="Other">Other</option>
              </select>
              <input name="specialty" placeholder="Specialty" value={form.specialty || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} required />
              <input name="credentials" placeholder="Credentials (e.g., RD, LCSW)" value={form.credentials || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              <input name="availability" placeholder="Availability (e.g., M-F 9-5)" value={form.availability || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              <textarea name="expertDescription" placeholder="Describe your services..." value={form.expertDescription || ''} onChange={handleFormChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', minHeight: 60 }} />
            </>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" style={{ padding: '8px 20px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>Save</button>
            <button type="button" onClick={() => { setEditMode(false); setForm(profile || {}); setIsExpert(!!(profile && profile.isExpert)); }} style={{ padding: '8px 20px', borderRadius: 6, background: '#a0aec0', color: '#fff', border: 'none', fontWeight: 600 }}>Cancel</button>
            {profile && <button type="button" onClick={handleDelete} style={{ padding: '8px 20px', borderRadius: 6, background: '#e53e3e', color: '#fff', border: 'none', fontWeight: 600 }}>Delete</button>}
          </div>
        </form>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Name</td>
                <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile?.name || ''}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Email</td>
                <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile?.email || ''}</td>
              </tr>
              {profile?.bio && (
                <tr>
                  <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Bio</td>
                  <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile.bio}</td>
                </tr>
              )}
              {profile?.isExpert && (
                <>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Expert Type</td>
                    <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile.expertType}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Specialty</td>
                    <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile.specialty}</td>
                  </tr>
                  {profile.credentials && (
                    <tr>
                      <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Credentials</td>
                      <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile.credentials}</td>
                    </tr>
                  )}
                  {profile.availability && (
                    <tr>
                      <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Availability</td>
                      <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile.availability}</td>
                    </tr>
                  )}
                  {profile.expertDescription && (
                    <tr>
                      <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>Description</td>
                      <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{profile.expertDescription}</td>
                    </tr>
                  )}
                </>
              )}
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
