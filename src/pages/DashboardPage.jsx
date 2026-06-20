import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'

export default function DashboardPage() {
    const { logout } = useAuth()
    const [containers, setContainers] = useState([])

    useEffect(() => {
        api.get('/containers')
            .then(res => res.json())
            .then(setContainers)
    }, [])

    return (
        <div>
            <button onClick={logout}>Logout</button>
            {containers.map(c => (
                <div key={c.conmtainerId}>
                    {c.containername}
                </div>
            ))}
        </div>
    )
}