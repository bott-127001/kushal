import React from 'react'
import { useNavigate } from 'react-router-dom'

function HeroSection () {
  const navigate = useNavigate()
  return (
    <section className='flex flex-col items-center justify-center min-h-[60vh] bg-gray-300 text-center'>
      <h1 className='text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4'>Where Gemstones Meet Astrology</h1>
      <p className='text-gray-700 text-lg mb-8 font-serif'>Designed by Nature. Selected for Your Journey.</p>
      <div className='flex space-x-4'>
        <button
          className='px-8 py-3 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824]'
          onClick={() => navigate('/products')}
        >
          Shop Gemstones
        </button>
        <button className='px-8 py-3 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824]'
          onClick={() => navigate('/consultation')}
        >Book Consultation</button>
      </div>
    </section>
  )
}

export default HeroSection 