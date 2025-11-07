import React, { useEffect, useState } from 'react';
import './DietitianList.scss';

const DietitianList: React.FC = () => {
  const [dietitians, setDietitians] = useState<string[]>([]);

  useEffect(() => {
    // Fetch or simulate data
    setDietitians(['Alice', 'Bob', 'Carlos']);
  }, []);

  return (
    <div className="dietitian-list">
      <h2>Dietitian List</h2>
      <ul>
        {dietitians.map((d, index) => (
          <li key={index}>{d}</li>
        ))}
      </ul>
    </div>
  );
};

export default DietitianList;
