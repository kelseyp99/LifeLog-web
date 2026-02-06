import React, { useState, useMemo } from 'react';
import type { ActivityLogRow } from './ActivityLog';

interface AskExportModalProps {
  activityLogs: ActivityLogRow[];
  open: boolean;
  onClose: () => void;
}

const categories = [
  'Health', 'Work', 'Personal', 'Fitness', 'Diet', 'Mood', 'Other'
];

export const AskExportModal: React.FC<AskExportModalProps> = ({ activityLogs, open, onClose }) => {
  const [category, setCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<'ALL' | '1' | '30' | '180' | 'CUSTOM'>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [question, setQuestion] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  // Filter logic (category + date)
  const filteredLogs = useMemo(() => {
    let filtered = activityLogs;
    if (category) {
      filtered = filtered.filter(row =>
        typeof row.category === 'string' &&
        row.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (dateRange !== 'ALL') {
      let start: Date | null = null;
      let end: Date | null = null;
      const now = new Date();
      if (dateRange === 'CUSTOM') {
        if (customStart) start = new Date(customStart);
        if (customEnd) {
          end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
        }
      } else {
        const days = parseInt(dateRange, 10);
        start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      }
      filtered = filtered.filter(row => {
        let ts = row.timestamp;
        if (ts && ts.toDate) ts = ts.toDate();
        if (typeof ts === 'string') ts = new Date(ts);
        if (!(ts instanceof Date) || isNaN(ts.getTime())) return false;
        if (start && ts < start) return false;
        if (end && ts > end) return false;
        return true;
      });
    }
    return filtered;
  }, [activityLogs, category, dateRange, customStart, customEnd]);

  // Download and clipboard logic
  const handleExport = async () => {
    setDownloading(true);
    let fileContent = '';
    let fileName = '';
    let blob;
    if (exportFormat === 'csv') {
      // CSV header
      fileContent = 'Date,Category,Description\n';
      fileContent += filteredLogs.map(row => {
        let ts = row.timestamp;
        if (ts && ts.toDate) ts = ts.toDate();
        if (typeof ts === 'string') ts = new Date(ts);
        const dateStr = ts instanceof Date && !isNaN(ts.getTime()) ? ts.toLocaleDateString() : String(row.timestamp);
        // Escape quotes and commas
        const desc = String(row.description).replace(/"/g, '""');
        return `"${dateStr}","${row.category}","${desc}"`;
      }).join('\n');
      blob = new Blob([fileContent], { type: 'text/csv' });
      fileName = `activitylog_export_${Date.now()}.csv`;
    } else if (exportFormat === 'pdf') {
      // Dynamically import jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.text('Activity Log Export', 10, 10);
      let y = 20;
      doc.text('Date', 10, y);
      doc.text('Category', 50, y);
      doc.text('Description', 100, y);
      y += 8;
      filteredLogs.forEach(row => {
        let ts = row.timestamp;
        if (ts && ts.toDate) ts = ts.toDate();
        if (typeof ts === 'string') ts = new Date(ts);
        const dateStr = ts instanceof Date && !isNaN(ts.getTime()) ? ts.toLocaleDateString() : String(row.timestamp);
        doc.text(String(dateStr), 10, y);
        doc.text(String(row.category), 50, y);
        doc.text(String(row.description), 100, y);
        y += 8;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      fileName = `activitylog_export_${Date.now()}.pdf`;
      doc.save(fileName);
      // Copy question and file name to clipboard
      const clipboardText = `Question: ${question}\nFile: ${fileName}`;
      await navigator.clipboard.writeText(clipboardText);
      setDownloading(false);
      onClose();
      alert('Exported as PDF and copied to clipboard!');
      return;
    }
    // Download file (CSV)
    if (exportFormat === 'csv' && blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob as Blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // Copy question and file name to clipboard
    const clipboardText = `Question: ${question}\nFile: ${fileName}`;
    await navigator.clipboard.writeText(clipboardText);
    setDownloading(false);
    onClose();
    alert(`Exported as ${exportFormat.toUpperCase()} and copied to clipboard!`);
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 420, maxWidth: 600 }}>
        <h2>Ask & Export Activity Log</h2>
        <div style={{ marginBottom: 12 }}>
          <label>Category: </label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value=''>All</option>
            {categories.map((cat, idx) => <option key={cat + '-' + idx} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Date Range: </label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value as any)}>
            <option value='ALL'>All</option>
            <option value='1'>Last 1 day</option>
            <option value='30'>Last 30 days</option>
            <option value='180'>Last 6 months</option>
            <option value='CUSTOM'>Custom...</option>
          </select>
          {dateRange === 'CUSTOM' && (
            <>
              <input type='date' value={customStart} onChange={e => setCustomStart(e.target.value)} />
              <input type='date' value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Export Format: </label>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value as 'csv' | 'pdf')} style={{ marginRight: 12 }}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div style={{ marginBottom: 12, maxHeight: 180, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
          <table style={{ width: '100%', fontSize: 14 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th style={{ textAlign: 'left', paddingLeft: 16 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((row, idx) => {
                let ts = row.timestamp;
                if (ts && ts.toDate) ts = ts.toDate();
                if (typeof ts === 'string') ts = new Date(ts);
                const dateStr = ts instanceof Date && !isNaN(ts.getTime()) ? ts.toLocaleDateString() : String(row.timestamp);
                return (
                  <tr key={row.id + '-' + idx}>
                    <td>{dateStr}</td>
                    <td>{row.category}</td>
                    <td style={{ textAlign: 'left', paddingLeft: 16 }}>{row.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginBottom: 12 }}>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder='Enter your question for ChatGPT...' rows={2} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 6 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, background: '#aaa', color: '#fff', border: 'none', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleExport} disabled={downloading || !question} style={{ padding: '8px 20px', borderRadius: 8, background: '#3182ce', color: '#fff', border: 'none', fontWeight: 600 }}>{downloading ? 'Exporting...' : 'OK'}</button>
        </div>
      </div>
    </div>
  );
};
