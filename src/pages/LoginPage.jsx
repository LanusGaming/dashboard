import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        const form = new FormData(e.target)

        const success = await login(
            form.get('username'),
            form.get('password')
        )

        if (success) navigate('/')
        else setError('Invalid username or password')
    }

    return (
        <main>
            <h1>Dashboard</h1>
            <p>For all your stats and container controlls in one place</p>
            <form onSubmit={handleSubmit}>
                <input name="username" placeholder="Username" autocomplete="username" />
                <input name="password" type="password" placeholder="Password" autocomplete="current-password" />
                {error && <div>{error}</div>}
                <button type="submit">Login</button>
            </form>
        </main>
    )
}