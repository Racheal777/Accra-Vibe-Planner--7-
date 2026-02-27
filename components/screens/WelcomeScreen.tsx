import React from 'react';
import LandingTrotro from '../LandingTrotro';

interface WelcomeScreenProps {
  onStart: (mode: 'quick' | 'detailed') => void;
}

const featuredVibes = [
  { title: 'Date Night', detail: 'Cozy tables + high-rated spots', image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=600&q=80' },
  { title: 'Crew Hangout', detail: 'Group-friendly plans with budget fit', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
  { title: 'Solo Reset', detail: 'Quiet places to recharge', image: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=600&q=80' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full z-10 animate-slide-in px-4 py-16 sm:py-20">
      <header className="max-w-6xl mx-auto text-center">
        <div className="relative w-full h-36 mb-4">
          <LandingTrotro />
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
          Find your next Accra vibe in under 20 seconds.
        </h1>
        <p className="text-base sm:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Answer a few quick prompts, compare two smart options, and go.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="surface-card p-4 sm:p-5 w-full sm:w-auto">
            <button
              onClick={() => onStart('quick')}
              className="focus-ring min-h-[44px] w-full px-8 py-3 rounded-xl text-base sm:text-lg font-bold transition-all hover:opacity-95"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
            >
              Start Quick Plan
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Quick: 3 taps, ready in under 20s</p>
          </div>
          <div className="surface-card p-4 sm:p-5 w-full sm:w-auto">
            <button
              onClick={() => onStart('detailed')}
              className="focus-ring min-h-[44px] w-full px-8 py-3 rounded-xl text-base sm:text-lg font-bold transition-all"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}
            >
              Detailed Plan
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Detailed: deeper matching + travel filters</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          {['Open now aware', 'Budget-fit picks', 'Close-by options'].map((badge) => (
            <span key={badge} className="stat-chip text-xs px-3 py-1.5 font-semibold">
              {badge}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>2,000+ plans created in Accra</p>
      </header>

      <main className="max-w-6xl mx-auto mt-14 space-y-8">
        <section className="surface-card p-6">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {['Pick your mood', 'Set your budget and timing', 'Get two ready-to-go options'].map((step, index) => (
              <article key={step} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}>
                <p className="text-xs font-bold uppercase" style={{ color: 'var(--accent-secondary)' }}>Step {index + 1}</p>
                <h3 className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{step}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Featured vibes</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {featuredVibes.map((item) => (
              <article key={item.title} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all border border-[var(--border-soft)]">
                <div className="h-40 w-full overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
                  <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{item.title}</h3>
                  <p className="text-sm text-gray-200 font-medium drop-shadow-sm">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card p-6 text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>People plan faster with Accra Vibe Planner</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Stop scrolling. Start going out.</p>
          <button
            onClick={() => onStart('quick')}
            className="focus-ring min-h-[44px] mt-4 px-8 py-3 rounded-xl text-base font-bold transition-all hover:opacity-95"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Plan Tonight
          </button>
        </section>
      </main>
    </div>
  );
};

export default WelcomeScreen;
