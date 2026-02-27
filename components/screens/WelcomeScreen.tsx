import React from 'react';
import { Logo } from '../Logo';

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
    <div className="w-full z-10 animate-slide-in px-4 py-8 sm:py-12 mt-12">
      <header className="max-w-6xl mx-auto text-center">
        <div className="flex flex-col items-center mb-10 pt-4">
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Find your perfect Accra spot in 20 seconds
          </h1>
          <p className="text-lg sm:text-2xl font-medium max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            AI-powered hangout plans that actually match your vibe. Not basic Google searches. Real vibes. Real local spots.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="p-4 sm:p-5 w-full sm:w-auto">
            <button
              onClick={() => onStart('quick')}
              className="focus-ring min-h-[44px] w-full px-8 py-4 rounded-2xl text-lg sm:text-xl font-bold transition-all hover:opacity-95 transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
            >
              Find My Vibe →
            </button>
            <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>127 people found their vibe today</p>
          </div>
          <div className="p-4 sm:p-5 w-full sm:w-auto">
            <button
              onClick={() => onStart('detailed')}
              className="focus-ring min-h-[44px] w-full px-8 py-4 rounded-2xl text-lg sm:text-xl font-bold transition-all border-2"
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border-strong)' }}
            >
              Custom Plan
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 flex-wrap animate-fade-in">
          {[
            '✓ 2,000+ plans created',
            '✓ Only open spots',
            '✓ Budget-friendly'
          ].map((benefit) => (
            <span key={benefit} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
              {benefit}
            </span>
          ))}
        </div>

      </header>

      <main className="max-w-6xl mx-auto mt-16 space-y-20">
        <section className="px-4 animate-fade-in-up">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
              Sneak Peek: Realistic Hangout Plans
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Here's what a typical Vibe plan looks like.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="surface-card overflow-hidden rounded-2xl border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="The Republic" />
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">4.5/5 ★</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl mb-1">The Republic Bar & Grill</h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>Authentic vibes, local cocktails, and the best live music in Osu.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Open Now</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">GH₵150-300</span>
                </div>
              </div>
            </div>

            <div className="surface-card overflow-hidden rounded-2xl border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Cafe" />
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">4.8/5 ★</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl mb-1">Cafe Neo</h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>The perfect spot for a quiet afternoon reset or a focused work session.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Quiet Zone</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Local Coffee</span>
                </div>
              </div>
            </div>

            <div className="surface-card overflow-hidden rounded-2xl border border-[var(--border-soft)] shadow-sm hover:shadow-md transition-shadow hidden lg:block">
              <div className="h-48 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Restaurant" />
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">4.3/5 ★</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl mb-1">Urban Grill</h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>Upscale dining with a view. Perfect for that special date night.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Fine Dining</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Great View</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4">
          <h2 className="font-display text-3xl font-extrabold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>Popular Vibes in Accra</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredVibes.map((item) => (
              <article key={item.title} className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all border border-[var(--border-soft)] h-64">
                <div className="h-full w-full overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-200 font-medium">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card p-10 mx-4 border border-[var(--border-soft)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-extrabold mb-10 text-center" style={{ color: 'var(--text-primary)' }}>How Vibe Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { step: '1', title: 'Pick your mood', text: 'Tell us how you want to feel today.' },
                { step: '2', title: 'Set constraints', text: 'Location, budget, and timing.' },
                { step: '3', title: 'Go time', text: 'Get two hand-picked local gems.' }
              ].map((item) => (
                <article key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4" style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center py-20 px-4 bg-[var(--bg-elevated)] border-y border-[var(--border-soft)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>People plan faster with Vibe</h2>
            <p className="text-xl mb-10" style={{ color: 'var(--text-secondary)' }}>"Used this for my last crew hangout and we found a spot in seconds. No more 20 minute WhatsApp debates!" — Ama, East Legon</p>
            <button
              onClick={() => onStart('quick')}
              className="focus-ring min-h-[44px] px-12 py-4 rounded-2xl text-xl font-bold transition-all hover:opacity-95 transform hover:scale-105 shadow-xl"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
            >
              Plan My Night
            </button>
          </div>
        </section>
      </main>

    </div>
  );
};

export default WelcomeScreen;
