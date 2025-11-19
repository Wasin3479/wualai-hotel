import React, { createContext, useContext, useEffect, useState } from 'react'
import Swal from 'sweetalert2'


const Ctx = createContext(null)


export function FakeAuthProvider({ children }) {
    const [session, setSession] = useState(() => {
        const raw = localStorage.getItem('adm_session')
        return raw ? JSON.parse(raw) : { UserID: null, Username: null, Status: null }
    })
    useEffect(() => { localStorage.setItem('adm_session', JSON.stringify(session)) }, [session])


    function login({ email, role = '1' }) {
        setSession({ UserID: 1, Username: email || 'admin@example.com', Status: role })
    }
    function logout() { setSession({ UserID: null, Username: null, Status: null }) }


    async function guardSuperAdmin() {
        if (!session.UserID) { window.location.href = '/login'; return false }
        if (session.Status !== '1') {
            await Swal.fire({ icon: 'success', title: 'หน้าสำหรับผู้ดูแลระบบเท่านั้น', confirmButtonText: 'ตกลง', timer: 3000, timerProgressBar: true })
            window.location.href = '/login'
            return false
        }
        return true
    }


    return <Ctx.Provider value={{ session, login, logout, guardSuperAdmin }}>{children}</Ctx.Provider>
}
export function useFakeAuth() { return useContext(Ctx) }