import { useEffect, useState, useRef } from 'react'

export default function useInView(options){
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

  return [ref, inView]
}
