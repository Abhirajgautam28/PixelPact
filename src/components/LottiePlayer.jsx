import React, { useEffect, useRef } from 'react'

export default function LottiePlayer({ animationData, loop = true, autoplay = true, style = {}, className = '' }){
  const containerRef = useRef(null)
  useEffect(()=>{
    let mounted = true
    let anim = null
    async function init(){
      if (!containerRef.current) return
      // prefer global stub if present (tests), otherwise dynamically import the real runtime
      let lottieLib = global.lottie
      if (!lottieLib || typeof lottieLib.loadAnimation !== 'function') {
        try {
          const mod = await import('lottie-web')
          lottieLib = mod.default || mod
        } catch (e) {
          lottieLib = null
        }
      }
      if (!mounted || !lottieLib || typeof lottieLib.loadAnimation !== 'function') return
      anim = lottieLib.loadAnimation({ container: containerRef.current, renderer: 'svg', loop, autoplay, animationData })
    }
    init()
    return ()=>{ mounted = false; if (anim && typeof anim.destroy === 'function') anim.destroy() }
  }, [animationData, loop, autoplay])

  return <div data-testid="lottie-player" ref={containerRef} className={className} style={style} />
}
