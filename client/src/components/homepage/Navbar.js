import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../store/auth'
import useCart from '../../store/cart'

function Navbar () {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const { items: cartItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  // Map links to their paths
  const navLinks = [
    { label: 'SHOP', path: '/products' },
    { label: 'HOME', path: '/' },
    { label: 'CONSULTATION', path: '/consultation' },
    { label: 'BLOGS', path: '/blogs' }
  ]

  // Remove the link for the current page
  const filteredLinks = navLinks.filter(link => {
    if (link.path === '/' && location.pathname === '/') return false
    if (link.path !== '/' && location.pathname.startsWith(link.path)) return false
    return true
  })

  const handleMenuToggle = () => setMenuOpen(v => !v)
  const handleNavigate = path => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <nav className='sticky top-0 w-full h-16 flex items-center justify-between px-4 bg-white shadow z-50'>
      {/* Logo and Company Name */}
      <div className='flex items-center gap-2 min-w-0 cursor-pointer' onClick={() => navigate('/')}> 
        <img src='/logo-removebg-preview.png' alt='Logo' className='h-8 w-auto object-contain flex-shrink-0' />
        <span className='text-black font-serif text-sm sm:text-base font-semibold tracking-wide'>KAIVALYA ASTROLOGY</span>
      </div>
      {/* Hamburger Menu Button */}
      <button
        className='flex items-center justify-center p-2 rounded-md text-black hover:bg-gray-100 transition ml-auto'
        aria-label='Open menu'
        onClick={handleMenuToggle}
      >
        <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          {menuOpen
            ? <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            : <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          }
        </svg>
      </button>
      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-40 z-40' onClick={() => setMenuOpen(false)} />
      )}
      {/* Hamburger Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col h-full p-6 gap-6'>
          <button
            className='self-end mb-2 p-2 rounded hover:bg-gray-100'
            aria-label='Close menu'
            onClick={() => setMenuOpen(false)}
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
          <div className='flex flex-col gap-2'>
            {filteredLinks.map(link => (
              <button
                key={link.label}
                className='w-full text-left text-black font-serif text-base font-semibold tracking-wider hover:text-[#003D37] transition py-2 border-b border-gray-100'
                onClick={() => handleNavigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className='flex flex-col gap-2 mt-4'>
            {isAuthenticated && (
              <button className='relative flex items-center justify-start gap-2 py-2' onClick={() => { handleNavigate('/cart') }} aria-label='Cart'>
                <svg width='22' height='22' fill='none' stroke='black' strokeWidth='2' viewBox='0 0 24 24'>
                  <circle cx='9' cy='21' r='1' />
                  <circle cx='20' cy='21' r='1' />
                  <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6' />
                </svg>
                Cart
                {cartItems.length > 0 && (
                  <span className='ml-2 bg-black text-white text-xs rounded-full px-2 py-0.5 font-bold'>{cartItems.length}</span>
                )}
              </button>
            )}
            {isAuthenticated ? (
              <>
                <button className='w-full px-4 py-2 bg-black text-white font-serif rounded hover:bg-[#003D37] transition text-base' onClick={logout}>Logout</button>
                <button className='w-full px-4 py-2 bg-black text-white font-serif rounded hover:bg-[#003D37] transition text-base' onClick={() => handleNavigate('/profile')}>Profile</button>
              </>
            ) : (
              <>
                <button
                  className='w-full px-4 py-2 bg-transparent border border-black text-black font-serif rounded hover:bg-[#003D37] hover:text-white transition text-base'
                  onClick={() => handleNavigate('/login')}
                >
                  Sign In
                </button>
                <button
                  className='w-full px-4 py-2 bg-black text-white font-serif rounded hover:bg-[#003D37] transition text-base'
                  onClick={() => handleNavigate('/signup')}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 
