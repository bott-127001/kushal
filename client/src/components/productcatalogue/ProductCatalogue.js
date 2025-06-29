import React, { useState, useMemo, useEffect } from 'react'
import Footer from '../homepage/Footer'
import CatalogueHero from './CatalogueHero'
import Filters from './Filters'
import ProductGrid from './ProductGrid'
import useCart from '../../store/cart'
import AuthPromptModal from '../homepage/AuthPromptModal'
import useAuth from '../../store/auth'
import API_ENDPOINTS from '../../config/api'

const PAGE_SIZE = 8
const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular', icon: (
    <svg className='inline w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><polygon points='12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2' strokeLinejoin='round'/></svg>
  ) },
  { value: 'newest', label: 'Newest', icon: (
    <svg className='inline w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor'/><path d='M12 6v6l4 2' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'/></svg>
  ) },
  { value: 'price', label: 'Price: Low to High', icon: (
    <svg className='inline w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M12 4v16m0 0l-4-4m4 4l4-4' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'/></svg>
  ) },
  { value: 'price-desc', label: 'Price: High to Low', icon: (
    <svg className='inline w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M12 20V4m0 0l-4 4m4-4l4 4' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'/></svg>
  ) },
  { value: 'title', label: 'Title (A-Z)', icon: (
    <svg className='inline w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><text x='2' y='18' fontSize='16' fontFamily='Arial' fill='currentColor'>A</text><text x='14' y='18' fontSize='16' fontFamily='Arial' fill='currentColor'>Z</text></svg>
  ) },
  { value: 'title-desc', label: 'Title (Z-A)', icon: (
    <svg className='inline w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><text x='2' y='18' fontSize='16' fontFamily='Arial' fill='currentColor'>Z</text><text x='14' y='18' fontSize='16' fontFamily='Arial' fill='currentColor'>A</text></svg>
  ) }
]

