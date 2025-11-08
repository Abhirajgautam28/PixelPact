import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext({ user: null, refresh: async ()=>{} })

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  // call /api/auth/me on mount to detect session via httpOnly cookie
  useEffect(()=>{
    let mounted = true
    async function check(){
      try{
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) { if (mounted) setUser(null); return }
        const body = await res.json()
        if (mounted) setUser(body.user || null)
      }catch(e){ if (mounted) setUser(null) }
    }
    check()
    return ()=> { mounted = false }
  }, [])

  async function refresh(){
    try{
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) { setUser(null); return null }
      const body = await res.json()
      setUser(body.user || null)
      return body.user || null
    }catch(e){ setUser(null); return null }
  }

  return <AuthContext.Provider value={{ user, refresh }}>{children}</AuthContext.Provider>
}

export default AuthProvider
