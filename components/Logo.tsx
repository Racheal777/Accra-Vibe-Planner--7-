import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'mark' | 'wordmark' | 'full';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  variant = 'mark', 
  className = '',
  style = {},
  onClick
}) => {
  if (variant === 'mark') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none"
        className={className}
        style={{ display: 'block', ...style }}
        onClick={onClick}
        aria-label="Vibe logo"
        role={onClick ? 'button' : 'img'}
      >
        <path 
          d="M 12 12 L 32 52 L 52 12 L 44 12 L 32 36 L 20 12 Z" 
          fill="currentColor"
        />
      </svg>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div 
        className={className}
        style={{ 
          fontSize: `${size}px`, 
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          ...style
        }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        VIBE
      </div>
    );
  }

  // Full lockup - logo + wordmark
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: `${size * 0.25}px`,
        ...style
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <path 
          d="M 12 12 L 32 52 L 52 12 L 44 12 L 32 36 L 20 12 Z" 
          fill="currentColor"
        />
      </svg>
      <span 
        style={{ 
          fontSize: `${size * 0.7}px`, 
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}
      >
        VIBE
      </span>
    </div>
  );
};

export default Logo;
