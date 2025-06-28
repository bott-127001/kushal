import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Footer from '../homepage/Footer'

function ResetPassword () {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  async function handleSubmit (e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword: password })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='min-h-screen flex flex-col'>
        <main className='flex-grow flex items-center justify-center bg-gray-200 px-4'>
          <div className='max-w-md w-full'>
            <div className='bg-white rounded-xl shadow-lg p-8 text-center border-2 border-black'>
              <div className='text-green-600 mb-4'>
                <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <h1 className='text-2xl font-serif font-bold text-[#003D37] mb-4'>Password Reset Successful!</h1>
              <p className='text-[#003D37] mb-6'>Your password has been reset successfully. You will be redirected to the login page.</p>
              <Link to='/login' className='text-[#003D37] hover:underline font-medium'>
                Go to Login
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className='min-h-screen flex flex-col'>
        <main className='flex-grow flex items-center justify-center bg-gray-200 px-4'>
          <div className='max-w-md w-full'>
            <div className='bg-white rounded-xl shadow-lg p-8 text-center border-2 border-black'>
              <div className='text-red-600 mb-4'>
                <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                </svg>
              </div>
              <h1 className='text-2xl font-serif font-bold text-[#003D37] mb-4'>Invalid Reset Link</h1>
              <p className='text-[#003D37] mb-6'>{error}</p>
              <Link to='/forgot-password' className='text-[#003D37] hover:underline font-medium'>
                Request New Reset Link
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-grow flex items-center justify-center bg-gray-200 px-4'>
        <div className='max-w-md w-full'>
          <div className='bg-white rounded-xl shadow-lg p-8 border-2 border-black'>
            <div className='text-center mb-8'>
              <h1 className='text-2xl font-serif font-bold text-[#003D37] mb-2'>Reset Password</h1>
              <p className='text-[#003D37]'>Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label htmlFor='password' className='block text-sm font-medium text-[#003D37] mb-2'>
                  New Password
                </label>
                <input
                  type='password'
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-black rounded-lg bg-white text-black focus:ring-2 focus:ring-[#003D37] focus:border-transparent'
                  placeholder='Enter new password'
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-[#003D37] mb-2'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  id='confirmPassword'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-black rounded-lg bg-white text-black focus:ring-2 focus:ring-[#003D37] focus:border-transparent'
                  placeholder='Confirm new password'
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className='text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black'
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword 