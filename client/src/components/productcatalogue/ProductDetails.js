import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Footer from '../homepage/Footer'
import useCart from '../../store/cart'
import useAuth from '../../store/auth'
import API_ENDPOINTS from '../../config/api'

function SkeletonBox ({ className }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
}

function ProductDetails () {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, items: cartItems, lastAddedId, clearLastAdded } = useCart()
  const { isAuthenticated, user, token } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('specs')
  const [recommendations, setRecommendations] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)
  const [reviewForm, setReviewForm] = useState({ user: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found')
        return res.json()
      })
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    fetch(`/api/products/recommendations?exclude=${id}`)
      .then(res => res.json())
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
  }, [id])

  useEffect(() => {
    setReviewsLoading(true)
    setReviewsError(null)
    fetch(`/api/products/${id}/reviews`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch reviews')
        return res.json()
      })
      .then(data => {
        setReviews(data)
        setReviewsLoading(false)
      })
      .catch(err => {
        setReviewsError(err.message)
        setReviewsLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-grow max-w-5xl mx-auto w-full px-4 py-12 flex flex-col md:flex-row gap-12'>
        <div className='flex-1 flex items-center justify-center'>
          <SkeletonBox className='w-full max-w-xs h-80' />
        </div>
        <div className='flex-1 flex flex-col justify-center gap-4'>
          <SkeletonBox className='h-8 w-2/3 mb-2' />
          <SkeletonBox className='h-6 w-1/4 mb-2' />
          <SkeletonBox className='h-5 w-1/2 mb-2' />
          <SkeletonBox className='h-4 w-full mb-2' />
          <SkeletonBox className='h-24 w-full mb-2' />
          <div className='flex gap-4'>
            <SkeletonBox className='h-10 w-32' />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
  if (error) return <div className='min-h-screen flex items-center justify-center text-red-500'>{error}</div>
  if (!product) return null

  console.log('Product in details page:', product)

  const isInCart = !!cartItems.find(item => item.id === (product.id || product._id))

  // Use images array if available, else fallback to [image]
  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const mainImage = images[selectedImageIdx] || '/logo-removebg-preview.png'

  return (
    <div className='bg-[#faf9fb] min-h-screen flex flex-col'>
      {/* Toast Popup */}
      {showToast && (
        <div className='fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#23233a] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeInToast'>
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
      <main className='flex-grow max-w-5xl mx-auto w-full px-4 py-12 flex flex-col md:flex-row gap-12'>
        {/* Left: Product Image + Carousel */}
        <div className='flex-1 flex flex-col items-center justify-center'>
          <img 
            src={mainImage?.startsWith('/uploads/') ? API_ENDPOINTS.PRODUCTS.replace('/api/products', '') + mainImage : mainImage} 
            alt={product.title} 
            className='w-full max-w-xs rounded-xl shadow-lg object-cover mb-4'
            onError={(e) => { e.target.src = '/logo-removebg-preview.png' }}
          />
          {/* Carousel Thumbnails */}
          <div className='flex flex-row gap-2 mt-2'>
            {images.map((img, idx) => (
              <img
                key={img + idx}
                src={img?.startsWith('/uploads/') ? API_ENDPOINTS.PRODUCTS.replace('/api/products', '') + img : img || '/logo-removebg-preview.png'}
                alt={`thumb-${idx}`}
                className={`w-16 h-16 object-cover rounded border-2 cursor-pointer ${selectedImageIdx === idx ? 'border-[#003D37]' : 'border-gray-200'}`}
                onClick={() => setSelectedImageIdx(idx)}
                onError={e => { e.target.src = '/logo-removebg-preview.png' }}
              />
            ))}
          </div>
        </div>
        {/* Right: Product Info */}
        <div className='flex-1 flex flex-col justify-center'>
          <h1 className='text-2xl md:text-3xl font-serif font-bold mb-2'>{product.title}</h1>
          <div className='flex items-center gap-3 mb-2'>
            {product.originalPrice && (
              <span className='text-gray-400 line-through text-xl md:text-2xl'>${parseFloat(product.originalPrice).toFixed(2)}</span>
            )}
            <span className={`text-2xl md:text-3xl font-bold ${product.originalPrice ? 'text-[#003D37]' : 'text-[#003D37]'}`}>${parseFloat(product.price).toFixed(2)}</span>
          </div>
          <div className='flex items-center mb-2'>
            {/* Stars */}
            {[...Array(5)].map((_, i) => (
              <svg key={i} width='20' height='20' fill={i < 4 ? '#003D37' : 'none'} stroke='#003D37' strokeWidth='1.5' viewBox='0 0 24 24'>
                <polygon points='12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9' />
              </svg>
            ))}
            <span className='ml-2 text-sm text-gray-600'>({reviews.length} Reviews)</span>
          </div>
          <div className='font-semibold mb-1'>Description:</div>
          <div className='text-gray-700 mb-6'>{product.shortDescription || product.description}</div>
          <div className='flex gap-4'>
            <button
              className={`px-8 py-3 font-serif rounded transition ${isInCart ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#003D37] text-white hover:brightness-110'}`}
              onClick={async () => {
                if (!isInCart) {
                  await addToCart(product)
                  setToastMsg(`${product.title} added to cart!`)
                  setShowToast(true)
                  setTimeout(() => setShowToast(false), 2000)
                }
              }}
              disabled={isInCart}
            >
              {isInCart ? (
                <span className='flex items-center gap-2'>
                  <svg width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M5 13l4 4L19 7'/></svg>
                  Added
                </span>
              ) : 'Add to Cart'}
            </button>
            <button
              className='px-8 py-3 font-serif rounded transition bg-gray-600 text-white hover:bg-gray-700'
              onClick={async () => {
                if (!isInCart) {
                  await addToCart(product)
                }
                navigate('/checkout')
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </main>
      {/* Tabs and Details */}
      <section className='max-w-5xl mx-auto w-full px-4'>
        <div className='border-b border-gray-200 flex gap-8 mb-6'>
          <button
            className={`py-3 px-4 font-semibold border-b-2 transition ${tab === 'specs' ? 'border-[#003D37] text-[#18182a]' : 'border-transparent text-gray-500'}`}
            onClick={() => setTab('specs')}
          >
            Specifications
          </button>
          <button
            className={`py-3 px-4 font-semibold border-b-2 transition ${tab === 'reviews' ? 'border-[#003D37] text-[#18182a]' : 'border-transparent text-gray-500'}`}
            onClick={() => setTab('reviews')}
          >
            Reviews
          </button>
        </div>
        {tab === 'specs' && (
          <div className='mb-10 text-gray-700' style={{ whiteSpace: 'pre-line' }}>{product.specs}</div>
        )}
        {tab === 'reviews' && (
          <div className='mb-10'>
            {/* Review Form */}
            {!isAuthenticated ? (
              <div className='mb-8 p-4 bg-white rounded shadow text-center'>
                <span className='text-gray-700'>You must be <button className='text-[#003D37] underline' onClick={() => window.location.href = '/login'}>logged in</button> to submit a review.</span>
              </div>
            ) : (
              <form
                className='mb-8 p-4 bg-white rounded shadow flex flex-col gap-3'
                onSubmit={async e => {
                  e.preventDefault()
                  setSubmitting(true)
                  setSubmitError(null)
                  try {
                    const res = await fetch(`/api/products/${id}/reviews`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        user: user?.email,
                        rating: reviewForm.rating,
                        comment: reviewForm.comment
                      })
                    })
                    if (!res.ok) throw new Error('Failed to submit review')
                    const data = await res.json()
                    setReviews(data)
                    setReviewForm({ user: '', rating: 5, comment: '' })
                  } catch (err) {
                    setSubmitError(err.message)
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                <div className='flex flex-col md:flex-row gap-4'>
                  <input
                    className='border border-gray-300 rounded px-3 py-2 flex-1 bg-gray-100 cursor-not-allowed'
                    placeholder='Your Name'
                    value={user?.email || ''}
                    disabled
                  />
                  <select
                    className='border border-gray-300 rounded px-3 py-2 w-32'
                    value={reviewForm.rating}
                    onChange={e => setReviewForm(f => ({ ...f, rating: Number(e.target.value) }))}
                    required
                  >
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <textarea
                  className='border border-gray-300 rounded px-3 py-2 min-h-[60px]'
                  placeholder='Your Review'
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  required
                />
                <button
                  type='submit'
                  className='self-end px-6 py-2 bg-[#003D37] text-white rounded font-semibold hover:brightness-110 transition disabled:opacity-60'
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                {submitError && <div className='text-red-500 mt-2'>{submitError}</div>}
              </form>
            )}
            {/* Reviews List */}
            {reviewsLoading && (
              <>
                <SkeletonBox className='h-20 w-full mb-4' />
                <SkeletonBox className='h-20 w-full mb-4' />
              </>
            )}
            {reviewsError && <div className='text-red-500'>{reviewsError}</div>}
            {!reviewsLoading && !reviewsError && reviews.map((r, i) => (
              <div key={i} className='mb-4 p-4 bg-white rounded shadow'>
                <div className='font-semibold'>{r.user}</div>
                <div className='flex items-center mb-1'>
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width='16' height='16' fill={j < r.rating ? '#003D37' : 'none'} stroke='#003D37' strokeWidth='1.2' viewBox='0 0 24 24'>
                      <polygon points='12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9' />
                    </svg>
                  ))}
                </div>
                <div className='text-gray-600 text-sm'>{r.comment}</div>
              </div>
            ))}
          </div>
        )}
        {/* You May Also Like */}
        <div className='mt-16'>
          <h2 className='font-serif font-bold text-lg mb-6'>You May Also Like</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {recommendations.map((item) => (
              <div key={item._id} className='bg-white rounded-xl shadow p-6 flex flex-col justify-end min-h-[160px] cursor-pointer' onClick={() => navigate(`/products/${item._id}`)}>
                <img src={item.image?.startsWith('/uploads/') ? API_ENDPOINTS.PRODUCTS.replace('/api/products', '') + item.image : item.image || '/logo-removebg-preview.png'} alt={item.title} className='w-full h-32 object-cover rounded mb-3' onError={e => { e.target.src = '/logo-removebg-preview.png' }} />
                <div className='font-serif font-semibold text-base mb-2'>{item.title}</div>
                <div className='text-[#2d223c] font-serif font-bold text-base'>{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {lastAddedId && (
        <div className='fixed top-6 right-6 z-50 bg-[#003D37] text-white px-6 py-3 rounded shadow font-semibold animate-fadeInToast'
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
      <Footer />
    </div>
  )
}

export default ProductDetails 
