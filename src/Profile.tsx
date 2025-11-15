import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      setLoading(true);
      try {
        // Fetch from Users/{uid}/Profile/profile
        const profileRef = doc(db, `Users/${user.uid}/Profile`, 'profile');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfile(null);
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

  if (!profile) {
    return <div style={{ textAlign: 'center', marginTop: 32, color: '#a0aec0' }}>No profile data found.</div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', color: '#2d3748', marginBottom: 24 }}>Profile</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {Object.entries(profile).map(([key, value]) => (
            <tr key={key}>
              <td style={{ fontWeight: 600, color: '#4a5568', padding: '8px 12px', textAlign: 'right', width: '40%' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
              <td style={{ color: '#2d3748', padding: '8px 12px', textAlign: 'left' }}>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
