// EXAMPLE USAGE - How to use the Logo component in your app

import { Logo } from './components/Logo';

// ========================================
// 1. HEADER / NAVIGATION
// ========================================
function Header() {
  return (
    <header className="surface-card" style={{ 
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        {/* Logo - clickable, goes to home */}
        <Logo 
          variant="full" 
          size={36}
          className="focus-ring"
          style={{ 
            color: 'var(--accent-primary)',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/'}
        />
        
        {/* Rest of your header */}
        <nav>
          {/* nav items */}
        </nav>
      </div>
    </header>
  );
}

// ========================================
// 2. LANDING PAGE / HERO
// ========================================
function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center'
    }}>
      {/* Large logo mark */}
      <Logo 
        variant="mark" 
        size={100}
        style={{ 
          color: 'var(--accent-primary)',
          marginBottom: '2rem'
        }}
      />
      
      {/* Big VIBE wordmark */}
      <h1 style={{ 
        fontSize: '4rem', 
        fontWeight: 700,
        fontFamily: 'Outfit, sans-serif',
        letterSpacing: '-0.03em',
        marginBottom: '1rem',
        color: 'var(--text-primary)'
      }}>
        VIBE
      </h1>
      
      <p style={{ 
        fontSize: '1.5rem',
        color: 'var(--text-secondary)',
        maxWidth: '600px',
        marginBottom: '2rem'
      }}>
        Your personal guide to the perfect Accra hangout
      </p>
      
      <button className="surface-card" style={{
        background: 'var(--accent-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 2rem',
        fontSize: '1.125rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'Outfit, sans-serif'
      }}>
        Find Your Vibe
      </button>
    </div>
  );
}

// ========================================
// 3. LOADING STATE
// ========================================
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--bg-canvas)'
    }}>
      <Logo 
        variant="mark" 
        size={64}
        className="animate-pulse-subtle"
        style={{ color: 'var(--accent-primary)' }}
      />
      <p style={{ color: 'var(--text-secondary)' }}>
        Finding your vibe...
      </p>
    </div>
  );
}

// ========================================
// 4. FOOTER
// ========================================
function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-soft)',
      padding: '3rem 2rem',
      marginTop: '4rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Small logo in footer */}
        <Logo 
          variant="full" 
          size={28}
          style={{ color: 'var(--text-secondary)' }}
        />
        
        <p style={{ 
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}>
          © 2024 Vibe. Your Accra Guide.
        </p>
      </div>
    </footer>
  );
}

// ========================================
// 5. EMPTY STATE
// ========================================
function EmptyState() {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center'
    }}>
      <Logo 
        variant="mark" 
        size={48}
        style={{ 
          color: 'var(--text-muted)',
          margin: '0 auto 1rem'
        }}
      />
      <h3 style={{ 
        fontSize: '1.25rem',
        color: 'var(--text-secondary)',
        fontWeight: 600
      }}>
        No plans yet
      </h3>
      <p style={{ color: 'var(--text-muted)' }}>
        Start by finding your vibe
      </p>
    </div>
  );
}

// ========================================
// 6. COMPACT VERSION (for tight spaces)
// ========================================
function CompactLogo() {
  return (
    <Logo 
      variant="mark" 
      size={24}
      style={{ color: 'var(--accent-primary)' }}
    />
  );
}

export { 
  Header, 
  LandingPage, 
  LoadingScreen, 
  Footer, 
  EmptyState,
  CompactLogo 
};
