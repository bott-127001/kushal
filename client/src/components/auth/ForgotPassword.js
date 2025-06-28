import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../homepage/Footer'

function ForgotPassword () {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit (e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setEmail('')
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-grow flex items-center justify-center bg-gray-200 px-4'>
        <div className='max-w-md w-full'>
          <div className='bg-white rounded-xl shadow-lg p-8 border-2 border-black'>
            <div className='text-center mb-8'>
              <h1 className='text-2xl font-serif font-bold text-[#003D37] mb-2'>Forgot Password</h1>
              <p className='text-[#003D37]'>Enter your email to receive a password reset link</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-[#003D37] mb-2'>
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-black rounded-lg bg-white text-black focus:ring-2 focus:ring-[#003D37] focus:border-transparent'
                  placeholder='Enter your email'
                  required
                />
              </div>

              {error && (
                <div className='text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200'>
                  {error}
                </div>
              )}

              {message && (
                <div className='text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200'>
                  {message}
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black'
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className='mt-6 text-center'>
              <Link to='/login' className='text-[#003D37] hover:underline text-sm font-medium'>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ForgotPassword 