import React, { useEffect, useState } from 'react';

type Expert = {
  name: string;
  type: string;
  specialty: string;
};

const EXPERT_TYPES = ['Dietitian', 'Therapist', 'Coach', 'Trainer', 'Other'];

const initialExperts: Expert[] = [
  { name: 'Alice', type: 'Dietitian', specialty: 'Nutrition' },
  { name: 'Bob', type: 'Therapist', specialty: 'CBT' },
  { name: 'Carlos', type: 'Coach', specialty: 'Life Coaching' },
  { name: 'Diana', type: 'Dietitian', specialty: 'Sports Nutrition' },
  { name: 'Eve', type: 'Trainer', specialty: 'Fitness' },
  { name: 'Frank', type: 'Coach', specialty: 'Career' },
  { name: 'Grace', type: 'Therapist', specialty: 'Family Therapy' },
  { name: 'Heidi', type: 'Dietitian', specialty: 'Pediatrics' },
  { name: 'Ivan', type: 'Other', specialty: 'Wellness' },
  { name: 'Judy', type: 'Trainer', specialty: 'Yoga' },
  { name: 'Karl', type: 'Dietitian', specialty: 'Diabetes' },
  { name: 'Liam', type: 'Coach', specialty: 'Executive' },
  { name: 'Mallory', type: 'Therapist', specialty: 'Trauma' },
  { name: 'Niaj', type: 'Other', specialty: 'Mindfulness' },
  { name: 'Olivia', type: 'Dietitian', specialty: 'Weight Loss' },
  { name: 'Peggy', type: 'Coach', specialty: 'Relationships' },
  { name: 'Quentin', type: 'Trainer', specialty: 'Strength' },
  { name: 'Rupert', type: 'Therapist', specialty: 'Anxiety' },
  { name: 'Sybil', type: 'Dietitian', specialty: 'Geriatrics' },
  { name: 'Trent', type: 'Other', specialty: 'Sleep' },
  { name: 'Uma', type: 'Dietitian', specialty: 'Digestive Health' },
  { name: 'Victor', type: 'Coach', specialty: 'Motivation' },
  { name: 'Walter', type: 'Trainer', specialty: 'Cardio' },
  { name: 'Xavier', type: 'Therapist', specialty: 'Depression' },
  { name: 'Yvonne', type: 'Dietitian', specialty: 'Prenatal' },
  { name: 'Zara', type: 'Coach', specialty: 'Wellness' },
];

const ExpertList: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<'table' | 'tile'>('table');

  useEffect(() => {
    setExperts(initialExperts);
  }, []);

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
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Type</th>
                <th style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10, padding: '12px 24px', fontWeight: 600, color: '#4a5568', fontSize: 16, borderBottom: '2px solid #e2e8f0', textAlign: 'center', letterSpacing: '0.02em', borderTop: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>Specialty</th>
              </tr>
            </thead>
            <tbody>
              {sortedExperts.map((e, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{e.name}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{e.type}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{e.specialty}</td>
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
              <div style={{ fontWeight: 500, fontSize: 15, color: '#3182ce', marginBottom: 2 }}>{e.type}</div>
              <div style={{ fontSize: 14, color: '#4a5568' }}>{e.specialty}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertList;
