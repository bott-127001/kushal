import React from 'react'
import ProductCard from './ProductCard'
import { useNavigate } from 'react-router-dom'

function ProductGrid ({ products, addToCart, cartItems = [] }) {
  const navigate = useNavigate()
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6'>
      {products.map(product => (
        <ProductCard
          key={product.id || product._id}
          product={product}
          addToCart={addToCart}
          isInCart={!!cartItems.find(item => item.id === (product.id || product._id))}
          navigate={navigate}
        />
      ))}
    </div>
  )
}

export default ProductGrid 