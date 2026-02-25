import React from 'react';

const Wheel = ({ cx, cy, r }: { cx: number, cy: number, r: number }) => (
    <g>
        <circle cx={cx} cy={cy} r={r} stroke="#1e293b" strokeWidth="4" fill="#334155" />
        <g style={{ animation: 'spin 0.5s linear infinite', transformOrigin: `${cx}px ${cy}px` }}>
            <path d={`M${cx} ${cy-r+2} L${cx} ${cy+r-2}`} stroke="#555" strokeWidth="1.5" />
            <path d={`M${cx-r+2} ${cy} L${cx+r-2} ${cy}`} stroke="#555" strokeWidth="1.5" />
        </g>
        <circle cx={cx} cy={cy} r={r/2.5} fill="#cbd5e1" />
    </g>
);


export const TrotroAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 12s linear infinite' }}
    >
        <div style={{ animation: 'trotro-bounce 1.8s ease-in-out infinite' }}>
            <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="window-shine" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="100%" stopColor="#a7e1f5" />
                    </linearGradient>
                </defs>
                <ellipse cx="100" cy="128" rx="70" ry="8" fill="black" opacity="0.1" />
                <rect x="10" y="30" width="180" height="80" rx="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="4"/>
                <path d="M190 60 V 95 H 175 V 60 Z" fill="#FFFCF5" stroke="#1e293b" strokeWidth="2" />
                <g style={{transform: 'translate(178px, 65px)', animation: 'wave 1s ease-in-out infinite'}}>
                  <circle cx="0" cy="-5" r="6" fill="#660B05" />
                  <rect x="-2" y="1" width="4" height="15" rx="2" fill="#660B05" />
                </g>
                <rect x="10" y="80" width="180" height="15" fill="#8C1007" />
                <rect x="25" y="40" width="30" height="25" fill="url(#window-shine)" opacity="0.8"/>
                <rect x="65" y="40" width="30" height="25" fill="url(#window-shine)" opacity="0.8"/>
                <rect x="105" y="40" width="30" height="25" fill="url(#window-shine)" opacity="0.8"/>
                <rect x="145" y="40" width="30" height="25" fill="url(#window-shine)" opacity="0.8"/>
                <Wheel cx={55} cy={110} r={14} />
                <Wheel cx={145} cy={110} r={14} />
            </svg>
        </div>
    </div>
);

export const CarAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 10s linear infinite' }}
    >
        <div style={{ animation: 'car-wiggle 1s ease-in-out infinite' }}>
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <defs>
                    <linearGradient id="car-window" x1="0.5" y1="0" x2="0.5" y2="1">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="100%" stopColor="#a7e1f5" />
                    </linearGradient>
                    <linearGradient id="car-body" x1="0.5" y1="0" x2="0.5" y2="1">
                        <stop offset="0%" stopColor="#b91c1c" />
                        <stop offset="100%" stopColor="#8C1007" />
                    </linearGradient>
                </defs>
                <ellipse cx="80" cy="108" rx="50" ry="6" fill="black" opacity="0.1" />
                <path d="M20 85L30 60C35 50 45 45 60 45H100C115 45 125 50 130 60L140 85H20Z" fill="url(#car-body)" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M40 60 L 60 45 L 100 45 L 115 60" fill="url(#car-window)" opacity="0.8" />
                <circle cx="28" cy="68" r="4" fill="#fbbf24" />
                {/* Driver head */}
                <circle cx="65" cy="55" r="6" fill="#1e293b" opacity="0.5" />
                <Wheel cx={50} cy={85} r={12} />
                <Wheel cx={110} cy={85} r={12} />
            </svg>
        </div>
    </div>
);

export const OkadaAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 6s linear infinite' }}
    >
        <div style={{ animation: 'okada-rush 0.5s ease-in-out infinite' }}>
             <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="80" cy="108" rx="45" ry="6" fill="black" opacity="0.1" />
                {/* Rider */}
                <path d="M75 50 C 70 65 70 80 80 90 L 95 90 C 105 75 105 60 95 50 Z" fill="#334155" />
                <circle cx="85" cy="40" r="10" fill="#8C1007" stroke="#1e293b" strokeWidth="2"/>
                {/* Bike Body */}
                <path d="M60 95 L 120 95" stroke="#1e293b" strokeWidth="4" strokeLinecap="round"/>
                <path d="M95 90 L 115 70 L 130 70" stroke="#1e293b" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="132" cy="70" r="4" fill="#fef08a" />
                <rect x="100" y="70" width="20" height="15" fill="#475569" rx="3" />
                <path d="M70 95 L 50 95" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                <Wheel cx={45} cy={95} r={15} />
                <Wheel cx={125} cy={95} r={15} />
            </svg>
        </div>
    </div>
);

export const BusAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 15s linear infinite' }}
    >
        <div style={{ animation: 'trotro-bounce 2.5s ease-in-out infinite' }}>
            <svg width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                     <linearGradient id="bus-window" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="100%" stopColor="#a7e1f5" />
                    </linearGradient>
                </defs>
                <ellipse cx="90" cy="118" rx="65" ry="7" fill="black" opacity="0.1" />
                <rect x="10" y="20" width="160" height="80" rx="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="4" />
                <rect x="10" y="70" width="160" height="15" fill="#8C1007" />
                <rect x="25" y="35" width="30" height="25" fill="url(#bus-window)" opacity="0.8" />
                <rect x="65" y="35" width="30" height="25" fill="url(#bus-window)" opacity="0.8" />
                <rect x="105" y="35" width="30" height="25" fill="url(#bus-window)" opacity="0.8" />
                <Wheel cx={50} cy={100} r={14} />
                <Wheel cx={130} cy={100} r={14} />
            </svg>
        </div>
    </div>
);

export const WalkingPersonAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 18s linear infinite' }}
    >
        <g style={{ animation: 'walk-cycle 1s ease-in-out infinite' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <g transform="translate(60 85)">
                    {/* Legs */}
                    <path d="M0 0 L-5 25" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" style={{ animation: 'walk-leg-1 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                    <path d="M0 0 L5 25" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" style={{ animation: 'walk-leg-2 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                 </g>
                 <g transform="translate(60 65)">
                    {/* Arms */}
                    <path d="M0 0 L-10 15" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" style={{ animation: 'walk-arm-2 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                    <path d="M0 0 L10 15" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" style={{ animation: 'walk-arm-1 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                 </g>
                 {/* Body and Head */}
                 <path d="M60 52V85" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
                 <circle cx="60" cy="40" r="12" fill="#8C1007" />
                 <path d="M55 35 Q 60 30, 70 35" stroke="#1e293b" strokeWidth="2" fill="none" />
            </svg>
        </g>
    </div>
);