import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminLogin () {
  const [form, setForm] = useState({ email: '', password: '', adminCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleChange (e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('adminToken', data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#23233a] to-[#faf9fb]'>
      <form className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-md flex flex-col gap-4' onSubmit={handleSubmit}>
        <h2 className='text-2xl font-serif font-bold text-center mb-2 text-[#1a2a6c]'>Admin Login</h2>
        <input
          type='email'
          name='email'
          placeholder='Admin Email'
          className='border border-gray-300 rounded px-3 py-2'
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type='password'
          name='password'
          placeholder='Password'
          className='border border-gray-300 rounded px-3 py-2'
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type='text'
          name='adminCode'
          placeholder='Admin Code'
          className='border border-gray-300 rounded px-3 py-2'
          value={form.adminCode}
          onChange={handleChange}
          required
        />
        {error && <div className='text-red-500 text-center'>{error}</div>}
        <button
          type='submit'
          className='w-full py-3 bg-[#FFD700] text-white font-serif rounded transition hover:brightness-110 mt-2 font-bold'
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin 