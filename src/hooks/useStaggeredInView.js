import { useEffect, useRef, useState } from 'react'

// Returns [ref, inView, getDelayClass]
// getDelayClass(index) -> returns a Tailwind style string like 'delay-150' when inView
export default function useStaggeredInView(options = {}){
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(()=>{
    if (!ref.current) return
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if (e.isIntersecting) setInView(true)
      })
    }, options)
    obs.observe(ref.current)
    return ()=> obs.disconnect()
  }, [ref.current])

  function getDelayClass(i){
    if (!inView) return 'opacity-0 translate-y-4'
    const ms = Math.min(300 + i*80, 900)
    return `opacity-100 translate-y-0 transition-all duration-700` + ` delay-[${ms}ms]`
  }

  return [ref, inView, getDelayClass]
}
