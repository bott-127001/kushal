import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_ENDPOINTS } from '../../config/api'

function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)

  async function handleSubmit (e) {
    e.preventDefault()
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setStatus('success')
      localStorage.setItem('token', data.token)
      setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-200 px-4 py-8'>
      <form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-sm flex flex-col border-2 border-black'>
        <h2 className='text-xl md:text-2xl font-bold font-serif text-center mb-4 md:mb-6 text-[#003D37]'>Sign In</h2>
        
        <label className='mb-2 text-sm font-semibold text-[#003D37]'>Email</label>
        <input
          type='email'
          className='mb-4 px-3 md:px-4 py-2 md:py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37] text-sm md:text-base'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        
        <label className='mb-2 text-sm font-semibold text-[#003D37]'>Password</label>
        <input
          type='password'
          className='mb-2 px-3 md:px-4 py-2 md:py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37] text-sm md:text-base'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        
        <div className='text-right mb-4'>
          <Link to='/forgot-password' className='text-xs md:text-sm text-[#003D37] hover:underline'>
            Forgot Password?
          </Link>
        </div>
        
        <button
          type='submit'
          className='bg-black text-white font-semibold py-2 md:py-2 rounded hover:bg-gray-800 transition mb-4 border-2 border-black text-sm md:text-base'
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing In...' : 'Login'}
        </button>
        
        {status === 'success' && <div className='text-green-600 text-center mb-2 text-sm'>Login successful! Redirecting...</div>}
        {status === 'error' && <div className='text-red-600 text-center mb-2 text-sm'>{error}</div>}
        
        <div className='text-center text-xs md:text-sm text-[#003D37]'>
          Don&apos;t have an account? <a href='/signup' className='text-[#003D37] hover:underline'>Sign Up</a>
        </div>
      </form>
    </div>
  )
}

export default Login 
