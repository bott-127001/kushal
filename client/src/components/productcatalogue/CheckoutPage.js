import React, { useState, useEffect } from 'react'
import Footer from '../homepage/Footer'
import useCart from '../../store/cart'
import useAuth from '../../store/auth'
import { useNavigate } from 'react-router-dom'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import styles from './CheckoutPage.module.styl'

const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India']

const PAYMENT_METHODS = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Pay with Visa, Mastercard, or other cards',
    icon: '💳',
    available: true
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    description: 'Pay with UPI, cards, or wallet',
    icon: '📱',
    available: true
  }
]

function CheckoutPage () {
  const { items: cartItems, checkout } = useCart()
  const { isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const [form, setForm] = useState({
    email: '',
    phone: '',
    name: '',
    address: '',
    city: '',
    zip: '',
    country: countries[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [promo, setPromo] = useState('')
  const [promoStatus, setPromoStatus] = useState(null) // null | 'valid' | 'invalid'
  const [discount, setDiscount] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe')

  // Calculate order summary
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity), 0)
  const shipping = 0 // Assuming free shipping for now
  const tax = +(subtotal * 0.09).toFixed(2)
  const total = +(subtotal + shipping + tax).toFixed(2)
  const discountedTotal = +(total - discount).toFixed(2)

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/products')
    }
  }, [cartItems, navigate])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  function validateForm () {
    return form.email && form.phone && form.name && form.address && form.city && form.zip && form.country
  }

  async function handleStripePayment() {
    if (!stripe || !elements) {
      setError('Stripe is not loaded')
      return
    }

      // 1. Create payment intent
    const res = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      body: JSON.stringify({ amount: discountedTotal, currency: 'usd' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create payment intent')
      const clientSecret = data.clientSecret

      // 2. Confirm card payment
      const cardElement = elements.getElement(CardElement)
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.name,
            email: form.email,
            address: {
              line1: form.address,
              city: form.city,
              postal_code: form.zip,
              country: form.country
            }
          }
        }
      })
      if (paymentResult.error) {
      throw new Error(paymentResult.error.message)
      }
      if (paymentResult.paymentIntent.status !== 'succeeded') {
      throw new Error('Payment was not successful')
    }

    return paymentResult.paymentIntent.id
  }

  async function handlePhonePePayment() {
    // Create order first
    const orderDetails = {
      ...form,
      items: cartItems.map(({ id, title, price, quantity }) => ({ productId: id, title, price, quantity })),
      subtotal,
      shipping,
      tax,
      total: discountedTotal
    }

    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderDetails)
    })

    if (!orderRes.ok) {
      const errorData = await orderRes.json()
      throw new Error(errorData.error || 'Failed to create order')
    }

    const orderData = await orderRes.json()
    const orderId = orderData.orderId

    // Create PhonePe payment
    const phonepeRes = await fetch('/api/payment/phonepe/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: discountedTotal,
        currency: 'INR',
        orderId,
        customerInfo: {
          phone: form.phone,
          email: form.email,
          name: form.name
        }
      })
    })

    const phonepeData = await phonepeRes.json()
    if (!phonepeRes.ok) {
      throw new Error(phonepeData.error || 'Failed to create PhonePe payment')
    }

    // Redirect to PhonePe payment page
    window.location.href = phonepeData.redirectUrl
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setError(null)
    if (!validateForm()) {
      setError('Please fill in all required fields.')
        return
      }
    setLoading(true)
    try {
      let paymentIntentId

      if (selectedPaymentMethod === 'stripe') {
        paymentIntentId = await handleStripePayment()
      } else if (selectedPaymentMethod === 'phonepe') {
        await handlePhonePePayment()
        return // PhonePe will redirect, so we don't continue
      }

      // For Stripe, create order in backend
      if (selectedPaymentMethod === 'stripe') {
      const orderDetails = {
        ...form,
        items: cartItems.map(({ id, title, price, quantity }) => ({ productId: id, title, price, quantity })),
        subtotal,
        shipping,
        tax,
          total: discountedTotal
      }
        const confirmRes = await fetch('/api/payment/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
          body: JSON.stringify({ paymentIntentId, orderDetails })
      })
      const confirmData = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Order creation failed')
      }

      navigate('/order-confirmation')
    } catch (err) {
      setError(err.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  function handleApplyPromo (e) {
    e.preventDefault()
    if (promo.trim().toUpperCase() === 'SAVE10') {
      const promoDiscount = +(total * 0.1).toFixed(2)
      setDiscount(promoDiscount)
      setPromoStatus('valid')
    } else {
      setDiscount(0)
      setPromoStatus('invalid')
    }
  }

  return (
    <div className='bg-[#faf9fb] min-h-screen flex flex-col'>
      <main className='flex-grow max-w-5xl mx-auto w-full px-4 py-12'>
        {/* Stepper */}
        <div className='flex items-center justify-center mb-10 gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='w-6 h-6 flex items-center justify-center rounded-full bg-[#D4AF37] text-white font-bold'>1</span>
            <span>Cart</span>
          </div>
          <span className='text-gray-400'>›</span>
          <div className='flex items-center gap-2'>
            <span className='w-6 h-6 flex items-center justify-center rounded-full bg-[#5B4DB1] text-white font-bold'>2</span>
            <span className='text-[#5B4DB1] font-semibold'>Payment</span>
          </div>
          <span className='text-gray-400'>›</span>
          <div className='flex items-center gap-2'>
            <span className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold'>3</span>
            <span className='text-gray-500'>Confirmation</span>
          </div>
        </div>
        <div className='flex flex-col md:flex-row gap-12'>
          {/* Left: Form */}
          <form className='flex-1' id='checkout-form' autoComplete='off' onSubmit={handleSubmit}>
            <h1 className='text-2xl font-serif font-bold mb-8'>Checkout</h1>
            <div className='mb-8'>
              <div className='font-semibold mb-2'>Contact Information</div>
              <input type='email' className='w-full border border-gray-300 rounded px-4 py-3 mb-4' placeholder='your@email.com' value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <input type='tel' className='w-full border border-gray-300 rounded px-4 py-3' placeholder='+1 (555) 000-0000' value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>
            <div className='mb-8'>
              <div className='font-semibold mb-2'>Billing Information</div>
              <input type='text' className='w-full border border-gray-300 rounded px-4 py-3 mb-4' placeholder='Full Name' value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input type='text' className='w-full border border-gray-300 rounded px-4 py-3 mb-4' placeholder='Street Address' value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
              <div className='flex gap-4 mb-4'>
                <input type='text' className='flex-1 border border-gray-300 rounded px-4 py-3' placeholder='City' value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
                <input type='text' className='w-32 border border-gray-300 rounded px-4 py-3' placeholder='ZIP Code' value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} required />
              </div>
              <select className='w-full border border-gray-300 rounded px-4 py-3' value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            {/* Payment Method Selection */}
            <div className='mb-8'>
              <div className='font-semibold mb-4'>Payment Method</div>
              <div className='space-y-3'>
                {PAYMENT_METHODS.map(method => (
                  <label key={method.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedPaymentMethod === method.id ? 'border-[#003D37] bg-[#f0f9f8]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className='mr-3'
                      disabled={!method.available}
                    />
                    <div className='flex items-center flex-1'>
                      <span className='text-2xl mr-3'>{method.icon}</span>
                      <div>
                        <div className='font-medium'>{method.name}</div>
                        <div className='text-sm text-gray-600'>{method.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Stripe Card Element - only show if Stripe is selected */}
            {selectedPaymentMethod === 'stripe' && (
            <div className='mb-8'>
              <div className='font-semibold mb-2'>Card Details</div>
              <div className='border border-gray-300 rounded px-4 py-3 bg-white'>
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>
            )}

            {/* PhonePe Info - only show if PhonePe is selected */}
            {selectedPaymentMethod === 'phonepe' && (
              <div className='mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <span className='text-2xl mr-2'>📱</span>
                  <span className='font-semibold text-blue-800'>PhonePe Payment</span>
                </div>
                <p className='text-sm text-blue-700'>
                  You'll be redirected to PhonePe to complete your payment securely. 
                  You can pay using UPI, credit/debit cards, or your PhonePe wallet.
                </p>
              </div>
            )}

            {error && <div className='text-red-500 mb-4'>{error}</div>}
            <button type='submit' form='checkout-form' className='w-full py-3 bg-[#003D37] text-white font-serif rounded transition hover:brightness-110 mb-4' disabled={loading}>
              {loading ? 'Processing Payment...' : `Pay ₹${discountedTotal.toFixed(2)} & Place Order`}
            </button>
          </form>
          {/* Right: Order Summary */}
          <div className='w-full md:w-96 bg-white rounded-xl shadow p-6 h-fit'>
            <h2 className='font-serif font-bold text-lg mb-6'>Order Summary</h2>
            <div className='mb-4'>
              {cartItems.map(item => (
                <div key={item.id || item._id} className='flex justify-between items-center mb-2'>
                  <span className='text-sm'>{item.title}{item.subtitle ? ` (${item.subtitle})` : ''}</span>
                  <span className='font-semibold text-sm'>${parseFloat(item.price.replace(/[^0-9.]/g, '')).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className='flex justify-between mb-2 text-sm'>
              <span>Subtotal</span>
              <span className='font-semibold'>${subtotal.toFixed(2)}</span>
            </div>
            <div className='flex justify-between mb-2 text-sm'>
              <span>Shipping</span>
              <span className='text-gray-500'>${shipping.toFixed(2)}</span>
            </div>
            <div className='flex justify-between mb-4 text-sm'>
              <span>Tax</span>
              <span className='text-gray-500'>${tax.toFixed(2)}</span>
            </div>
            {/* Promo Code Section */}
            <form onSubmit={handleApplyPromo} className={`mb-4 ${styles.promoSection}`} autoComplete='off'>
              <label htmlFor='promo' className='block text-sm font-medium mb-1'>Promo Code</label>
              <div className='flex gap-2'>
                <input
                  id='promo'
                  type='text'
                  className={`flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B4DB1] ${styles.promoInput}`}
                  placeholder='Enter code'
                  value={promo}
                  onChange={e => { setPromo(e.target.value); setPromoStatus(null) }}
                />
                <button
                  type='submit'
                  className={`px-4 py-2 rounded font-semibold bg-[#5B4DB1] text-white transition hover:brightness-110 ${styles.promoButton}`}
                  disabled={!promo.trim()}
                >
                  Apply
                </button>
              </div>
              {promoStatus === 'valid' && (
                <div className='text-green-600 text-xs mt-1'>Promo code applied! 10% off</div>
              )}
              {promoStatus === 'invalid' && (
                <div className='text-red-500 text-xs mt-1'>Invalid promo code</div>
              )}
            </form>
            {discount > 0 && (
              <div className='flex justify-between mb-2 text-sm text-green-700'>
                <span>Discount</span>
                <span>- ${discount.toFixed(2)}</span>
              </div>
            )}
            <div className='flex justify-between mb-6 text-base font-bold'>
              <span>Total</span>
              <span>${discountedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CheckoutPage 