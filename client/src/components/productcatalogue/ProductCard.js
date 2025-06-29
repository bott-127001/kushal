import React from 'react'

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://kushal-15gt.onrender.com'

function ProductCard ({ product, navigate }) {
  function handleClick () {
    const id = product.id || product._id
    if (navigate) navigate(`/products/${id}`)
  }

  function handleImageError (e) {
    e.target.src = '/logo-removebg-preview.png' // Fallback to logo
  }

  return (
    <div
      className='relative w-full h-80 bg-white rounded-2xl border-2 border-[#003D37] shadow-lg p-6 flex flex-col items-center justify-start cursor-pointer hover:shadow-2xl transition-all duration-300 group'
      onClick={handleClick}
      tabIndex={0}
      role='button'
      aria-label={`View details for ${product.title}`}
    >
      {/* Discount Badge */}
      {product.originalPrice && product.originalPrice > product.price && (
        <div className='absolute top-3 right-3 z-10'>
          <div className='bg-red-600 text-white font-extrabold text-xs md:text-sm rounded-full px-3 py-2 shadow-lg flex flex-col items-center justify-center border-4 border-red-400' style={{ minWidth: 56, minHeight: 56 }}>
            <span className='text-lg md:text-xl leading-none' style={{textShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
              {Math.round(100 - (product.price / product.originalPrice) * 100)}%
            </span>
            <span className='text-xs font-bold' style={{letterSpacing: 1}}>OFF</span>
          </div>
        </div>
      )}
      <img 
        src={product.image?.startsWith('/uploads/') ? backendUrl + product.image : product.image || '/logo-removebg-preview.png'} 
        alt={product.title} 
        className='w-28 h-28 object-cover rounded-xl mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300'
        onError={handleImageError}
      />
      <div className='font-bold text-xl text-center text-[#003D37] mb-1'>{product.title}</div>
      <div className='text-gray-600 text-base text-center mb-4'>{product.description}</div>
      <div className='flex items-center gap-2 justify-center mt-auto'>
        {product.originalPrice && (
          <span className='text-gray-400 line-through text-base'>${parseFloat(product.originalPrice).toFixed(2)}</span>
        )}
        <span className={`text-2xl font-bold ${product.originalPrice ? 'text-[#003D37]' : 'text-[#003D37]'}`}>${parseFloat(product.price).toFixed(2)}</span>
      </div>
    </div>
  )
}

export default ProductCard 
