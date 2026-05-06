import React, { useEffect, useState } from 'react';

import ShareToken from './ShareToken';
import HireExpertModal from './HireExpertModal';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

type Expert = {
  name: string;
  type: string;
  specialty: string;
  pricePerReview: number;
  bio?: string;
  avatarEmoji?: string;
  contactEmail?: string;
  website?: string;
  isFirestore?: boolean;
};

const EXPERT_TYPES = ['Dietitian', 'Therapist', 'Coach', 'Trainer', 'Other'];

const DEMO_EXPERTS = [
  { name: 'Alice',   title: 'Dietitian',  specialties: 'Nutrition',        costPerReview: '$15', avatarEmoji: '👩‍⚕️' },
  { name: 'Bob',     title: 'Therapist',  specialties: 'CBT',              costPerReview: '$20', avatarEmoji: '🧠' },
  { name: 'Carlos',  title: 'Coach',      specialties: 'Life Coaching',    costPerReview: '$10', avatarEmoji: '👨‍💼' },
  { name: 'Diana',   title: 'Dietitian',  specialties: 'Sports Nutrition', costPerReview: '$18', avatarEmoji: '🥗' },
  { name: 'Eve',     title: 'Trainer',    specialties: 'Fitness',          costPerReview: '$12', avatarEmoji: '🏋️' },
  { name: 'Frank',   title: 'Coach',      specialties: 'Career',           costPerReview: '$14', avatarEmoji: '👨‍💼' },
  { name: 'Grace',   title: 'Therapist',  specialties: 'Family Therapy',   costPerReview: '$22', avatarEmoji: '🧑‍⚕️' },
  { name: 'Heidi',   title: 'Dietitian',  specialties: 'Pediatrics',       costPerReview: '$16', avatarEmoji: '👩‍⚕️' },
  { name: 'Ivan',    title: 'Other',      specialties: 'Wellness',         costPerReview: '$8',  avatarEmoji: '🧘' },
  { name: 'Judy',    title: 'Trainer',    specialties: 'Yoga',             costPerReview: '$11', avatarEmoji: '🧘' },
  { name: 'Karl',    title: 'Dietitian',  specialties: 'Diabetes',         costPerReview: '$17', avatarEmoji: '💊' },
  { name: 'Liam',    title: 'Coach',      specialties: 'Executive',        costPerReview: '$19', avatarEmoji: '👨‍💼' },
  { name: 'Mallory', title: 'Therapist',  specialties: 'Trauma',           costPerReview: '$25', avatarEmoji: '🧠' },
  { name: 'Niaj',    title: 'Other',      specialties: 'Mindfulness',      costPerReview: '$9',  avatarEmoji: '🧘' },
  { name: 'Olivia',  title: 'Dietitian',  specialties: 'Weight Loss',      costPerReview: '$13', avatarEmoji: '👩‍⚕️' },
  { name: 'Peggy',   title: 'Coach',      specialties: 'Relationships',    costPerReview: '$12', avatarEmoji: '👩‍💼' },
  { name: 'Quentin', title: 'Trainer',    specialties: 'Strength',         costPerReview: '$15', avatarEmoji: '🏋️' },
  { name: 'Rupert',  title: 'Therapist',  specialties: 'Anxiety',          costPerReview: '$21', avatarEmoji: '🧠' },
  { name: 'Sybil',   title: 'Dietitian',  specialties: 'Geriatrics',       costPerReview: '$16', avatarEmoji: '👩‍⚕️' },
  { name: 'Trent',   title: 'Other',      specialties: 'Sleep',            costPerReview: '$10', avatarEmoji: '👤' },
  { name: 'Uma',     title: 'Dietitian',  specialties: 'Digestive Health', costPerReview: '$18', avatarEmoji: '🥗' },
  { name: 'Victor',  title: 'Coach',      specialties: 'Motivation',       costPerReview: '$11', avatarEmoji: '👨‍💼' },
  { name: 'Walter',  title: 'Trainer',    specialties: 'Cardio',           costPerReview: '$13', avatarEmoji: '🏋️' },
  { name: 'Xavier',  title: 'Therapist',  specialties: 'Depression',       costPerReview: '$23', avatarEmoji: '🧠' },
  { name: 'Yvonne',  title: 'Dietitian',  specialties: 'Prenatal',         costPerReview: '$17', avatarEmoji: '👩‍⚕️' },
  { name: 'Zara',    title: 'Coach',      specialties: 'Wellness',         costPerReview: '$10', avatarEmoji: '🧘' },
];

