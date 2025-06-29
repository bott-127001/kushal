import React, { useState } from 'react'

function Newsletter () {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)

  function handleSubmit (e) {
    e.preventDefault()
    setStatus('loading')
    setError(null)
    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to subscribe')
        return res.json()
      })
      .then(() => {
        setStatus('success')
        setEmail('')
      })
      .catch(err => {
        setStatus('error')
        setError(err.message)
      })
  }

  return (
    <section className='w-full bg-gray-100 py-1 flex flex-col items-center'>
      <div className='bg-white rounded-lg shadow mx-4 w-full max-w-3xl p-8 flex flex-col items-center'>
        <h2 className='text-2xl md:text-3xl font-serif font-bold text-center text-[#18182a] mb-2'>Join Our Celestial Journey</h2>
        <p className='text-gray-600 text-center mb-8'>Subscribe to receive celestial insights and exclusive offers</p>
        <form className='flex flex-col md:flex-row items-center w-full' onSubmit={handleSubmit}>
          <input
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='flex-1 px-4 py-3 rounded-l md:rounded-l-md md:rounded-r-none bg-[#d1fae5] text-[#003D37] placeholder-gray-500 focus:outline-none mb-4 md:mb-0 md:mr-4'
            required
          />
          <button
            type='submit'
            className='px-8 py-3 bg-[#003D37] text-white font-serif rounded md:rounded-l-none md:rounded-r-md transition hover:bg-[#002824]'
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && <div className='text-green-400 mt-4'>Subscribed successfully!</div>}
        {status === 'error' && <div className='text-red-400 mt-4'>{error}</div>}
      </div>
    </section>
  )
}

export default Newsletter