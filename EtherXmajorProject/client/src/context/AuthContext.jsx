import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('etherx_token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('etherx_user') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (!token) return
    api.get('/auth/me').catch(err => {
      if (err.response?.status === 401) logout()
    })
  }, [])

  const saveAuth = useCallback((t, u) => {
    setToken(t)
    setUser(u)
    localStorage.setItem('etherx_token', t)
    localStorage.setItem('etherx_user', JSON.stringify(u))
  }, [])

  const login = saveAuth

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('etherx_token')
    localStorage.removeItem('etherx_user')
  }, [])

  const updateUser = useCallback((u) => {
    setUser(u)
    localStorage.setItem('etherx_user', JSON.stringify(u))
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, saveAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
