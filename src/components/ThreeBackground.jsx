import React from 'react'

export default function ThreeBackground(){
  // keep a very small, performant decorative gradient background component
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(11,18,32,0.6) 0%, rgba(28,20,50,0.6) 60%, rgba(12,7,30,0.6) 100%)' }} />
  )
}