const ExpertList: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<'table' | 'tile'>('table');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [expertToShare, setExpertToShare] = useState<Expert | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [readyToShare, setReadyToShare] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadExperts = async () => {
    try {
      const snap = await getDocs(collection(db, 'experts'));
      const loaded: Expert[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (!data.isExpert) return;
        let price = 0;
        if (data.costPerReview) {
          const cleaned = data.costPerReview.toString().replace(/[^0-9.]/g, '');
          price = cleaned ? parseFloat(cleaned) : 0;
        }
        loaded.push({
          name: data.name || 'Unknown',
          type: data.title || 'Other',
          specialty: data.specialties || '',
          pricePerReview: price,
          bio: data.bio || '',
          avatarEmoji: data.avatarEmoji || '👤',
          contactEmail: data.contactEmail || '',
          website: data.website || '',
          isFirestore: true,
        });
      });
      setExperts(loaded);
    } catch (e) {
      setExperts([]);
    }
  };

  useEffect(() => { loadExperts(); }, []);

  const handleSeedDemoExperts = async () => {
    setSeeding(true);
    try {
      for (const e of DEMO_EXPERTS) {
        const id = `static_${e.name.toLowerCase()}`;
        await setDoc(doc(db, 'experts', id), { ...e, isExpert: true, bio: '', contactEmail: '', website: '', uid: id });
      }
      await loadExperts();
    } catch (err) {
      alert('Seeding failed — make sure you are signed in.');
    }
    setSeeding(false);
  };

  const filteredExperts = React.useMemo(() => {
    let filtered = experts;
    if (typeFilter) {
      filtered = filtered.filter(e => e.type === typeFilter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(s) ||
        e.specialty.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [experts, typeFilter, search]);

  const sortedExperts = React.useMemo(() => {
    const sorted = [...filteredExperts].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    return sorted;
  }, [filteredExperts, sortAsc]);

  return (
  <div className="expert-list">
      <h2>Experts</h2>
      {experts.length === 0 && !seeding && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fffbea', border: '1px solid #f6e05e', borderRadius: 8 }}>
          <span style={{ color: '#744210', fontSize: 14 }}>No experts found in database. </span>
          <button onClick={handleSeedDemoExperts} style={{ marginLeft: 8, padding: '4px 14px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Seed Demo Experts
          </button>
        </div>
      )}
      {seeding && <div style={{ marginBottom: 12, color: '#3182ce', fontWeight: 600 }}>⏳ Seeding demo experts into Firestore…</div>}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
          <option value="">All Types</option>
          {EXPERT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 180 }}
        />
        <button
          style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
          onClick={() => setSortAsc((asc) => !asc)}
        >
          Sort: {sortAsc ? 'A → Z' : 'Z → A'}
        </button>
        <button
          style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #3182ce', background: view === 'table' ? '#3182ce' : '#fff', color: view === 'table' ? '#fff' : '#3182ce', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setView('table')}
        >Table View</button>
        <button
          style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #3182ce', background: view === 'tile' ? '#3182ce' : '#fff', color: view === 'tile' ? '#fff' : '#3182ce', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setView('tile')}
        >Tile View</button>
      </div>
      {view === 'table' ? (
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Name</th>
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Price</th>
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Type</th>
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Specialty</th>
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedExperts.map((e, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{e.name}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>${e.pricePerReview} per review</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{e.type}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{e.specialty}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                    <button style={{ padding: '4px 10px', borderRadius: 4, background: '#3182ce', color: '#fff', border: 'none', cursor: 'pointer', marginRight: 8 }}
                      onClick={() => { setExpertToShare(e); setShowHireModal(true); }}>
                      Hire
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 16 }}>
          {sortedExperts.map((e, index) => (
            <div key={index} style={{ minWidth: 180, maxWidth: 220, flex: '1 0 180px', background: '#f7fafc', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#2d3748', marginBottom: 6 }}>{e.name}</div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#3182ce', margin: '8px 0' }}>${e.pricePerReview} per review</div>
              <div style={{ fontWeight: 500, fontSize: 15, color: '#3182ce', marginBottom: 2 }}>{e.type}</div>
              <div style={{ fontSize: 14, color: '#4a5568' }}>{e.specialty}</div>
              <button style={{ marginTop: 4, padding: '4px 10px', borderRadius: 4, background: '#3182ce', color: '#fff', border: 'none', cursor: 'pointer' }}
                onClick={() => { setExpertToShare(e); setShowHireModal(true); }}>
                Hire
              </button>
            </div>
          ))}
        </div>
      )}
      {showHireModal && expertToShare && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #aaa', padding: 32, minWidth: 420, maxWidth: 480, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => setShowHireModal(false)}>&times;</button>
            <HireExpertModal
              expert={expertToShare}
              onClose={() => setShowHireModal(false)}
              onHired={() => { setShowHireModal(false); setReadyToShare(true); setShowShareDialog(true); }}
            />
          </div>
        </div>
      )}
      {showShareDialog && expertToShare && readyToShare && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #aaa', padding: 32, minWidth: 420, maxWidth: 480, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => { setShowShareDialog(false); setReadyToShare(false); }}>&times;</button>
            <ShareToken userId={"demoUser"} preselectedExpert={expertToShare.name} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertList;
