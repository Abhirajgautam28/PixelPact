import React, { useEffect, useRef } from 'react'
import lottie from 'lottie-web'

export default function LottiePlayer({ animationData, loop = true, autoplay = true, style = {}, className = '' }){
  const containerRef = useRef(null)
  useEffect(()=>{
    if (!containerRef.current) return
    // guard for test environments where lottie-web may be stubbed or missing
    if (!lottie || typeof lottie.loadAnimation !== 'function') return
    const anim = lottie.loadAnimation({ container: containerRef.current, renderer: 'svg', loop, autoplay, animationData })
    return ()=>{ if (anim && typeof anim.destroy === 'function') anim.destroy() }
  }, [animationData, loop, autoplay])

  return <div data-testid="lottie-player" ref={containerRef} className={className} style={style} />
}
