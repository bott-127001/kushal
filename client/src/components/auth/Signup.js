import React, { useState } from 'react'

function Signup () {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpStatus, setOtpStatus] = useState('idle') // idle | loading | sent | error
  const [otpError, setOtpError] = useState(null)
  const [otpResendTimer, setOtpResendTimer] = useState(0)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)

  async function handleRequestOtp (e) {
    e.preventDefault()
    setOtpStatus('loading')
    setOtpError(null)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      setOtpSent(true)
      setOtpStatus('sent')
      setOtpResendTimer(60)
      // Start resend timer
      const timer = setInterval(() => {
        setOtpResendTimer(t => {
          if (t <= 1) { clearInterval(timer); return 0 }
          return t - 1
        })
      }, 1000)
    } catch (err) {
      setOtpStatus('error')
      setOtpError(err.message)
    }
  }

  async function handleVerifyOtp (e) {
    e.preventDefault()
    setOtpStatus('loading')
    setOtpError(null)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OTP verification failed')
      setOtpVerified(true)
      setOtpStatus('sent')
    } catch (err) {
      setOtpStatus('error')
      setOtpError(err.message)
    }
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setStatus('loading')
    setError(null)
    if (!otpVerified) {
      setError('Please verify your email with OTP before signing up.')
      setStatus('error')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setStatus('error')
      return
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setStatus('success')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1200)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-200'>
      <form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col border-2 border-black'>
        <h2 className='text-2xl font-bold font-serif text-center mb-6 text-[#003D37]'>Sign Up</h2>
        <label className='mb-2 text-sm font-semibold text-[#003D37]'>Full Name</label>
        <input
          type='text'
          className='mb-4 px-4 py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37]'
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <label className='mb-2 text-sm font-semibold text-[#003D37]'>Email</label>
        <input
          type='email'
          className='mb-4 px-4 py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37]'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div className='flex flex-col sm:flex-row gap-2 mb-4 w-full'>
          <input
            type='text'
            placeholder='Enter OTP'
            className='flex-[2] min-w-0 px-4 py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37]'
            value={otp}
            onChange={e => setOtp(e.target.value)}
            disabled={!otpSent}
          />
          <button
            type='button'
            className='flex-[1] w-full sm:w-auto px-2 py-2 h-11 sm:h-auto bg-black text-white rounded font-semibold hover:bg-[#003D37] transition-colors disabled:opacity-60 text-sm'
            onClick={handleRequestOtp}
            disabled={otpResendTimer > 0 || otpStatus === 'loading' || !email}
          >
            {otpResendTimer > 0 ? `Resend (${otpResendTimer})` : 'Request OTP'}
          </button>
          <button
            type='button'
            className='flex-[1] w-full sm:w-auto px-2 py-2 h-11 sm:h-auto bg-black text-white rounded font-semibold hover:bg-[#003D37] transition-colors disabled:opacity-60 text-sm'
            onClick={handleVerifyOtp}
            disabled={!otpSent || otpStatus === 'loading' || !otp}
          >
            Verify OTP
          </button>
        </div>
        {otpStatus === 'sent' && otpVerified && <div className='text-green-600 text-center mb-2'>OTP verified!</div>}
        {otpStatus === 'error' && <div className='text-red-600 text-center mb-2'>{otpError}</div>}
        <label className='mb-2 text-sm font-semibold text-[#003D37]'>Password</label>
        <input
          type='password'
          className='mb-2 px-4 py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37]'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <label className='mb-2 text-sm font-semibold text-[#003D37]'>Confirm Password</label>
        <input
          type='password'
          className='mb-6 px-4 py-2 border-2 border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#003D37]'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type='submit'
          className='bg-black text-white font-semibold py-2 rounded hover:bg-gray-800 transition mb-4 border-2 border-black'
          disabled={status === 'loading' || !otpVerified}
        >
          {status === 'loading' ? 'Signing Up...' : 'Sign Up'}
        </button>
        {status === 'success' && <div className='text-green-600 text-center mb-2'>Registration successful! Redirecting...</div>}
        {status === 'error' && <div className='text-red-600 text-center mb-2'>{error}</div>}
        <div className='text-center text-sm text-[#003D37]'>
          Already have an account? <a href='/login' className='text-[#003D37] hover:underline'>Sign In</a>
        </div>
      </form>
    </div>
  )
}

export default Signup 