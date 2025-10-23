import React from 'react'
export default function HeroPlaceholder(){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 200'><rect width='360' height='200' rx='10' fill='%23fff'/><g fill='%23f8fafc'><rect x='20' y='24' width='120' height='80' rx='6'/><rect x='156' y='24' width='180' height='80' rx='6'/></g></svg>`
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  return (
    <div data-testid="hero-placeholder" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fff] to-[#f7fbff]">
      <img src={src} alt="hero placeholder" loading="lazy" style={{width:'60%'}} />
    </div>
  )
}
