import React from 'react'
import Footer from '../homepage/Footer'
import { useNavigate } from 'react-router-dom'

function OrderConfirmation () {
  const navigate = useNavigate()
  return (
    <div className='bg-[#faf9fb] min-h-screen flex flex-col'>
      <main className='flex-grow flex flex-col items-center justify-center px-4 py-16'>
        <div className='bg-white rounded-xl shadow p-8 max-w-md w-full text-center'>
          <svg width='48' height='48' fill='none' viewBox='0 0 48 48' className='mx-auto mb-4'><circle cx='24' cy='24' r='24' fill='#D4AF37' opacity='0.1'/><path d='M16 24l6 6 10-10' stroke='#D4AF37' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'/></svg>
          <h1 className='text-2xl font-serif font-bold mb-2'>Thank you for your order!</h1>
          <p className='text-gray-700 mb-6'>Your order has been placed successfully. You will receive a confirmation email shortly.</p>
          <button className='px-6 py-3 bg-[#5B4DB1] text-white font-serif rounded transition hover:brightness-110' onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default OrderConfirmation 