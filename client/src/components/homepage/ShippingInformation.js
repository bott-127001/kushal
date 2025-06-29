import React from 'react'
import Footer from './Footer'
import styles from './ShippingInformation.module.styl'

function ShippingInformation () {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <main className='flex-1 px-4 md:px-12 max-w-5xl mx-auto w-full py-8'>
        <h1 className='text-2xl md:text-3xl font-semibold text-emerald-700 text-center mx-auto mb-6'>
          Shipping Information
        </h1>
        {/* Shipping Methods */}
        <section className='mb-8'>
          <h2 className='text-lg font-semibold mb-4 text-gray-800 text-center'>Shipping Methods</h2>
          <div className='flex justify-center'>
            <div className='flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50 shadow-sm items-start transition-all duration-200 hover:shadow-md w-full max-w-md'>
              <span className='i-mdi:truck-fast-outline text-emerald-600 text-2xl mt-1' />
              <div>
                <div className='font-semibold'>Standard Shipping</div>
                <div className='text-xs text-gray-500'>7-10 business days</div>
                <div className='text-xs text-gray-500'>From $8.00</div>
                <div className='text-xs text-gray-400'>Economy shipping, always with tracking</div>
              </div>
            </div>
          </div>
        </section>
        {/* Gemstone Care During Transit */}
        <section className='mb-8'>
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>Gemstone Care During Transit</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50 shadow-sm items-center'>
              <span className='i-mdi:package-variant-closed text-emerald-600 text-2xl' />
              <div>
                <div className='font-semibold'>Protective Packaging</div>
                <div className='text-xs text-gray-500'>Each gemstone is carefully packaged in custom-made containers.</div>
              </div>
            </div>
            <div className='flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50 shadow-sm items-center'>
              <span className='i-mdi:shield-check-outline text-emerald-600 text-2xl' />
              <div>
                <div className='font-semibold'>Insurance Coverage</div>
                <div className='text-xs text-gray-500'>Full value insurance included on all shipments.</div>
              </div>
            </div>
            <div className='flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50 shadow-sm items-center'>
              <span className='i-mdi:map-marker-path text-emerald-600 text-2xl' />
              <div>
                <div className='font-semibold'>Tracking Services</div>
                <div className='text-xs text-gray-500'>Real-time tracking available for all orders.</div>
              </div>
            </div>
            <div className='flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50 shadow-sm items-center'>
              <span className='i-mdi:check-decagram-outline text-emerald-600 text-2xl' />
              <div>
                <div className='font-semibold'>Signature Confirmation</div>
                <div className='text-xs text-gray-500'>Adult signature required for delivery.</div>
              </div>
            </div>
          </div>
        </section>
        {/* International Shipping */}
        <section className='mb-8'>
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>International Shipping</h2>
          <div className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center'>
            <img src='https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=1&size=320x160&key=YOUR_API_KEY' alt='World map' className='rounded-lg border w-full md:w-1/2 object-cover' />
            <div className='flex-1'>
              <div className='font-semibold mb-2'>Shipping to Your Country</div>
              <ul className='list-disc list-inside text-sm text-gray-600 mb-2'>
                <li>Customs duties and taxes may apply</li>
                <li>International tracking available</li>
                <li>Delivery times vary by location</li>
              </ul>
              <div className='text-xs text-gray-400'>We ship to over 180 countries worldwide</div>
            </div>
          </div>
        </section>
        {/* Shipping FAQs */}
        <section className='mb-8'>
          <h2 className='text-lg font-semibold mb-4 text-gray-800'>Shipping FAQs</h2>
          <div className='flex flex-col gap-4'>
            <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
              <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                How long does shipping take?
                <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                </svg>
              </summary>
              <div className='mt-2 text-gray-600 text-sm'>Standard shipping takes 7-10 business days, while express shipping takes 3-5 business days.</div>
            </details>
            <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
              <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                Is my package insured?
                <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                </svg>
              </summary>
              <div className='mt-2 text-gray-600 text-sm'>Yes, all packages are fully insured for their full value during transit.</div>
            </details>
            <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
              <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                Do you ship internationally?
                <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                </svg>
              </summary>
              <div className='mt-2 text-gray-600 text-sm'>Yes, we ship to over 150 countries worldwide with international tracking.</div>
            </details>
            <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
              <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                What about returns?
                <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                </svg>
              </summary>
              <div className='mt-2 text-gray-600 text-sm'>We offer a 30-day return policy for all items, except for personalized consultations.</div>
            </details>
          </div>
        </section>
        {/* Need Help? */}
        <section className='mb-8'>
          <div className='bg-[#114438] text-white rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6'>
            <div>
              <div className='font-semibold text-lg mb-2'>Need Help?</div>
              <div className='font-bold mb-1'>Contact Us</div>
              <div className='flex items-center gap-2 mb-1'>
                <span className='i-mdi:phone text-xl' />
                <span>1-800-MYSTIC</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='i-mdi:email text-xl' />
                <span>support@mysticgems.com</span>
              </div>
            </div>
            <div>
              <div className='font-bold mb-1'>Business Hours</div>
              <div>Monday - Friday: 9AM - 6PM EST</div>
              <div>Saturday: 10AM - 4PM EST</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default ShippingInformation 