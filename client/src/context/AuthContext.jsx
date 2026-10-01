import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const TOKEN_KEY = 'fablab_token'
const USER_KEY = 'fablab_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  const persistSession = (session) => {
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    setToken(session.token)
    setUser(session.user)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('fablab:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('fablab:unauthorized', handleUnauthorized)
  }, [])

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token && user), persistSession, logout }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
