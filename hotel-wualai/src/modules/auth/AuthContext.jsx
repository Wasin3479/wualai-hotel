import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../../services/api.js'


const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
    const [user, setUser] = useState(api.getCurrentUser())
    useEffect(() => { api.onAuthChange(setUser) }, [])
    const value = useMemo(() => ({ user, login: api.login, register: api.register, logout: api.logout, updateProfile: api.updateProfile }), [user])
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
export function useAuth() { return useContext(AuthCtx) }