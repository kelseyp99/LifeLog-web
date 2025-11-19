import React, { useState } from 'react';
import { AskExportIntegration } from './AskExportIntegration';
import { auth } from './firebaseConfig';

const categories = [
  'Health', 'Work', 'Personal', 'Fitness', 'Diet', 'Mood', 'Other'
];

type HistoryItem = {
  type: 'question' | 'activity';
  text: string;
  categories: string[];
  file?: File | null;
};


export default function AskAndLog() {
  const user = auth.currentUser;
  const [input, setInput] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isQuestion, setIsQuestion] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (isQuestion) {
      // Simulate AI summary modal
      setSummary('This is a summary of your question: ' + input);
      setShowSummary(true);
      setHistory((h) => [...h, { type: 'question', text: input, categories: selectedCategories, file }]);
    } else {
      // Simulate activity log
      setHistory((h) => [...h, { type: 'activity', text: input, categories: selectedCategories }]);
    }
    setInput('');
    setSelectedCategories([]);
    setFile(null);
  };

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <AskExportIntegration user={user} />
      <h2>Ask & Log</h2>
      <div style={{ minHeight: 120, marginBottom: 24, background: '#f7fafc', borderRadius: 8, padding: 16 }}>
        <strong>History:</strong>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history.map((item, idx) => (
            <li key={item.type + '-' + item.text + '-' + idx} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{item.type === 'question' ? 'Q:' : 'Activity:'}</span> {item.text}
              {item.categories && item.categories.length > 0 && (
                <span style={{ color: '#888', fontSize: 13 }}> [Categories: {item.categories.join(', ')}]</span>
              )}
              {item.file && <span style={{ color: '#888', fontSize: 13 }}> [Attachment: {item.file.name}]</span>}
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter your activity or ask a question..."
          rows={3}
          style={{ resize: 'vertical', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <div>
          <label>
            <input type="checkbox" checked={isQuestion} onChange={e => setIsQuestion(e.target.checked)} />
            {' '}This is a question for AI
          </label>
        </div>
        <div>
          <strong>Categories:</strong>
          {categories.map((cat, catIdx) => (
            <label key={cat + '-' + catIdx} style={{ marginRight: 12 }}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              /> {cat}
            </label>
          ))}
        </div>
        {isQuestion && (
          <div>
            <label>
              Attach file: <input type="file" onChange={handleFileChange} />
            </label>
          </div>
        )}
        <button type="submit" style={{ padding: '8px 24px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          Submit
        </button>
      </form>
      {showSummary && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 320 }}>
            <h3>AI Summary</h3>
            <p>{summary}</p>
            <button onClick={() => setShowSummary(false)} style={{ marginTop: 16, padding: '8px 24px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
