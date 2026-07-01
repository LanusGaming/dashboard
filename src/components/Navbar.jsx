import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, UserRound } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import styles from './Navbar.module.css'

export default function Navbar() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    return (
        <nav className={styles.navbar}>
            <button onClick={() => navigate('/')}><h1>Dashboard</h1></button>
            <div>
                <button className={styles.navbarItem}><Settings /></button>
                <button className={styles.navbarItem} onClick={() => navigate('/login')}><UserRound /></button>
            </div>
        </nav>
    )
}