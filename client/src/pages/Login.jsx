import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch('https://modmapperorbital2026-production.up.railway.app/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()
        if (response.ok) {
            localStorage.setItem('token', data.token)
            navigate('/dashboard')
        } else {
            setMessage(data.error)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        const response = await fetch('https://modmapperorbital2026-production.up.railway.app/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
        const data = await response.json()
        if (response.ok) {
            setMessage(data.message)
        } else {
            setMessage(data.error)
        }
    }

    if (showForgotPassword) {
        return (
            <div>
                <h1>Reset Password</h1>
                <form onSubmit={handleForgotPassword}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">Send Reset Link</button>
                </form>
                <p>{message}</p>
                <button onClick={() => setShowForgotPassword(false)}>Back to Login</button>
            </div>
        )
    }


    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <p>{message}</p>
            <button onClick={() => setShowForgotPassword(true)}>Forgot Password</button>
        </div>
    )
}

export default Login