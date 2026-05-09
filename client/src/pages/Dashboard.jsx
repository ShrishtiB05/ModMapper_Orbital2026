import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
        }
    }, [])

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, you are logged in.</p>
        </div>
    )
}

export default Dashboard