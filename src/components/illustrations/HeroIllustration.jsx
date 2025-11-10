import React from 'react'

export default function HeroIllustration(){
  return (
    <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--md-primary)" />
          <stop offset="100%" stopColor="#00BFA6" />
        </linearGradient>
      </defs>
      <rect rx="18" width="100%" height="100%" fill="#fff" />
      <g transform="translate(30,30)">
        <rect x="0" y="0" width="260" height="140" rx="10" fill="url(#g1)" opacity="0.95" />
        <rect x="20" y="20" width="220" height="100" rx="6" fill="#fff" />
        <circle cx="40" cy="40" r="6" fill="#FF6B6B" />
        <rect x="48" y="36" width="140" height="10" rx="4" fill="#e6e9ff" />
      </g>
      <g transform="translate(320,40)">
        <rect x="0" y="0" width="220" height="120" rx="10" fill="#f6fbff" />
        <rect x="12" y="12" width="196" height="20" rx="6" fill="#fff" />
        <rect x="12" y="40" width="120" height="12" rx="6" fill="#fff" />
        <rect x="12" y="60" width="170" height="12" rx="6" fill="#fff" />
      </g>
    </svg>
  )
}
