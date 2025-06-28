import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../store/auth'
import useCart from '../../store/cart'
import AuthPromptModal from './AuthPromptModal'

function FeaturedGemstones () {
  const [gemstones, setGemstones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()
  const addToCart = useCart(state => state.addToCart)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    fetch('/api/products?page=1&limit=3')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        setGemstones(data.products)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  async function handleAddToCart (gem) {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    // Map gem fields to cart product fields
    await addToCart({
      _id: gem._id || gem.id,
      title: gem.title,
      price: gem.price,
      image: gem.image || '',
    }, 1)
    setToastMsg(`${gem.title} added to cart!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  function handleAuthConfirm () {
    setShowAuthModal(false)
    navigate('/login')
  }

  return (
    <section className='w-full bg-gray-100 py-1 flex justify-center'>
      <div className='w-[90%] rounded-xl bg-white shadow-lg p-8 flex flex-col items-center border border-gray-300'>
        <AuthPromptModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onConfirm={handleAuthConfirm}
          message='You must be logged in to add items to your cart.'
        />
        {/* Toast Popup */}
        {showToast && (
          <div className='fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeInToast'>
            <svg className='w-5 h-5 text-[#003D37]' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' /></svg>
            <span className='font-serif'>{toastMsg}</span>
          </div>
        )}
        <style>{`
          @keyframes fadeInToast {
            0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fadeInToast {
            animation: fadeInToast 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
          }
        `}</style>
        <h2 className='text-2xl md:text-3xl font-serif font-bold text-center mb-10 text-gray-900'>Featured Gemstones</h2>
        {loading && <div className='text-gray-500'>Loading...</div>}
        {error && <div className='text-red-500'>{error}</div>}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl px-4'>
          {gemstones.map((gem, i) => (
            <div key={gem._id || gem.title} className='flex flex-col justify-between bg-gray-50 rounded-xl shadow border border-gray-100 p-8 min-h-[180px]'>
              <div>
                <div className='font-serif font-bold text-lg mb-1 text-gray-900'>{gem.title}</div>
                <div className='text-gray-600 text-sm mb-2'>{gem.description}</div>
                <div className='text-[#003D37] font-serif font-semibold text-base mb-6'>{gem.price}</div>
              </div>
              <button
                className='self-end px-6 py-2 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824]'
                onClick={() => handleAddToCart(gem)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        <button
          className='mt-10 px-8 py-3 bg-[#003D37] text-white font-serif rounded transition hover:bg-[#002824]'
          onClick={() => navigate('/products')}
        >
          Shop All Gemstones
        </button>
      </div>
    </section>
  )
}

export default FeaturedGemstones 