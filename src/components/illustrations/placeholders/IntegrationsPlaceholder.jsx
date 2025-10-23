import React from 'react'
import intPng from '../../../assets/images/placeholders/integrations.png'
import intWebp from '../../../assets/images/placeholders/integrations.webp'

export default function IntegrationsPlaceholder(){
  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <picture data-testid="integrations-placeholder">
        <source srcSet={intWebp} type="image/webp" />
        <img src={intPng} alt="integrations placeholder" loading="lazy" width="480" height="280" />
      </picture>
    </div>
  )
}
