import React from 'react'

export default function IntegrationsPlaceholder(){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'><rect width='200' height='120' rx='8' fill='%23fff'/><circle cx='60' cy='60' r='18' fill='%23f0f9ff'/><circle cx='110' cy='60' r='18' fill='%23eef2ff'/></svg>`
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  return (
    <div data-testid="integrations-placeholder" className="w-full h-full flex items-center justify-center bg-white">
      <img src={src} alt="integrations placeholder" loading="lazy" style={{width:'80%'}} />
    </div>
  )
}
