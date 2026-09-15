import React from 'react';

const FEATURES = [
  { emoji: '✍️', title: 'Log what happens', desc: 'Capture daily notes, meals, activities, health details, and moments you want to remember.' },
  { emoji: '🗓️', title: 'Remember your history', desc: 'Keep personal records together so you can look back on events with useful context.' },
  { emoji: '🔎', title: 'Search your records', desc: 'Find earlier entries by date, category, or the details you recorded.' },
  { emoji: '✨', title: 'Summarize with AI', desc: 'Ask LifeLog to summarize your saved history and help surface useful themes in your entries.' },
];

const STEPS = [
  'Sign in with your Google account',
  'Record what happened using notes and organized log categories',
  'Return to your history when you need to remember a detail',
  'Search or request an AI-assisted summary of the entries you saved',
];

const Home: React.FC = () => {
  React.useEffect(() => {
    document.title = 'LifeLog App | Private Daily Life Logging';
    const description = document.querySelector('meta[name="description"]') || document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', 'LifeLog is a private daily life logging app for notes, food, activities, health observations, and life events.');
    document.head.appendChild(description);
  }, []);

  return (
    <div className="home-page">

      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-icon">📘</div>
        <h1 className="home-hero-title">
          A private app for logging everyday life.
        </h1>
        <p className="home-hero-copy">
          LifeLog is a private daily life logging app for notes, food, activities, health observations, and life events. Keep your personal history together, then search or summarize it when you need it.
        </p>
        <div className="home-pills">
          <span>Daily logging</span>
          <span>Searchable history</span>
          <span>AI-assisted summaries</span>
        </div>
        <a className="home-get-app-link" href="/get-the-app">Get the LifeLog App for web, iPhone, or Android</a>
        <a className="home-get-app-link" href="/what-is-a-life-log">What is a life log?</a>
      </div>

      {/* Feature cards */}
      <div className="home-inner">
        <h2 className="home-section-title">What you can do</h2>
        <div className="home-feature-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="home-feature-card">
              <div className="home-feature-icon">{f.emoji}</div>
              <div className="home-feature-title">{f.title}</div>
              <div className="home-feature-copy">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="home-panel home-steps">
          <h2>🚀 How it works</h2>
          <ol>
            {STEPS.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        {/* Expert CTA */}
        <div className="home-panel home-expert">
          <h3>👩‍⚕️ Are you an expert?</h3>
          <p>
            LifeLog also includes an expert directory and controlled sharing tools. Experts can apply for a profile, and approved profiles appear in the directory. Pricing can be set to <span style={{ color: '#38a169', fontWeight: 700 }}>Free</span> — no payment setup required.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Home;
