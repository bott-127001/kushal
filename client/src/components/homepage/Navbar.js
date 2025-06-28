import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../store/auth'
import useCart from '../../store/cart'

function Navbar () {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const { items: cartItems } = useCart()

  // Map links to their paths
  const navLinks = [
    { label: 'SHOP', path: '/products' },
    { label: 'HOME', path: '/' },
    { label: 'CONSULTATION', path: '/consultation' },
    { label: 'BLOGS', path: '/blogs' }
  ]

  // Remove the link for the current page
  const filteredLinks = navLinks.filter(link => {
    // For root path, match exact
    if (link.path === '/' && location.pathname === '/') return false
    // For other paths, match if pathname starts with the link path
    if (link.path !== '/' && location.pathname.startsWith(link.path)) return false
    return true
  })

  return (
    <nav className='w-full h-14 flex items-center justify-between px-8 bg-transparent'>
      {/* Logo */}
      <div className='flex items-center space-x-2'>
        {/* Logo Image */}
        <img src='/logo-removebg-preview.png' alt='Logo' className='h-10 w-auto object-contain' />
        <span className='text-black font-serif text-lg font-bold tracking-widest'>KAIVALYA ASTROLOGY</span>
      </div>
      {/* Nav Links */}
      <div className='flex-1 flex justify-center'>
        <ul className='flex space-x-8'>
          {filteredLinks.map(link => (
            <li key={link.label}>
              <button
                className='text-black font-serif text-sm font-semibold tracking-wider hover:text-[#003D37] transition'
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Icons and Auth */}
      <div className='flex items-center space-x-8'>
        {/* Cart Icon (only for authenticated users) */}
        {isAuthenticated && (
          <button className='relative' onClick={() => navigate('/cart')} aria-label='Cart'>
            <svg width='24' height='24' fill='none' stroke='black' strokeWidth='2' viewBox='0 0 24 24'>
              <circle cx='9' cy='21' r='1' />
              <circle cx='20' cy='21' r='1' />
              <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6' />
            </svg>
            {cartItems.length > 0 && (
              <span className='absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-2 py-0.5 font-bold'>{cartItems.length}</span>
            )}
          </button>
        )}
        {/* Auth/Profile */}
        {isAuthenticated ? (
          <>
            <button className='ml-4 px-4 py-2 bg-black text-white font-serif rounded hover:bg-[#003D37] transition' onClick={logout}>Logout</button>
            <button className='ml-2 px-4 py-2 bg-black text-white font-serif rounded hover:bg-[#003D37] transition' onClick={() => navigate('/profile')}>Profile</button>
          </>
        ) : (
          <>
            <button
              className='ml-4 px-4 py-2 bg-transparent border border-black text-black font-serif rounded hover:bg-[#003D37] hover:text-white transition'
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              className='ml-2 px-4 py-2 bg-black text-white font-serif rounded hover:bg-[#003D37] transition'
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar 