import React from 'react'
import tplPng from '../../../assets/images/placeholders/templates.png'
import tplWebp from '../../../assets/images/placeholders/templates.webp'

export default function TemplatesPlaceholder(){
  return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <picture data-testid="templates-placeholder">
          <source srcSet={tplWebp} type="image/webp" />
          <img src={tplPng} alt="templates placeholder" loading="lazy" width="420" height="280" />
        </picture>
      </div>
  )
}
