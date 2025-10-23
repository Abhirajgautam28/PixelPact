import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext({ user: null, token: null, setToken: () => {} })

export function AuthProvider({ children }){
  const [token, setToken] = useState(()=> localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(()=>{
    if (token) {
      // naive decode: in production call server for user info
      setUser({ email: 'me' })
      localStorage.setItem('token', token)
    } else {
      setUser(null)
      localStorage.removeItem('token')
    }
  }, [token])

  return <AuthContext.Provider value={{ token, user, setToken }}>{children}</AuthContext.Provider>
}

export default AuthProvider
