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
      <main className='flex-grow max-w-6xl mx-auto w-full px-4 py-10'>
        <h1 className='text-2xl md:text-3xl font-serif font-bold mb-8'>Shopping Cart ({items.length} items)</h1>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Cart Items */}
          <div className='flex-1 space-y-6'>
            {items.length === 0 && <div className='text-gray-500'>Your cart is empty.</div>}
            {items.map(item => (
              <div key={item.productId} className='bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between p-6'>
                <div className='flex flex-col gap-1 flex-1'>
                  <div className='font-serif font-semibold text-lg'>{item.title}</div>
                  {item.subtitle && <div className='text-gray-500 text-sm'>{item.subtitle}</div>}
                  <div className='flex items-center mt-3 gap-2'>
                    <button className='w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100'
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity === 1}>-</button>
                    <span className='px-2'>{item.quantity}</span>
                    <button className='w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100'
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className='flex flex-col items-end mt-4 md:mt-0'>
                  <button className='mb-2 text-red-400 hover:text-[#D4AF37]' onClick={() => removeFromCart(item.productId)}>
                    <svg width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M6 6L18 18M6 18L18 6'/></svg>
                  </button>
                  <div className='font-serif font-bold text-lg text-right'>
                    ${Number(String(item.price).replace(/[^0-9.]/g, '')).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Order Summary */}
          <div className='w-full md:w-80 bg-white rounded-xl shadow p-6 h-fit'>
            <h2 className='font-serif font-bold text-lg mb-6'>Order Summary</h2>
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
              className='w-full py-3 bg-[#2d223c] text-white font-serif rounded transition hover:brightness-110 mb-4'
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
        {/* You May Also Like */}
        <div className='mt-16'>
          <h2 className='font-serif font-bold text-lg mb-6'>You May Also Like</h2>
          {lastAddedId && (
            <div className='fixed top-6 right-6 z-50 bg-[#D4AF37] text-white px-6 py-3 rounded shadow font-semibold animate-fadeInToast'
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
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {recommendations.map(product => (
              <div key={product._id} className='cursor-pointer' onClick={() => navigate(`/products/${product._id}`)}>
                <ProductCard product={product} addToCart={addToCart} isInCart={!!items.find(item => item.id === (product.id || product._id))} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CartPage 