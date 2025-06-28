import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Footer from '../homepage/Footer'
import useAuth from '../../store/auth'

function PaymentStatus() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [status, setStatus] = useState('loading') // loading, success, failed
  const [message, setMessage] = useState('')
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    async function checkPaymentStatus() {
      try {
        const merchantTransactionId = searchParams.get('merchantTransactionId')
        const transactionId = searchParams.get('transactionId')
        const status = searchParams.get('transactionStatus')
        const responseCode = searchParams.get('responseCode')

        if (!merchantTransactionId) {
          setStatus('failed')
          setMessage('Invalid payment response')
          return
        }

        // Check payment status with our backend
        const response = await fetch('/api/payment/phonepe/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ merchantTransactionId })
        })

        const data = await response.json()

        if (data.success && data.status === 'SUCCESS') {
          setStatus('success')
          setMessage('Payment completed successfully!')
          setOrderDetails({
            transactionId: data.transactionId,
            amount: data.amount
          })
        } else {
          setStatus('failed')
          setMessage(data.error || 'Payment failed or is pending')
        }
      } catch (error) {
        console.error('Payment status check failed:', error)
        setStatus('failed')
        setMessage('Failed to verify payment status')
      }
    }

    checkPaymentStatus()
  }, [searchParams, token])

  function handleContinue() {
    if (status === 'success') {
      navigate('/order-confirmation')
    } else {
      navigate('/products')
    }
  }

  return (
    <div className='bg-[#faf9fb] min-h-screen flex flex-col'>
      <main className='flex-grow max-w-2xl mx-auto w-full px-4 py-12'>
        <div className='bg-white rounded-lg shadow-lg p-8 text-center'>
          {status === 'loading' && (
            <div>
              <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-[#003D37] mx-auto mb-4'></div>
              <h1 className='text-2xl font-serif font-bold mb-4'>Verifying Payment</h1>
              <p className='text-gray-600'>Please wait while we verify your payment status...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                </svg>
              </div>
              <h1 className='text-2xl font-serif font-bold mb-4 text-green-800'>Payment Successful!</h1>
              <p className='text-gray-600 mb-6'>Your payment has been processed successfully.</p>
              {orderDetails && (
                <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium'>Transaction ID:</span>
                      <p className='text-gray-600'>{orderDetails.transactionId}</p>
                    </div>
                    <div>
                      <span className='font-medium'>Amount:</span>
                      <p className='text-gray-600'>₹{orderDetails.amount}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleContinue}
                className='bg-[#003D37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#002a25] transition-colors'
              >
                Continue to Order Confirmation
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </div>
              <h1 className='text-2xl font-serif font-bold mb-4 text-red-800'>Payment Failed</h1>
              <p className='text-gray-600 mb-6'>{message}</p>
              <div className='space-y-3'>
                <button
                  onClick={() => navigate('/checkout')}
                  className='bg-[#003D37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#002a25] transition-colors mr-3'
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className='bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors'
                >
                  Back to Products
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PaymentStatus 