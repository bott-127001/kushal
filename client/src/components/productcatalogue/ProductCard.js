import React from 'react'
import API_ENDPOINTS from '../../config/api'

function ProductCard ({ product, navigate }) {
  function handleClick () {
    const id = product.id || product._id
    if (navigate) navigate(`/products/${id}`)
  }

  function handleImageError (e) {
    e.target.src = '/logo-removebg-preview.png' // Fallback to logo
  }

  // Use first image from images array if available, else fallback to image
  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : product.image

  return (
    <div
      className='relative w-full h-36 md:h-64 bg-white rounded border-2 border-[#003D37] shadow p-2 md:p-4 flex flex-col items-center justify-start cursor-pointer hover:shadow-md transition-all duration-300 group min-w-0'
      onClick={handleClick}
      tabIndex={0}
      role='button'
      aria-label={`View details for ${product.title}`}
    >
      {/* Discount Badge */}
      {product.originalPrice && product.originalPrice > product.price && (
        <div className='absolute top-1 right-1 z-10'>
          <div className='bg-red-600 text-white font-extrabold text-[10px] md:text-xs rounded-full px-1.5 py-0.5 shadow flex flex-col items-center justify-center border border-red-400' style={{ minWidth: 24, minHeight: 24 }}>
            <span className='text-xs md:text-sm leading-none' style={{textShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
              {Math.round(100 - (product.price / product.originalPrice) * 100)}%
            </span>
            <span className='text-[8px] md:text-xs font-bold' style={{letterSpacing: 1}}>OFF</span>
          </div>
        </div>
      )}
      <img 
        src={mainImage || '/logo-removebg-preview.png'} 
        alt={product.title} 
        className='w-12 h-12 md:w-24 md:h-24 object-cover rounded mb-1 md:mb-2 shadow-sm group-hover:scale-105 transition-transform duration-300'
        onError={handleImageError}
      />
      <div className='font-bold text-xs md:text-base text-center text-[#003D37] mb-0.5 md:mb-1 line-clamp-2'>{product.title}</div>
      <div className='text-gray-600 text-[10px] md:text-sm text-center mb-1 md:mb-2 line-clamp-2 flex-1'>{product.description}</div>
      <div className='flex items-center gap-1 justify-center mt-auto'>
        {product.originalPrice && (
          <span className='text-gray-400 line-through text-xs md:text-sm'>${parseFloat(product.originalPrice).toFixed(2)}</span>
        )}
        <span className='text-sm md:text-lg font-bold text-[#003D37]'>${parseFloat(product.price).toFixed(2)}</span>
      </div>
    </div>
  )
}

export default ProductCard 
