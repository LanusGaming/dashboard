import { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { api } from '../api/client'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containers, setContainers] = useState([])

    useEffect(() => {
        api.get('/containers')
            .then(res => res.json())
            .then(setContainers)
    }, [])

    return (
        <main className={styles.dashboardPage}>
            <section className={styles.systemStats}>
                <h2>System</h2>
                <div>
                    <header>
                        <h3>CPU</h3>
                        <span>34%</span>
                    </header>
                    <div>
                        Graph
                    </div>
                </div>
                <div>
                    <header>
                        <h3>Memory</h3>
                        <span>61%</span>
                    </header>
                    <div>
                        Graph
                    </div>
                </div>
                <div>
                    <header>
                        <h3>Network</h3>
                        <span>1.2 MB/s</span>
                    </header>
                    <div>
                        Graph
                    </div>
                </div>
            </section>
            <section className={styles.containerStats}>
                <h2>Containers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {containers.map(c => (
                            <tr key={c.containerId} className={styles.container}>
                                <th>Container Name</th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    )
}