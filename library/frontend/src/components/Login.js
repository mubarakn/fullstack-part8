import React, { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../mutations'

const Login = ({ show, onLoggedIn }) => {

    const [login, result] = useMutation(LOGIN)

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            localStorage.setItem('auth_token', token)
            onLoggedIn(token)
        }
    }, [result.data])

    const handleLogin = event => {
        event.preventDefault()
        const username = event.target.username.value
        event.target.username.value = ''
        const password = event.target.password.value
        event.target.password.value = ''

        login({ variables: { username, password } })
    }

    if (!show) {
        return null
    }

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <div>
                <label>Username</label>
                <input type="text" name="username" />
            </div>
            <div>
                <label>Password</label>
                <input type="password" name="password" />
            </div>
            <button type='submit'>login</button>
        </form>
    )
}

export default Login