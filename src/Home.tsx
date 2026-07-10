import React from 'react';
import GetApp from './GetApp';

const FEATURES = [
  { emoji: '📓', title: 'Activity Log',      desc: 'Log daily health events, notes, and responses — organized by category and fully searchable.' },
  { emoji: '🤖', title: 'AI Assistant',      desc: 'Ask health questions and get AI-powered insights drawn directly from your personal log data.' },
  { emoji: '🔗', title: 'Share Data',        desc: 'Generate a secure one-time token and share your health data with any trusted expert.' },
  { emoji: '👩‍⚕️', title: 'Expert Directory', desc: 'Browse dietitians, therapists, coaches, trainers and more — all registered in the app.' },
  { emoji: '🧑‍💼', title: 'Expert Profile',   desc: 'Experts create a public listing with bio, specialty, and pricing — including free reviews.' },
  { emoji: '🔍', title: 'Expert View',       desc: 'Experts enter a client\'s token to securely view data and leave notes or advice.' },
];

const STEPS = [
  'Sign in with your Google account',
  'Start logging health activities and notes in the Activity Log',
  'Use the AI assistant to uncover patterns in your data',
  'Browse the Expert Directory and pick someone to help you',
  'Generate a Share Token and send it to your chosen expert',
  'Your expert views your data and leaves feedback — privately and securely',
];

const Home: React.FC = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '0 0 48px 0' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)', color: '#fff', padding: '52px 24px 48px', textAlign: 'center', borderRadius: '0 0 24px 24px', marginBottom: 36 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>📘</div>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 12px', letterSpacing: -1 }}>
          Life<span style={{ fontStyle: 'italic', fontWeight: 300 }}>Log</span>
        </h1>
        <p style={{ fontSize: '1.15rem', opacity: 0.88, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
          Your AI-powered health journal. Track, reflect, and connect with experts who can help you thrive.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>🔒 Private & Secure</span>
          <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>🤖 AI Insights</span>
          <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>👩‍⚕️ Expert Connect</span>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>
        <GetApp />

        <h2 style={{ fontWeight: 900, color: '#1a365d', fontSize: '1.25rem', marginBottom: 16 }}>What you can do</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{f.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#2d3748', marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#718096', lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ background: 'linear-gradient(135deg, #ebf8ff 0%, #e9d8fd 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
          <h2 style={{ fontWeight: 900, color: '#2b6cb0', fontSize: '1.1rem', marginTop: 0, marginBottom: 16 }}>🚀 How it works</h2>
          <ol style={{ paddingLeft: 20, margin: 0, color: '#4a5568', lineHeight: 2.1, fontSize: 14 }}>
            {STEPS.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        {/* Expert CTA */}
        <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 16, padding: '20px 24px' }}>
          <h3 style={{ fontWeight: 900, color: '#276749', margin: '0 0 8px', fontSize: '1rem' }}>👩‍⚕️ Are you an expert?</h3>
          <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.65, margin: 0 }}>
            Go to <strong>Expert Profile</strong> in the menu, toggle <em>"I am an Expert"</em>, fill in your details, and click Save. Your card will instantly appear in the Expert Directory. Pricing can be set to <span style={{ color: '#38a169', fontWeight: 700 }}>Free</span> — no payment setup required.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Home;
