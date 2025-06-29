import React, { useEffect, useState } from 'react'

function CelestialInsights () {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function CelestialInsights () {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/insights')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch insights')
        return res.json()
      })
      .then(data => {
        setInsights(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <section className='w-full bg-gray-100 py-1 flex justify-center'>
      <div className='w-[90%] rounded-xl bg-white shadow-lg p-8 flex flex-col items-center border border-gray-300'>
        <h2 className='text-2xl md:text-3xl font-serif font-bold text-center mb-10'>Celestial Insights</h2>
        {loading && <div className='text-gray-500'>Loading...</div>}
        {error && <div className='text-red-500'>{error}</div>}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl px-4'>
          {insights.map(insight => (
            <div key={insight.title} className='flex flex-col bg-white rounded-xl shadow border border-gray-100 p-8 min-h-[220px]'>
              <div className='flex items-center mb-4'>
                <img src={insight.image || 'https://via.placeholder.com/80x80?text=Img'} alt={insight.category} className='w-16 h-16 rounded mr-4 object-cover'/>
                <span className='text-sm font-semibold' style={{ color: '#D4AF37' }}>{insight.category}</span>
              </div>
              <div className='font-serif font-bold text-lg mb-2'>{insight.title}</div>
              <Link to={`/blogs/${insight._id || insight.slug}`} className='text-sm font-semibold text-[#003D37] hover:text-[#002824] transition'>Read More &rarr;</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CelestialInsights 
  useEffect(() => {
    fetch('/api/insights')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch insights')
        return res.json()
      })
      .then(data => {
        setInsights(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <section className='w-full bg-gray-100 py-1 flex justify-center'>
      <div className='w-[90%] rounded-xl bg-white shadow-lg p-8 flex flex-col items-center border border-gray-300'>
        <h2 className='text-2xl md:text-3xl font-serif font-bold text-center mb-10'>Celestial Insights</h2>
        {loading && <div className='text-gray-500'>Loading...</div>}
        {error && <div className='text-red-500'>{error}</div>}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl px-4'>
          {insights.map(insight => (
            <div key={insight.title} className='flex flex-col bg-white rounded-xl shadow border border-gray-100 p-8 min-h-[220px]'>
              <div className='flex items-center mb-4'>
                <img src={insight.image || 'https://via.placeholder.com/80x80?text=Img'} alt={insight.category} className='w-16 h-16 rounded mr-4 object-cover'/>
                <span className='text-sm font-semibold' style={{ color: '#D4AF37' }}>{insight.category}</span>
              </div>
              <div className='font-serif font-bold text-lg mb-2'>{insight.title}</div>
              <a href={insight.link} className='text-sm font-semibold text-[#003D37] hover:text-[#002824] transition'>Read More &rarr;</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CelestialInsights 
