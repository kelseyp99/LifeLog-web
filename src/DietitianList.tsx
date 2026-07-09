import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { ShareToken } from './ShareToken';
import { logGenerateLead, logSearch, logSelectContent } from './analytics';

interface DietitianListProps {
  user: User | null;
}

const DEMO_EXPERTS = [
  { id: 'static_1', isExpert: true, name: 'Dr. Sarah Johnson', title: 'Registered Dietitian', bio: 'Specializing in plant-based nutrition and weight management with 12 years of experience.', specialties: 'Nutrition,Weight Loss,Plant-Based', costPerReview: '$45', avatarEmoji: '👩‍⚕️', contactEmail: 'sarah@example.com', website: '' },
  { id: 'static_2', isExpert: true, name: 'Dr. Michael Chen', title: 'Sports Nutritionist', bio: 'Helping athletes optimize performance through evidence-based nutrition strategies.', specialties: 'Sports Nutrition,Performance,Recovery', costPerReview: '$60', avatarEmoji: '🏋️', contactEmail: 'michael@example.com', website: '' },
  { id: 'static_3', isExpert: true, name: 'Dr. Emily Rodriguez', title: 'Sleep Specialist', bio: 'Board-certified sleep medicine physician focused on improving sleep quality and health outcomes.', specialties: 'Sleep,Insomnia,Circadian Rhythm', costPerReview: 'Free', avatarEmoji: '🧠', contactEmail: 'emily@example.com', website: '' },
  { id: 'static_4', isExpert: true, name: 'Dr. James Wilson', title: 'Cardiologist', bio: 'Preventive cardiology specialist helping patients reduce cardiovascular risk through lifestyle changes.', specialties: 'Heart Health,Cholesterol,Hypertension', costPerReview: '$80', avatarEmoji: '🫀', contactEmail: 'james@example.com', website: '' },
  { id: 'static_5', isExpert: true, name: 'Dr. Lisa Park', title: 'Endocrinologist', bio: 'Diabetes and metabolic health specialist with a focus on reversing type 2 diabetes.', specialties: 'Diabetes,Thyroid,Metabolic Health', costPerReview: '$70', avatarEmoji: '💊', contactEmail: 'lisa@example.com', website: '' },
  { id: 'static_6', isExpert: true, name: 'Dr. Tom Bradley', title: 'Wellness Coach', bio: 'Holistic health coach integrating mind-body practices for sustainable wellness.', specialties: 'Wellness,Stress,Mindfulness', costPerReview: 'Free', avatarEmoji: '🧘', contactEmail: 'tom@example.com', website: '' },
];

function isFree(cost: string) {
  if (!cost) return true;
  const c = cost.trim().toLowerCase().replace(/\$/g, '');
  return c === '' || c === '0' || c === 'free';
}

export const DietitianList: React.FC<DietitianListProps> = ({ user }) => {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('__ALL__');
  const [seeding, setSeeding] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'experts'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((e: any) => e.isExpert);
      setExperts(data);
    } catch {
      setExperts([]);
    }
    setLoading(false);
  };

  const handleSeedDemoExperts = async () => {
    setSeeding(true);
    for (const e of DEMO_EXPERTS) {
      await setDoc(doc(db, 'experts', e.id), e);
    }
    await fetchExperts();
    setSeeding(false);
  };

  const allSpecialties = Array.from(new Set(
    experts.flatMap((e: any) => (e.specialties || '').split(',').map((s: string) => s.trim()).filter(Boolean))
  )) as string[];

  const filtered = experts.filter((e: any) => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.bio?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === '__ALL__' || (e.specialties || '').includes(specFilter);
    return matchSearch && matchSpec;
  });

  useEffect(() => {
    if (!search.trim()) return;
    const timeout = window.setTimeout(() => {
      logSearch(search.trim(), 'expert_directory');
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [search]);

  // If an expert is selected, show ShareToken for that expert
  if (selectedExpert) {
    return (
      <div style={{ maxWidth: 700, margin: '32px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
        <button onClick={() => setSelectedExpert(null)}
          style={{ marginBottom: 20, padding: '8px 18px', borderRadius: 8, background: '#e2e8f0', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#4a5568' }}>
          ← Back to Experts
        </button>
        <div style={{ background: '#ebf8ff', border: '2px solid #bee3f8', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 48 }}>{selectedExpert.avatarEmoji || '👤'}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: '#1a365d' }}>{selectedExpert.name}</div>
            <div style={{ color: '#3182ce', fontWeight: 600, fontSize: 14 }}>{selectedExpert.title}</div>
            {isFree(selectedExpert.costPerReview)
              ? <span style={{ background: '#c6f6d5', color: '#276749', fontWeight: 800, fontSize: 13, borderRadius: 8, padding: '3px 10px', marginTop: 4, display: 'inline-block' }}>🎁 Free</span>
              : <span style={{ background: '#fefcbf', color: '#744210', fontWeight: 800, fontSize: 13, borderRadius: 8, padding: '3px 10px', marginTop: 4, display: 'inline-block' }}>{selectedExpert.costPerReview} / review</span>
            }
          </div>
        </div>
        {!user
          ? <div style={{ padding: '20px 24px', background: '#fff5f5', border: '2px solid #fc8181', borderRadius: 12, color: '#c53030', fontWeight: 700, textAlign: 'center' }}>
              🔒 You must be signed in to share your data with an expert.<br />
              <span style={{ fontWeight: 400, fontSize: 13 }}>Use the Sign in with Google button at the top of the page.</span>
            </div>
          : <ShareToken user={user} preselectedExpert={selectedExpert} />
        }
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2d3748', marginBottom: 4 }}>🏥 Expert Directory</h2>
      <p style={{ color: '#718096', marginBottom: 20, fontSize: 14 }}>Browse certified experts and share your data securely.</p>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or keyword…"
          style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }} />
        <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}>
          <option value="__ALL__">All Specialties</option>
          {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0' }}>Loading experts…</div>}

      {!loading && experts.length === 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#744210', marginBottom: 8 }}>No experts found in the directory.</div>
          <button onClick={handleSeedDemoExperts} disabled={seeding}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#d69e2e', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: seeding ? 0.7 : 1 }}>
            {seeding ? '⏳ Seeding…' : '🌱 Seed Demo Experts'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {filtered.map((e: any) => (
          <div key={e.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 42, lineHeight: 1 }}>{e.avatarEmoji || '👤'}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a365d' }}>{e.name}</div>
                <div style={{ fontSize: 13, color: '#3182ce', fontWeight: 600 }}>{e.title}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.5, margin: 0, flexGrow: 1 }}>{e.bio}</p>
            {e.specialties && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {e.specialties.split(',').map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
                  <span key={s} style={{ background: '#ebf8ff', color: '#2b6cb0', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px' }}>{s}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              {isFree(e.costPerReview)
                ? <span style={{ background: '#c6f6d5', color: '#276749', fontWeight: 800, fontSize: 13, borderRadius: 8, padding: '4px 12px' }}>🎁 Free</span>
                : <span style={{ background: '#fefcbf', color: '#744210', fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '4px 12px' }}>{e.costPerReview} / review</span>
              }
              <button onClick={() => {
                setSelectedExpert(e);
                logSelectContent('expert', e.id || e.name || 'expert');
                logGenerateLead('expert_hire_intent', Number.parseFloat(String(e.costPerReview || '').replace(/[^0-9.]/g, '')) || undefined);
              }}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Hire 🔗
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietitianList;
