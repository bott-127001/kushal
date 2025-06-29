import React from 'react'
import Footer from './Footer'

function ReturnsExchanges () {
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <main className='flex-1 w-full'>
        <div className='max-w-6xl mx-auto px-4'>
          <h1 className='text-2xl md:text-3xl font-bold text-center text-emerald-900 mb-2'>Returns & Exchanges</h1>
          <div className='text-center text-gray-500 mb-8'>Making Your Experience Right</div>
          {/* Commitment Card */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3 mb-8'>
            <span className='i-mdi:check-circle text-emerald-600 text-2xl mt-1' />
            <div>
              <div className='font-semibold mb-1'>Our Commitment to You</div>
              <div className='text-gray-600 text-sm'>At CrystalGems, we are committed to ensuring your satisfaction with your purchase. Our returns and exchange policy is designed to be straightforward and customer-friendly, allowing you to make the best decision for your needs.</div>
            </div>
          </div>
          {/* Return Process */}
          <section className='mb-10'>
            <h2 className='text-lg md:text-xl font-semibold text-center text-emerald-900 mb-8'>Return Process</h2>
            <div className='flex flex-col md:flex-row justify-center items-stretch gap-6 mb-10'>
              <div className='flex-1 flex flex-col items-center text-center'>
                <span className='i-mdi:form-select text-emerald-900 text-4xl mb-3' />
                <div className='font-semibold mb-1'>Initiate Return</div>
                <div className='text-xs text-gray-500'>Submit your return request through our online form</div>
              </div>
              <div className='flex-1 flex flex-col items-center text-center'>
                <span className='i-mdi:package-variant-closed text-emerald-900 text-4xl mb-3' />
                <div className='font-semibold mb-1'>Ship Items</div>
                <div className='text-xs text-gray-500'>Pack and return items using our provided shipping label</div>
              </div>
              <div className='flex-1 flex flex-col items-center text-center'>
                <span className='i-mdi:clipboard-check-outline text-emerald-900 text-4xl mb-3' />
                <div className='font-semibold mb-1'>Receive & Process</div>
                <div className='text-xs text-gray-500'>We'll inspect and process your return within 3-5 business days</div>
              </div>
              <div className='flex-1 flex flex-col items-center text-center'>
                <span className='i-mdi:check-circle-outline text-emerald-900 text-4xl mb-3' />
                <div className='font-semibold mb-1'>Complete</div>
                <div className='text-xs text-gray-500'>Your refund or exchange will be processed within 5-7 business days</div>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
                <div className='font-semibold text-emerald-900 mb-2'>Eligible Items</div>
                <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                  <li>Unopened gemstone products</li>
                  <li>Items in original packaging</li>
                  <li>Within 30 days of purchase</li>
                  <li>Defective or damaged items</li>
                </ul>
              </div>
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
                <div className='font-semibold text-emerald-900 mb-2'>Non-Eligible Items</div>
                <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                  <li>Opened or used items</li>
                  <li>Custom-made products</li>
                  <li>Items damaged by wear</li>
                  <li>Gift cards and certificates</li>
                </ul>
              </div>
            </div>
          </section>
          {/* Submit Return Request Form */}
          <section className='mb-10'>
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
              <div className='font-semibold text-emerald-900 mb-4'>Submit Return Request</div>
              <form className='space-y-4'>
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='flex-1'>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>Order Number</label>
                    <input type='text' className='w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200' placeholder='Enter order number' />
                  </div>
                  <div className='flex-1'>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>Purchase Date</label>
                    <input type='date' className='w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200' />
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-700 mb-1'>Reason for Return</label>
                  <select className='w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200'>
                    <option value=''>Select a reason</option>
                    <option value='damaged'>Item was damaged</option>
                    <option value='wrong'>Wrong item received</option>
                    <option value='not-as-described'>Not as described</option>
                    <option value='other'>Other</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-700 mb-1'>Additional Comments</label>
                  <textarea className='w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200' rows={3} placeholder='Please provide any additional details...' />
                </div>
                <button type='submit' className='bg-[#114438] text-white font-semibold rounded px-6 py-2 mt-2 hover:bg-emerald-900 transition'>Submit Request</button>
              </form>
            </div>
          </section>
          {/* FAQ Section */}
          <section className='mb-10'>
            <div className='font-semibold text-emerald-900 mb-4'>Frequently Asked Questions</div>
            <div className='flex flex-col gap-4'>
              <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
                <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                  How long does the return process take?
                  <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                  </svg>
                </summary>
                <div className='mt-2 text-gray-600 text-sm'>Once we receive your return, it typically takes 5-7 business days to process your refund or exchange.</div>
              </details>
              <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
                <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                  What is your return window?
                  <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                  </svg>
                </summary>
                <div className='mt-2 text-gray-600 text-sm'>We accept returns within 30 days of the original purchase date for eligible items.</div>
              </details>
              <details className='bg-gray-50 rounded-lg border border-gray-100 shadow-sm p-4 group relative'>
                <summary className='font-semibold text-gray-800 cursor-pointer outline-none pr-8 flex items-center'>
                  Do I need to pay for return shipping?
                  <svg className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 group-open:rotate-180' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                  </svg>
                </summary>
                <div className='mt-2 text-gray-600 text-sm'>Return shipping is free for defective items. For exchanges or returns initiated by the customer, shipping costs may apply.</div>
              </details>
            </div>
          </section>
          {/* Need Additional Help */}
          <section className='mb-10'>
            <div className='bg-[#114438] text-white rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6'>
              <div className='flex-1 flex flex-col items-center md:items-start mb-4 md:mb-0'>
                <div className='font-bold mb-1'>Call Us</div>
                <div className='flex items-center gap-2'>
                  <span className='i-mdi:phone text-xl' />
                  <span>1-800-CRYSTAL</span>
                </div>
              </div>
              <div className='flex-1 flex flex-col items-center md:items-start mb-4 md:mb-0'>
                <div className='font-bold mb-1'>Email Us</div>
                <div className='flex items-center gap-2'>
                  <span className='i-mdi:email text-xl' />
                  <span>support@crystalgem.com</span>
                </div>
              </div>
              <div className='flex-1 flex flex-col items-center md:items-start'>
                <div className='font-bold mb-1'>Live Chat</div>
                <div className='flex items-center gap-2'>
                  <span className='i-mdi:chat text-xl' />
                  <span>Available 24/7</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </div>
  )
}

export default ReturnsExchanges 