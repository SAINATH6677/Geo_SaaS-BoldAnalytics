import { useState } from 'react'
import api from '../api/axios'

function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {

    e.preventDefault()

    try {

      const res = await api.post('/admin/login', {
        email,
        password
      })

      localStorage.setItem('token', res.data.data.token)

      window.location.href = '/dashboard'

    } catch (err) {

      console.error(err)

      alert('Login failed')
    }
  }

  return (

    <div className="flex items-center justify-center h-screen bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded shadow w-96"
      >

        <h2 className="text-2xl font-bold mb-5 text-center">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Login
        </button>

      </form>

    </div>
  )
}

export default Login