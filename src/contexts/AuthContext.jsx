import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAccessToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [accessToken, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        api.post('/auth/refresh')
            .then(r => r?.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    storeToken(data.accessToken)
                }
            })
        .finally(() => setLoading(false))
    }, [])

    function storeToken(token) {
        setAccessToken(token)
        setToken(token)
    }

    async function login(username, password) {
        const response = await api.post('/auth/login', { username, password })
        if (!response.ok) return false

        const data = await response.json()
        storeToken(data.accessToken)
    }

    async function logout() {
        await api.post('/auth/logout')
        storeToken(null)
        navigate('/login')
    }

    if (loading) return null

    return (
        <AuthContext.Provider value={{ isAuthenitcated: !!accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)