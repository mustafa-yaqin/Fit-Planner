// Who is logged in: user, register, login, logout. Any component can read it with useAuth().
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api.js'
import { readLocal, removeLocal, writeLocal } from '../offline/store.js'

const AuthContext = createContext(null)
const USER_KEY = 'fit.user'

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => readLocal(USER_KEY, null))
  const [loading, setLoading] = useState(() => !readLocal(USER_KEY, null))

  useEffect(() => {
    if (user) writeLocal(USER_KEY, user)
    else removeLocal(USER_KEY)
  }, [user])

  useEffect(() => {
    let stop = false
    api
      .get('/api/auth/me')
      .then((data) => {
        if (!stop) setUser(data.user)
      })
      .catch(() => {}) 
      .finally(() => {
        if (!stop) setLoading(false)
      })
    return () => {
      stop = true
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/api/auth/register', { name, email, password })
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {

    }
    setUser(null)
  }, [])


  const expire = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, loading, register, login, logout, expire }),
    [user, loading, register, login, logout, expire]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
