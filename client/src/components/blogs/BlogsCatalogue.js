import React, { useEffect, useState } from 'react'
import Footer from '../homepage/Footer'
import { Link } from 'react-router-dom'

function BlogsCatalogue () {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('Latest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [topics, setTopics] = useState([])
  const [writers, setWriters] = useState([])
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [isMobileTagsOpen, setIsMobileTagsOpen] = useState(false)

  // Sidebar mock data
  const categories = ['All', 'Astrology', 'Gemstones', 'Zodiac Signs', 'Crystal Healing']
  const sortOptions = ['Latest', 'Popular']
  const popularTopics = ['Astrology', 'Gemstones', 'Zodiac Signs', 'Crystal Healing', 'Rituals', 'Tarot', 'Vastu', 'Reiki']
  const featuredWriters = ['Sarah Crystal', 'Michael Star', 'Emma Light', 'David Sky', 'Niyati Jyotika']

  // Map sort option to API params
  function getSortParams (sort) {
    if (sort === 'Latest') return { sortBy: 'date', order: 'desc' }
    if (sort === 'Popular') return { sortBy: 'readTime', order: 'desc' } // Placeholder, adjust as needed
    return { sortBy: 'date', order: 'desc' }
  }

  // Fetch blogs with filters
  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category && category !== 'All') params.append('tag', category)
    const { sortBy, order } = getSortParams(sort)
    params.append('sortBy', sortBy)
    params.append('order', order)
    params.append('page', page)
    fetch(`/api/blogs?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blogs')
        return res.json()
      })
      .then(data => {
        setBlogs(data.blogs)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [search, category, sort, page])

  // Fetch unique tags and authors for sidebar
  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        const tagsSet = new Set()
        const authorsSet = new Set()
        data.blogs.forEach(blog => {
          if (blog.tags) blog.tags.forEach(tag => tagsSet.add(tag))
          if (blog.author) authorsSet.add(blog.author)
        })
        setTopics(Array.from(tagsSet))
        setWriters(Array.from(authorsSet))
      })
  }, [])

  function handleSearchSubmit (e) {
    e.preventDefault()
    setPage(1)
  }

  function handleCategory (cat) {
    setCategory(cat)
    setPage(1)
  }

  function handleSort (e) {
    setSort(e.target.value)
    setPage(1)
  }

  function handlePageChange (newPage) {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
  }

  // PageTransition component for smooth fade-in
  function PageTransition ({ children }) {
    const [show, setShow] = React.useState(false)
    React.useEffect(() => { setShow(true) }, [])
    return (
      <div className={`min-h-screen flex flex-col transition-all duration-500 ${show ? 'animate-pageFadeIn' : ''}`}>
        {children}
        <style>{`
          @keyframes pageFadeIn {
            0% { opacity: 0; transform: translateY(32px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-pageFadeIn {
            animation: pageFadeIn 0.6s cubic-bezier(0.4,0,0.2,1) both;
          }
        `}</style>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className='min-h-screen flex flex-col bg-[#faf9fb]'>
        {/* Hero Banner */}
        <section className='flex flex-col items-center justify-center min-h-[20vh] bg-white text-center'>
          <h1 className='text-3xl md:text-5xl font-serif font-bold text-[#003D37] mb-4'>Discover the Magic of Astrology & Precious Stones</h1>
          <p className='text-[#003D37] text-lg font-serif mb-6'>Explore articles, guides, and insights from our experts</p>
        </section>
        {/* Search Bar */}
        <div className='w-full py-6 px-4 bg-white border-b border-[#003D37]'>
          <div className='max-w-5xl mx-auto text-center'>
            <form className='flex justify-center' onSubmit={handleSearchSubmit}>
              <div className='relative w-full max-w-xl'>
                <input
                  type='text'
                  placeholder='Search articles, gemstones, or zodiac signs...'
                  className='w-full py-3 pl-5 pr-12 rounded border border-[#003D37] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003D37] transition'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type='submit' className='absolute right-3 top-1/2 -translate-y-1/2 text-[#003D37]'>
                  <svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='11' cy='11' r='8'/><path d='M21 21l-4.35-4.35'/></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* Category Tabs & Sort */}
        <div className='w-full border-b border-[#003D37] bg-white'>
          <div className='max-w-5xl mx-auto flex items-center justify-between px-4 py-4'>
            {/* Mobile: Tags dropdown button */}
            <div className='md:hidden flex-1'>
              <button
                onClick={() => setIsMobileTagsOpen(v => !v)}
                className='w-40 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow border border-[#003D37] text-left text-xs font-semibold'
              >
                <span>Tags</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isMobileTagsOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              {isMobileTagsOpen && (
                <div className='absolute left-0 z-20 mt-2 w-48 max-w-xs bg-white border border-[#003D37] rounded-lg shadow-lg p-2 flex flex-wrap gap-2'>
                  <button
                    key='All'
                    className={`px-4 py-2 rounded font-semibold text-xs transition ${category === 'All' ? 'bg-[#003D37] text-white' : 'bg-white text-[#23233a] border border-[#003D37]'}`}
                    onClick={() => { handleCategory('All'); setIsMobileTagsOpen(false) }}
                  >
                    All
                  </button>
                  {topics.map(cat => (
                    <button
                      key={cat}
                      className={`px-4 py-2 rounded font-semibold text-xs transition ${category === cat ? 'bg-[#003D37] text-white' : 'bg-white text-[#23233a] border border-[#003D37]'}`}
                      onClick={() => { handleCategory(cat); setIsMobileTagsOpen(false) }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Desktop: Horizontal tag bar */}
            <div className='hidden md:flex gap-2 md:gap-4 flex-1'>
              <button key='All' className={`px-5 py-2 rounded font-semibold text-sm transition ${category === 'All' ? 'bg-[#003D37] text-white' : 'bg-white text-[#23233a] border border-[#003D37]'}`} onClick={() => handleCategory('All')}>All</button>
              {topics.map(cat => (
                <button key={cat} className={`px-5 py-2 rounded font-semibold text-sm transition ${category === cat ? 'bg-[#003D37] text-white' : 'bg-white text-[#23233a] border border-[#003D37]'}`} onClick={() => handleCategory(cat)}>{cat}</button>
              ))}
            </div>
            {/* Sort dropdown (unchanged) */}
            <div className='flex items-center gap-2'>
              <svg width='18' height='18' fill='none' stroke='#23233a' strokeWidth='2' viewBox='0 0 24 24'><path d='M3 6h18M6 12h12M9 18h6'/></svg>
              <div className='relative inline-block text-left'>
                <button
                  type='button'
                  className='inline-flex items-center border border-[#003D37] rounded px-3 py-2 text-sm bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#003D37] transition-all duration-150'
                  onClick={() => setSortDropdownOpen(v => !v)}
                  aria-haspopup='listbox'
                  aria-expanded={sortDropdownOpen}
                  style={{ minWidth: 0 }}
                >
                  <span className='flex items-center'>
                    <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor'/><path d='M12 6v6l4 2' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'/></svg>
                    <span className='ml-1'>{sort}</span>
                  </span>
                  <svg className='w-3 h-3 ml-1 text-gray-400' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M19 9l-7 7-7-7' /></svg>
                </button>
                {sortDropdownOpen && (
                  <ul
                    className='absolute right-0 z-10 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg py-1 text-xs origin-top-right transition-all duration-350'
                    role='listbox'
                  >
                    {['Latest', 'Popular'].map(opt => (
                      <li
                        key={opt}
                        className={`flex items-center px-3 py-2 cursor-pointer transition-all duration-100 rounded ${sort === opt ? 'bg-gray-100 font-semibold text-[#003D37]' : 'hover:bg-gray-50 hover:text-[#003D37]'}`}
                        onClick={() => { setSort(opt); setSortDropdownOpen(false) }}
                        role='option'
                        aria-selected={sort === opt}
                      >
                        <span className={`mr-2 ${sort === opt ? 'text-[#003D37]' : 'text-gray-400 group-hover:text-[#003D37]'}`}>{opt === 'Latest' ? <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor'/><path d='M12 6v6l4 2' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'/></svg> : <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><polygon points='12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2' strokeLinejoin='round'/></svg>}</span>
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <main className='flex flex-col md:flex-row max-w-7xl mx-auto px-4 gap-8 py-10 flex-1'>
          {/* Blog Cards Grid */}
          <div className='flex-1 grid grid-cols-2 gap-8'>
            {loading && <div className='col-span-full text-center text-gray-500'>Loading blogs...</div>}
            {error && <div className='col-span-full text-center text-red-500'>{error}</div>}
            {!loading && !error && blogs.length === 0 && <div className='col-span-full text-center text-gray-500'>No blogs found.</div>}
            {!loading && !error && blogs.map((card, i) => (
              <Link to={`/blogs/${card._id}`} key={card._id} className='bg-white border border-[#003D37] rounded-xl shadow p-6 flex flex-col justify-between min-h-[260px] hover:shadow-lg transition'>
                <div>
                  {card.tags && card.tags.length > 0 && (
                    <span className='inline-block mb-3 px-3 py-1 rounded bg-[#003D37] bg-opacity-10 text-[#003D37] text-xs font-bold'>{card.tags[0]}</span>
                  )}
                  <h2 className='font-serif font-bold text-lg mb-2'>{card.title}</h2>
                  <div className='text-xs text-gray-500 mb-2'>{card.author} • {new Date(card.date).toLocaleDateString()} • {card.readTime}</div>
                  <p className='text-gray-700 text-sm mb-4'>{card.summary}</p>
                </div>
              </Link>
            ))}
          </div>
          {/* Sidebar */}
          <aside className='w-full md:w-80 flex flex-col gap-8'>
            {/* Popular Topics */}
            <div className='bg-white border border-[#003D37] rounded-xl shadow p-6'>
              <h3 className='font-serif font-bold text-base mb-4 text-[#003D37]'>Popular Topics</h3>
              <div className='flex flex-wrap gap-2'>
                {topics.map(topic => (
                  <span key={topic} className='px-3 py-1 rounded bg-[#003D37] bg-opacity-10 text-[#003D37] text-xs font-semibold border border-[#003D37]'>{topic}</span>
                ))}
              </div>
            </div>
            {/* Newsletter */}
            <div className='bg-white border border-[#003D37] rounded-xl shadow p-6'>
              <h3 className='font-serif font-bold text-base mb-4 text-[#003D37]'>Newsletter</h3>
              <p className='text-sm text-gray-600 mb-4'>Subscribe for weekly astrological insights and exclusive offers.</p>
              <div className='flex gap-2'>
                <input type='email' placeholder='Your email address' className='flex-1 border border-[#003D37] rounded px-3 py-2 text-sm' />
                <button className='px-4 py-2 bg-[#003D37] text-white rounded font-semibold text-sm'>Subscribe</button>
              </div>
            </div>
          </aside>
        </main>
        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className='flex justify-center items-center mt-8 space-x-2'>
            <button
              className='px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-[#003D37] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className='px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
        <Footer />
      </div>
    </PageTransition>
  )
}

export default BlogsCatalogue 
