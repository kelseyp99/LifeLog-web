
import React, { useState, useEffect } from 'react';
import { AskExportIntegration } from './AskExportIntegration';
import { auth, db } from './firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import {
  logEvent,
  logSelectContent,
  trackActivityLogged,
  trackAiSummaryRequested,
  trackLogCreated,
} from './analytics';

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
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [isQuestion, setIsQuestion] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, `Users/${user.uid}/Category`));
      const cats: string[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.name) cats.push(data.name);
      });
      setCategories(cats);
    };
    fetchCategories();
  }, [user]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCategory.trim()) return;
    try {
      await addDoc(collection(db, `Users/${user.uid}/Category`), { name: newCategory.trim() });
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    } catch (err) {
      alert('Failed to add category.');
    }
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
      setSummary('This is a summary of your question: ' + input);
      setShowSummary(true);
      setHistory((h) => [...h, { type: 'question', text: input, categories: selectedCategories, file }]);
      trackAiSummaryRequested('ask_and_log');
      logEvent('question_asked', {
        question_length: input.length,
        category_count: selectedCategories.length,
        has_attachment: Boolean(file),
      });
    } else {
      setHistory((h) => [...h, { type: 'activity', text: input, categories: selectedCategories }]);
      trackLogCreated('activity');
      trackActivityLogged();
      logEvent('activity_created', {
        category_count: selectedCategories.length,
      });
    }
    setInput('');
    setSelectedCategories([]);
    setFile(null);
  };

  return (
  <div style={{ maxWidth: 640, margin: '40px auto', padding: 32, background: '#f9fafb', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', color: '#222' }}>
      <AskExportIntegration user={user} />
  <h2 style={{ textAlign: 'center', marginBottom: 28, fontWeight: 700, fontSize: 28, letterSpacing: 0.5, color: '#2d3748' }}>Ask & Log</h2>
      <div style={{ marginBottom: 32 }}>
  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: '#2d3748' }}>History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {history.length === 0 && (
            <div style={{ color: '#4a5568', fontSize: 16, textAlign: 'center', padding: 24, background: '#f7fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              No history yet. Add an activity or ask a question!
            </div>
          )}
          {history.map((item, idx) => (
            <div
              key={item.type + '-' + item.text + '-' + idx}
              style={{
                background: item.type === 'question' ? '#ebf8ff' : '#f7fafc',
                border: item.type === 'question' ? '1.5px solid #3182ce' : '1px solid #e2e8f0',
                borderLeft: item.type === 'question' ? '6px solid #3182ce' : '6px solid #ecc94b',
                borderRadius: 10,
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                color: '#222'
              }}
            >
              <span style={{ fontWeight: 700, color: item.type === 'question' ? '#2b6cb0' : '#b7791f', fontSize: 15 }}>
                {item.type === 'question' ? 'Question' : 'Activity'}
              </span>
              <span style={{ fontSize: 16, color: '#222', marginBottom: 2 }}>{item.text}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                {item.categories && item.categories.map((cat, i) => (
                  <span key={cat + '-' + i} style={{ background: '#e2e8f0', color: '#2d3748', fontSize: 13, borderRadius: 6, padding: '2px 10px', border: '1px solid #cbd5e1' }}>{cat}</span>
                ))}
                {item.file && <span style={{ background: '#e2e8f0', color: '#2b6cb0', fontSize: 13, borderRadius: 6, padding: '2px 10px', border: '1px solid #90cdf4' }}>Attachment: {item.file.name}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', color: '#222' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter your activity or ask a question..."
          rows={3}
          style={{ resize: 'vertical', padding: 12, borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 16, marginBottom: 0, outline: 'none', transition: 'border 0.2s', color: '#222', background: '#f7fafc' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <input type="checkbox" checked={isQuestion} onChange={e => {
              setIsQuestion(e.target.checked);
              logSelectContent('ask_and_log_mode', e.target.checked ? 'question' : 'activity');
            }} style={{ accentColor: '#3182ce' }} />
            This is a question for AI
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <strong style={{ fontSize: 15, marginBottom: 2 }}>Categories:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {categories.map((cat, catIdx) => (
              <label key={cat + '-' + catIdx} style={{ marginRight: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, background: selectedCategories.includes(cat) ? '#bee3f8' : '#f7fafc', borderRadius: 6, padding: '2px 10px', border: selectedCategories.includes(cat) ? '1.5px solid #3182ce' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                  style={{ accentColor: '#3182ce' }}
                /> {cat}
              </label>
            ))}
          </div>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Add new category"
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#222', background: '#f7fafc' }}
            />
            <button type="submit" style={{ padding: '4px 12px', borderRadius: 6, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Add</button>
          </form>
        </div>
        {isQuestion && (
          <div style={{ marginTop: 2 }}>
            <label style={{ fontSize: 15 }}>
              Attach file: <input type="file" onChange={handleFileChange} style={{ fontSize: 14 }} />
            </label>
          </div>
        )}
  <button type="submit" style={{ padding: '10px 0', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 8, boxShadow: '0 1px 4px rgba(49,130,206,0.08)', transition: 'background 0.2s' }}> 
          Submit
        </button>
      </form>
      {showSummary && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 36, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.13)', minWidth: 340, color: '#222' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#2d3748' }}>AI Summary</h3>
            <p style={{ fontSize: 16, color: '#222' }}>{summary}</p>
            <button onClick={() => setShowSummary(false)} style={{ marginTop: 18, padding: '10px 28px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px rgba(49,130,206,0.08)' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
