import React from 'react'
import heroPng from '../../../assets/images/placeholders/hero.png'
import heroWebp from '../../../assets/images/placeholders/hero.webp'

export default function HeroPlaceholder(){
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fff] to-[#f7fbff]">
      <picture data-testid="hero-placeholder">
        <source srcSet={heroWebp} type="image/webp" />
        <img src={heroPng} alt="hero placeholder" loading="lazy" width="600" height="360" />
      </picture>
    </div>
  )
}
