import React from 'react'

export default function TemplatesPlaceholder(){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'><rect width='200' height='120' rx='8' fill='%23fff'/><g fill='%23eef3ff'><rect x='12' y='12' width='60' height='40' rx='4'/></g></svg>`
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  return (
    <div data-testid="templates-placeholder" className="w-full h-full flex items-center justify-center bg-white">
      <img src={src} alt="templates placeholder" loading="lazy" style={{width:'80%'}} />
    </div>
  )
}
