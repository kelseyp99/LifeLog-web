import React, { useEffect, useState } from 'react';
import './DietitianList.scss';

const DietitianList: React.FC = () => {
  const [dietitians, setDietitians] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    // Fetch or simulate data
    setDietitians(['Alice', 'Bob', 'Carlos']);
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
      <ul>
        {sortedDietitians.map((d, index) => (
          <li key={index}>{d}</li>
        ))}
      </ul>
    </div>
  );
};

export default DietitianList;
