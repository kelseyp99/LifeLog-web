import React, { useEffect, useState } from 'react';


const DietitianList: React.FC = () => {
  const [dietitians, setDietitians] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    // Add many rows to force scrolling for sticky header test
    setDietitians([
      'Alice', 'Bob', 'Carlos', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy',
      'Karl', 'Liam', 'Mallory', 'Niaj', 'Olivia', 'Peggy', 'Quentin', 'Rupert', 'Sybil', 'Trent',
      'Uma', 'Victor', 'Walter', 'Xavier', 'Yvonne', 'Zara'
    ]);
  }, []);

  const sortedDietitians = React.useMemo(() => {
    const sorted = [...dietitians].sort((a, b) =>
      sortAsc ? a.localeCompare(b) : b.localeCompare(a)
    );
    return sorted;
  }, [dietitians, sortAsc]);

  return (
    <div className="dietitian-list">
      <h2>Dietitian List</h2>
      <button
        style={{ marginBottom: 12, padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
        onClick={() => setSortAsc((asc) => !asc)}
      >
        Sort: {sortAsc ? 'A → Z' : 'Z → A'}
      </button>
      <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#f7fafc',
                  zIndex: 10,
                  padding: '12px 24px',
                  fontWeight: 600,
                  color: '#4a5568',
                  fontSize: 16,
                  borderBottom: '2px solid #e2e8f0',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  borderTop: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}
              >
                Name
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDietitians.map((d, index) => (
              <tr key={index} style={{ background: index % 2 === 0 ? '#f9fafb' : '#fff' }}>
                <td style={{ padding: '10px 20px', textAlign: 'center', color: '#2d3748', fontSize: 15, borderBottom: '1px solid #e2e8f0' }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DietitianList;
