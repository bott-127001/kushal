import React from 'react'

function ZodiacFinder () {
  return (
    <section className='w-full bg-gray-100 py-12 flex flex-col items-center'>
      <h2 className='text-2xl md:text-3xl font-serif font-bold text-center mb-2'>Discover Your Zodiac Sign</h2>
      <p className='text-gray-600 text-center mb-8'>Let the stars guide you to your perfect gemstone match</p>
      <div className='bg-white rounded-lg shadow mx-4 w-full max-w-3xl p-8 flex flex-col items-center'>
        <form className='w-full'>
          <div className='flex flex-col md:flex-row md:space-x-8 mb-6'>
            <div className='flex-1 mb-4 md:mb-0'>
              <label className='block font-semibold mb-2 text-center md:text-left'>Birth Date</label>
              <input type='date' className='w-full bg-gray-100 border border-gray-200 rounded px-4 py-2' placeholder='Select Date' />
            </div>
            <div className='flex-1'>
              <label className='block font-semibold mb-2 text-center md:text-left'>Birth Time</label>
              <input type='time' className='w-full bg-gray-100 border border-gray-200 rounded px-4 py-2' placeholder='Select Time' />
            </div>
          </div>
          <button type='submit' className='w-full bg-[#003D37] text-white font-serif py-3 rounded mt-2 transition hover:bg-[#002824]'>Find My Stone</button>
        </form>
      </div>
    </section>
  )
}

export default ZodiacFinder
