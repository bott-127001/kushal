import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Footer from '../homepage/Footer'
import Newsletter from '../homepage/Newsletter'
import API_ENDPOINTS from '../../config/api'

function BlogPage () {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommended, setRecommended] = useState([])
  const [recLoading, setRecLoading] = useState(false)
  const [recError, setRecError] = useState(null)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [relatedError, setRelatedError] = useState(null)

  // Sidebar and recommended products mock data
  const relatedProducts = [
    { title: 'Zodiac Birthstone Necklace', price: '$49', btn: 'Add to Cart' },
    { title: 'Crystal Healing Mala', price: '$29', btn: 'Add to Cart' },
    { title: 'Gemstone Ring', price: '$59', btn: 'Add to Cart' }
  ]
  const consultationTypes = ['Astrology', 'Gemstone', 'Tarot']

  useEffect(() => {
    setLoading(true)
    fetch(API_ENDPOINTS.BLOG_DETAILS(id))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blog')
        return res.json()
      })
      .then(data => {
        setBlog(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  // Fetch recommended products based on blog.relatedProducts
  useEffect(() => {
    if (!blog) return
    setRecLoading(true)
    setRecError(null)
    // If blog.relatedProducts exists and is non-empty, try to fetch by name
    if (blog.relatedProducts && blog.relatedProducts.length > 0) {
      // For now, fetch all products and filter by name (since no /api/products?ids=... endpoint)
      fetch(API_ENDPOINTS.PRODUCTS)
        .then(res => res.json())
        .then(data => {
          const filtered = data.products.filter(p => blog.relatedProducts.includes(p.title))
          setRecommended(filtered)
          setRecLoading(false)
        })
        .catch(err => {
          setRecError('Failed to fetch recommended products')
          setRecLoading(false)
        })
    } else {
      // Fallback: fetch random recommendations
      fetch(`${API_ENDPOINTS.PRODUCTS}/recommendations`)
        .then(res => res.json())
        .then(data => {
          setRecommended(data)
          setRecLoading(false)
        })
        .catch(err => {
          setRecError('Failed to fetch recommended products')
          setRecLoading(false)
        })
    }
  }, [blog])

  // Fetch related blogs by matching at least one tag (excluding current blog)
  useEffect(() => {
    if (!blog || !blog.tags || blog.tags.length === 0) return
    setRelatedLoading(true)
    setRelatedError(null)
    const params = new URLSearchParams()
    params.append('page', 1)
    params.append('limit', 10)
    params.append('sortBy', 'date')
    params.append('order', 'desc')
    fetch(`${API_ENDPOINTS.BLOGS}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Filter blogs that share at least one tag and are not the current blog
        const related = data.blogs.filter(b => b._id !== blog._id && b.tags && b.tags.some(tag => blog.tags.includes(tag)))
        setRelatedBlogs(related.slice(0, 3))
        setRelatedLoading(false)
      })
      .catch(err => {
        setRelatedError('Failed to fetch related blogs')
        setRelatedLoading(false)
      })
  }, [blog])

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col bg-[#faf9fb]'>
        <div className='flex-1 flex items-center justify-center text-gray-500'>Loading blog...</div>
        <Footer />
      </div>
    )
  }
  if (error) {
    return (
      <div className='min-h-screen flex flex-col bg-[#faf9fb]'>
        <div className='flex-1 flex items-center justify-center text-red-500'>{error}</div>
        <Footer />
      </div>
    )
  }
  if (!blog) return null

  return (
    <div className='min-h-screen flex flex-col bg-[#faf9fb]'>
      {/* Hero/Banner */}
      <section className='w-full bg-[#003D37] py-14 px-4'>
        <div className='max-w-5xl mx-auto'>
          <h1 className='text-2xl md:text-3xl font-serif font-bold text-white mb-4'>{blog.title}</h1>
          <div className='flex items-center gap-4 text-white text-sm'>
            <span className='flex items-center gap-1'><svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>{new Date(blog.date).toLocaleDateString()}</span>
            <span className='flex items-center gap-1'><svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>{blog.readTime}</span>
          </div>
        </div>
      </section>
      {/* Main Content Area */}
      <main className='flex flex-col md:flex-row max-w-5xl mx-auto px-4 gap-8 py-10 flex-1'>
        {/* Blog Content */}
        <article className='flex-1'>
          <p className='text-gray-700 text-base mb-6'>{blog.summary}</p>
          {/* Did You Know Box (optional, show if blog.didYouKnow exists) */}
          {blog.didYouKnow && blog.didYouKnow.length > 0 && (
            <div className='bg-[#e6f0ee] border-l-4 border-[#003D37] rounded-lg p-5 mb-8'>
              <div className='flex items-center mb-2'>
                <svg width='22' height='22' fill='none' stroke='#003D37' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M12 8v4l3 3'/></svg>
                <span className='ml-2 font-bold text-[#003D37]'>Did You Know?</span>
              </div>
              <ul className='list-disc list-inside text-[#003D37] text-sm pl-2'>
                {blog.didYouKnow.map((fact, i) => <li key={i}>{fact}</li>)}
              </ul>
            </div>
          )}
          {blog.sectionHeading && <h2 className='text-lg font-serif font-bold text-[#003D37] mb-3'>{blog.sectionHeading}</h2>}
          {blog.sectionText && <p className='text-gray-700 text-base mb-6'>{blog.sectionText}</p>}
          {/* Main content (for now, render as plain text) */}
          <div className='prose prose-lg max-w-none text-gray-800' style={{ whiteSpace: 'pre-line' }}>{blog.content}</div>
        </article>
        {/* Sidebar */}
        <aside className='w-full md:w-80 flex flex-col gap-8'>
          {/* Related Blogs */}
          <div className='bg-white border border-[#003D37] rounded-xl shadow p-6'>
            <h3 className='font-serif font-bold text-base mb-4 text-[#003D37]'>Related Blogs</h3>
            {relatedLoading && <div className='text-gray-500'>Loading related blogs...</div>}
            {relatedError && <div className='text-red-500'>{relatedError}</div>}
            {!relatedLoading && !relatedError && relatedBlogs.length === 0 && <div className='text-gray-500'>No related blogs found.</div>}
            <ul className='space-y-4'>
              {!relatedLoading && !relatedError && relatedBlogs.map(b => (
                <li key={b._id}>
                  <Link to={`/blogs/${b._id}`} className='font-semibold text-[#003D37] hover:underline'>{b.title}</Link>
                  <div className='text-xs text-gray-500'>{new Date(b.date).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </div>
          {/* Book a Consultation */}
          <div className='bg-[#e6f0ee] border border-[#003D37] rounded-xl shadow p-6'>
            <h3 className='font-serif font-bold text-base mb-4 text-[#003D37]'>Book a Consultation</h3>
            <p className='text-xs text-gray-700 mb-3'>Get personalized guidance about your zodiac and gemstones.</p>
            <form className='flex flex-col gap-3'>
              <input type='text' placeholder='Your Name' className='border border-[#003D37] rounded px-3 py-2 text-sm' />
              <input type='email' placeholder='Your Email' className='border border-[#003D37] rounded px-3 py-2 text-sm' />
              <select className='border border-[#003D37] rounded px-3 py-2 text-sm'>
                <option>Select Consultation Type</option>
                {consultationTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <button className='px-4 py-2 bg-[#003D37] text-white rounded font-semibold text-sm mt-2'>Schedule Consultation</button>
            </form>
          </div>
        </aside>
      </main>
      {/* Recommended Products */}
      <section className='w-full bg-[#e6f0ee] py-10 px-4'>
        <div className='max-w-5xl mx-auto'>
          <h3 className='font-serif font-bold text-base mb-6 text-[#003D37]'>Recommended Products</h3>
          {recLoading && <div className='text-gray-500'>Loading recommended products...</div>}
          {recError && <div className='text-red-500'>{recError}</div>}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
            {!recLoading && !recError && recommended.map((prod, i) => (
              <div key={prod._id || i} className='bg-white border border-[#003D37] rounded-lg p-4 flex flex-col items-start'>
                <span className='font-semibold text-sm mb-2'>{prod.title}</span>
                <span className='text-[#003D37] font-bold mb-3'>{prod.price}</span>
                <button className='px-3 py-1 bg-[#003D37] text-white rounded text-xs font-semibold'>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Newsletter />
      <Footer />
    </div>
  )
}

export default BlogPage 
