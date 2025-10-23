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

  // returns an object with className and style for inline transitionDelay
  function getDelayProps(i){
    const ms = Math.min(300 + i*80, 900)
    const style = { transitionDelay: `${ms}ms` }
    const className = inView ? 'opacity-100 translate-y-0 transition-all duration-700' : 'opacity-0 translate-y-4'
    return { className, style }
  }

  return [ref, inView, getDelayProps]
}
