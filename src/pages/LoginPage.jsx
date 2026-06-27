import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound, KeyRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import styles from "./LoginPage.module.css"

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
        <main className={styles.loginPage}>
            <header>
                <h1>Dashboard</h1>
                <p>For all your stats and container controlls in one place</p>
            </header>
            <form onSubmit={handleSubmit}>
                <div className={styles.formField}>
                    <label htmlFor="username"><UserRound /></label>
                    <input id="username" name="username" placeholder="Username" autoComplete="username" />
                </div>
                <div className={styles.formField}>
                    <label htmlFor="password"><KeyRound /></label>
                    <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" />
                </div>
                {error && <small>{error}</small>}
                <button type="submit">Login</button>
            </form>
        </main>
    )
}