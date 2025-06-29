import React, { useEffect, useState } from 'react'
import Footer from '../homepage/Footer'
import useCart from '../../store/cart'
import ProductCard from './ProductCard'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../store/auth'

function CartPage () {
  const { items, updateQuantity, removeFromCart, addToCart, lastAddedId, clearLastAdded } = useCart()
  const { isAuthenticated } = useAuth()
  const subtotal = items.reduce((sum, item) => sum + Number(String(item.price).replace(/[^0-9.]/g, '')) * item.quantity, 0)
  const [recommendations, setRecommendations] = useState([])
  const navigate = useNavigate()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const exclude = items.map(item => item.id).join(',')
    fetch(`/api/products/recommendations?exclude=${exclude}`)
      .then(res => res.json())
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
  }, [items])

  return (
    <div className='bg-[#faf9fb] min-h-screen flex flex-col'>
      <main className='flex-grow max-w-6xl mx-auto w-full px-4 py-6 md:py-10'>
        <h1 className='text-xl md:text-2xl lg:text-3xl font-serif font-bold mb-6 md:mb-8'>Shopping Cart ({items.length} items)</h1>
        
        <div className='flex flex-col lg:flex-row gap-6 md:gap-8'>
          {/* Cart Items */}
          <div className='flex-1 space-y-4 md:space-y-6'>
            {items.length === 0 && (
              <div className='text-gray-500 text-center py-8 md:py-12'>
                <div className='text-lg md:text-xl mb-4'>Your cart is empty.</div>
                <button 
                  onClick={() => navigate('/products')}
                  className='px-6 py-3 bg-[#003D37] text-white rounded hover:bg-[#002824] transition'
                >
                  Continue Shopping
                </button>
              </div>
            )}
            {items.map(item => (
              <div key={item.productId} className='bg-white rounded-xl shadow flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6'>
                <div className='flex flex-col gap-2 flex-1 w-full sm:w-auto'>
                  <div className='font-serif font-semibold text-base md:text-lg'>{item.title}</div>
                  {item.subtitle && <div className='text-gray-500 text-sm'>{item.subtitle}</div>}
                  <div className='flex items-center justify-between sm:justify-start mt-3 gap-4'>
                    <div className='flex items-center gap-2'>
                      <button className='w-8 h-8 md:w-7 md:h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100 transition'
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity === 1}>-</button>
                      <span className='px-2 min-w-[2rem] text-center'>{item.quantity}</span>
                      <button className='w-8 h-8 md:w-7 md:h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100 transition'
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <div className='font-serif font-bold text-lg'>
                      ${Number(String(item.price).replace(/[^0-9.]/g, '')).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-end mt-4 sm:mt-0 w-full sm:w-auto'>
                  <button className='text-red-400 hover:text-red-600 transition' onClick={() => removeFromCart(item.productId)}>
                    <svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M6 6L18 18M6 18L18 6'/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className='w-full lg:w-80 bg-white rounded-xl shadow p-4 md:p-6 h-fit'>
            <h2 className='font-serif font-bold text-lg mb-4 md:mb-6'>Order Summary</h2>
            <div className='flex justify-between mb-2 text-sm'>
              <span>Subtotal</span>
              <span className='font-semibold'>${Number(subtotal).toFixed(2)}</span>
            </div>
            <div className='flex justify-between mb-2 text-sm'>
              <span>Shipping</span>
              <span className='text-gray-500'>Calculated at checkout</span>
            </div>
            <div className='flex justify-between mb-4 text-sm'>
              <span>Estimated Tax</span>
              <span className='text-gray-500'>Calculated at checkout</span>
            </div>
            <div className='flex justify-between mb-6 text-base font-bold'>
              <span>Total</span>
              <span>${Number(subtotal).toFixed(2)}</span>
            </div>
            <button
              className='w-full py-3 bg-[#2d223c] text-white font-serif rounded transition hover:brightness-110 mb-4 text-sm md:text-base'
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
        
        {/* You May Also Like */}
        {recommendations.length > 0 && (
          <div className='mt-12 md:mt-16'>
            <h2 className='font-serif font-bold text-lg mb-6'>You May Also Like</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
              {recommendations.map(product => (
                <div key={product._id} className='cursor-pointer' onClick={() => navigate(`/products/${product._id}`)}>
                  <ProductCard product={product} addToCart={addToCart} isInCart={!!items.find(item => item.id === (product.id || product._id))} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {lastAddedId && (
          <div className='fixed top-6 right-6 z-50 bg-[#D4AF37] text-white px-4 md:px-6 py-3 rounded shadow font-semibold animate-fadeInToast text-sm'
            onAnimationEnd={clearLastAdded}
          >
            Added to cart!
            <style>{`
              @keyframes fadeInToast {
                0% { opacity: 0; transform: translateY(-20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
              }
              .animate-fadeInToast {
                animation: fadeInToast 2s ease-in-out;
              }
            `}</style>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default CartPage 
