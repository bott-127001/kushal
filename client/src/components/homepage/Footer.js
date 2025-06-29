import React from 'react'
import { Link } from 'react-router-dom'

function Footer () {
  return (
    <footer className='w-full bg-black text-gray-300 pt-12 pb-6'>
      <div className='max-w-6xl mx-auto px-1 grid grid-cols-4 gap-2 mb-8'>
        <div className='min-w-0 overflow-hidden break-words text-xs sm:text-sm'>
          <h3 className='text-white font-bold mb-2'>About Us</h3>
          <p>Discover the perfect harmony between celestial energy and precious gemstones.</p>
        </div>
        <div className='min-w-0 overflow-hidden break-words text-xs sm:text-sm'>
          <h3 className='text-white font-bold mb-2'>Contact</h3>
          <ul className='space-y-1'>
            <li>Bavdhan, Pune</li>
            <li>Maharashtra, MH 413001</li>
            <li className='break-words'>contact@celestialgems.com</li>
            <li>+91 9561262309</li>
          </ul>
        </div>
        <div className='min-w-0 overflow-hidden break-words text-xs sm:text-sm'>
          <h3 className='text-white font-bold mb-2'>Customer Service</h3>
          <ul className='space-y-1'>
            <li><Link to='/shipping-info' className='hover:text-[#D4AF37] transition'>Shipping Information</Link></li>
            <li><Link to='/returns-exchanges' className='hover:text-[#D4AF37] transition'>Returns & Exchanges</Link></li>
          </ul>
        </div>
        <div className='min-w-0 overflow-hidden break-words text-xs sm:text-sm'>
          <h3 className='text-white font-bold mb-2'>Quick Links</h3>
          <ul className='space-y-1'>
            <li><Link to='/' className='hover:text-[#D4AF37] transition'>Home</Link></li>
            <li><Link to='/products' className='hover:text-[#D4AF37] transition'>Shop</Link></li>
            <li><Link to='/consultation' className='hover:text-[#D4AF37] transition'>Consultations</Link></li>
            <li><Link to='/blogs' className='hover:text-[#D4AF37] transition'>Blogs</Link></li>
          </ul>
        </div>
      </div>
      <div className='border-t border-gray-700 max-w-6xl mx-auto px-4 pt-2 mt-2 flex flex-col md:flex-row items-center justify-between'>
        <div className='text-xs text-center'>&copy; 2024 Celestial Gems. All rights reserved.</div>
        <div className='flex space-x-2 mt-2 md:mt-0 justify-center'>
          {/* Instagram */}
          <a href='#' aria-label='Instagram'>
            <svg width='20' height='20' className='w-5 h-5 text-gray-400 hover:text-white' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='5' /><circle cx='12' cy='12' r='5' /><circle cx='17' cy='7' r='1' /></svg>
          </a>
          {/* Facebook */}
          <a href='#' aria-label='Facebook'>
            <svg width='20' height='20' className='w-5 h-5 text-gray-400 hover:text-white' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='5' /><path d='M16 8h-2a2 2 0 0 0-2 2v2h4' /><path d='M12 16v-4' /></svg>
          </a>
          {/* Pinterest */}
          <a href='#' aria-label='Pinterest'>
            <svg width='20' height='20' className='w-5 h-5 text-gray-400 hover:text-white' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' /><path d='M12 16v-4' /><circle cx='12' cy='8' r='1' /></svg>
          </a>
          {/* Twitter */}
          <a href='#' aria-label='Twitter'>
            <svg width='20' height='20' className='w-5 h-5 text-gray-400 hover:text-white' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><path d='M22 4.01c-.77.35-1.6.59-2.47.7A4.13 4.13 0 0 0 21.4 2.3a8.2 8.2 0 0 1-2.6 1A4.1 4.1 0 0 0 12 6.1c0 .32.04.64.1.94A11.65 11.65 0 0 1 3 3.1a4.1 4.1 0 0 0 1.27 5.47A4.07 4.07 0 0 1 2.8 7.1v.05a4.1 4.1 0 0 0 3.3 4.02c-.4.1-.8.13-1.23.05a4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 19.54a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22 4.01Z' /></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer 