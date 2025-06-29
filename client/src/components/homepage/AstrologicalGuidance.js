import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../store/auth'
import AuthPromptModal from './AuthPromptModal'

function AstrologicalGuidance () {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    fetch('/api/services')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch services')
        return res.json()
      })
      .then(data => {
        setServices(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Placeholder icons
  const icons = [
    <svg width='32' height='32' fill='none' viewBox='0 0 32 32'><circle cx='16' cy='16' r='15' stroke='#D4AF37' strokeWidth='2'/><ellipse cx='16' cy='16' rx='10' ry='5' stroke='#D4AF37' strokeWidth='2'/></svg>,
    <svg width='32' height='32' fill='none' viewBox='0 0 32 32'><rect x='6' y='14' width='20' height='4' fill='#D4AF37'/><rect x='14' y='6' width='4' height='20' fill='#D4AF37'/></svg>,
    <svg width='32' height='32' fill='none' viewBox='0 0 32 32'><rect x='6' y='6' width='8' height='8' fill='#D4AF37'/><rect x='18' y='6' width='8' height='8' fill='#D4AF37'/><rect x='6' y='18' width='8' height='8' fill='#D4AF37'/><rect x='18' y='18' width='8' height='8' fill='#D4AF37'/></svg>
  ]

  function handleBookNow (service) {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    // TODO: Booking logic here
    alert(`Booked: ${service.title}`)
  }

  function handleAuthConfirm () {
    setShowAuthModal(false)
    navigate('/login')
  }

  return (
    <section className='w-full bg-gray-100 py-1 flex justify-center'>
      <div
        className='w-[90%] rounded-xl shadow-lg p-8 flex flex-col items-center border border-gray-300'
        style={{ background: '#cfd8dc' }}
      >
        <AuthPromptModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onConfirm={handleAuthConfirm}
          message='You must be logged in to book a session.'
        />
        <h2 className='text-2xl md:text-3xl font-serif font-bold text-center text-gray-900 mb-10'>Expert Astrological Guidance</h2>
        {loading && <div className='text-gray-500'>Loading...</div>}
        {error && <div className='text-red-500'>{error}</div>}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl px-4'>
          {services.map((service, i) => (
            <div key={service.title} className='flex flex-col justify-between bg-white rounded-xl shadow p-8 min-h-[220px] border border-gray-300'>
              <div className='mb-6'>{icons[i % icons.length]}</div>
              <div className='font-serif font-bold text-lg text-gray-900 mb-1'>{service.title}</div>
              <div className='text-gray-600 text-sm mb-4' style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{service.description}</div>
            </div>
          ))}
        </div>
        <div className='w-full flex justify-center mt-10'>
          <button
            className='px-10 py-3 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824] text-lg shadow'
            onClick={() => navigate('/consultation')}
          >
            Book Now
          </button>
        </div>
      </div>
    </section>
  )
}

export default AstrologicalGuidance 