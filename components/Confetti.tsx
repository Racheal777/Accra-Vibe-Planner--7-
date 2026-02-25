import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

const Confetti: React.FC = () => {
  const colors = ['#8C1007', '#660B05', '#E18C44'];
  const confettiCount = 50;

  const confetti = Array.from({ length: confettiCount }).map((_, index) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}vw`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animation: `confetti-fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s forwards`,
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: 0,
    };
    return <ConfettiPiece key={index} style={style} />;
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" aria-hidden="true">
      {confetti}
    </div>
  );
};

export default Confetti;