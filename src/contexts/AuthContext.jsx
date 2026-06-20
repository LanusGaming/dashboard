import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [isAuthenitcated, setIsAuthenticated] = useState(
        !!localStorage.getItem('accessToken')
    )
    const navigate = useNavigate()

    async function login(username, password) {
        const response = await api.post('/auth/login', { username, password })
        if (!response.ok) return false

        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        setIsAuthenticated(true)
        return true
    }

    function logout() {
        localStorage.clear()
        setIsAuthenticated(false)
        navigate('/login')
    }

    return (
        <AuthContext.Provider value={{ isAuthenitcated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)