function ProductCatalogue () {
  const [filters, setFilters] = useState({ categories: [], price: [], materials: [], style: [] })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('popular')
  const { addToCart, items: cartItems, lastAddedId, clearLastAdded } = useCart()
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false)
  const [pageTransition, setPageTransition] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isAuthenticated } = useAuth()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    let sortBy = 'popularity'
    let order = 'desc'
    if (sort === 'newest') {
      sortBy = 'createdAt'
      order = 'desc'
    } else if (sort === 'price') {
      sortBy = 'price'
      order = 'asc'
    } else if (sort === 'price-desc') {
      sortBy = 'price'
      order = 'desc'
    } else if (sort === 'title') {
      sortBy = 'title'
      order = 'asc'
    } else if (sort === 'title-desc') {
      sortBy = 'title'
      order = 'desc'
    }
    fetch(`${API_ENDPOINTS.PRODUCTS}?page=${page}&limit=${PAGE_SIZE}&sortBy=${sortBy}&order=${order}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        setProducts(data.products)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [page, sort])

  useEffect(() => {
    setPageTransition(true)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (filters.categories.length && !filters.categories.includes(product.category)) return false
      // Material filter
      if (filters.materials.length && !filters.materials.includes(product.material)) return false
      // Style filter
      if (filters.style.length && !filters.style.includes(product.style)) return false
      // Price filter
      if (filters.price.length) {
        const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''))
        let match = false
        for (const range of filters.price) {
          if (range === 'Under $500' && priceNum < 500) match = true
          if (range === '$500 - $1000' && priceNum >= 500 && priceNum <= 1000) match = true
          if (range === '$1000 - $5000' && priceNum > 1000 && priceNum <= 5000) match = true
          if (range === 'Above $5000' && priceNum > 5000) match = true
        }
        if (!match) return false
      }
      return true
    })
  }, [filters, products])

  function handleSortSelect (value) {
    setSort(value)
    setPage(1)
    setSortDropdownOpen(false)
  }

  function handlePageChange (newPage) {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
  }

  // Handle dropdown open/close with animation
  useEffect(() => {
    if (sortDropdownOpen) {
      setSortDropdownVisible(true)
    } else if (sortDropdownVisible) {
      // Wait for animation before unmounting
      const timeout = setTimeout(() => setSortDropdownVisible(false), 350)
      return () => clearTimeout(timeout)
    }
  }, [sortDropdownOpen])

  function handleProtectedAddToCart (product, addToCart) {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return false
    }
    addToCart(product)
    return true
  }

  function handleAuthConfirm () {
    setShowAuthModal(false)
    window.location.href = '/login'
  }

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${pageTransition ? 'animate-pageFadeIn' : ''}`}>
      <AuthPromptModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={handleAuthConfirm}
        message='You must be logged in to add items to your cart.'
      />
      <main className='flex-grow'>
        <CatalogueHero />
        <div className='py-4 md:py-6' />
        <div className='max-w-7xl mx-auto px-1 md:px-4'>
          {/* Layout: column on mobile, row on desktop */}
          <div className='flex flex-col md:flex-row gap-4 md:gap-8'>
            {/* Filters sidebar (desktop) */}
            <div className='md:w-64 flex-shrink-0'>
              <Filters selectedFilters={filters} onChange={setFilters} />
            </div>
            {/* Main content: sort + grid */}
            <div className='flex-1 min-w-0'>
              {/* Sort and product count */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 md:mb-6 gap-2 md:gap-6'>
                <div className='text-xs md:text-sm text-gray-600 mb-2 sm:mb-0'>
                  {filteredProducts.length} products
                </div>
                <div className='flex-shrink-0 flex items-center relative'>
                  <button
                    type='button'
                    className='inline-flex items-center border border-gray-300 rounded px-2 py-1 h-10 text-xs md:text-sm bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#003D37] transition-all duration-150'
                    onClick={() => setSortDropdownOpen(v => !v)}
                    aria-haspopup='listbox'
                    aria-expanded={sortDropdownOpen}
                  >
                    <span className='flex items-center'>
                      {SORT_OPTIONS.find(opt => opt.value === sort)?.icon}
                      <span className='ml-1'>{SORT_OPTIONS.find(opt => opt.value === sort)?.label}</span>
                    </span>
                    <svg className='w-3 h-3 ml-1 text-gray-400' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M19 9l-7 7-7-7' /></svg>
                  </button>
                  {sortDropdownVisible && (
                    <ul
                      className={`absolute right-0 z-10 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 text-xs origin-top-right transition-all duration-350 ${sortDropdownOpen ? 'animate-fadeScaleIn' : 'animate-fadeScaleOut'}`}
                      role='listbox'
                    >
                      {SORT_OPTIONS.map(opt => (
                        <li
                          key={opt.value}
                          className={`flex items-center px-3 py-2 cursor-pointer transition-all duration-100 rounded ${sort === opt.value ? 'bg-gray-100 font-semibold text-[#003D37]' : 'hover:bg-gray-50 hover:text-[#003D37]'}`}
                          onClick={() => handleSortSelect(opt.value)}
                          role='option'
                          aria-selected={sort === opt.value}
                        >
                          <span className={`mr-2 ${sort === opt.value ? 'text-[#003D37]' : 'text-gray-400 group-hover:text-[#003D37]'}`}>{opt.icon}</span>
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Product grid */}
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
              {loading && <div className='text-gray-500'>Loading products...</div>}
              {error && <div className='text-red-500'>{error}</div>}
              {!loading && !error && <ProductGrid products={filteredProducts} addToCart={product => handleProtectedAddToCart(product, addToCart)} cartItems={cartItems} />}
              {/* Pagination Controls */}
              {!loading && !error && totalPages > 1 && (
                <div className='flex justify-center items-center mt-6 md:mt-8 space-x-2'>
                  <button
                    className='px-3 py-2 md:py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm'
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <div className='flex space-x-1'>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`px-3 py-2 md:py-1 rounded text-sm ${page === i + 1 ? 'bg-[#003D37] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className='px-3 py-2 md:py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm'
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes pageFadeIn {
          0% { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-pageFadeIn {
          animation: pageFadeIn 0.6s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fadeScaleIn {
          0% { opacity: 0; transform: scale(0.95) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeScaleOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.95) translateY(-8px); }
        }
        .animate-fadeScaleIn {
          animation: fadeScaleIn 0.35s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fadeScaleOut {
          animation: fadeScaleOut 0.35s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  )
}

export default ProductCatalogue 
