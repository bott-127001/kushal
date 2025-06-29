import React from 'react'
import { useNavigate } from 'react-router-dom'

function HeroSection () {
  const navigate = useNavigate()
  return (
    <section className='flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] bg-gray-300 text-center px-4 md:px-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 md:mb-6 leading-tight'>
          Where Gemstones Meet Astrology
        </h1>
        <p className='text-gray-700 text-base sm:text-lg md:text-xl mb-6 md:mb-8 font-serif px-4'>
          Designed by Nature. Selected for Your Journey.
        </p>
        <div className='flex flex-row space-x-2 justify-center items-center'>
          <button
            className='px-3 py-1.5 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824] text-xs font-semibold min-w-[90px]'
            onClick={() => navigate('/products')}
          >
            Shop Gemstones
          </button>
          <button 
            className='px-3 py-1.5 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824] text-xs font-semibold min-w-[90px]'
            onClick={() => navigate('/consultation')}
          >
            Book Consultation
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection 