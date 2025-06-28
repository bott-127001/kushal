import React, { useEffect, useState } from 'react'

function AdminBlogs () {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    author: '',
    date: '',
    tags: '',
    content: '',
    image: '',
    summary: '',
    readTime: '',
    slug: '',
    images: []
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function fetchBlogs () {
    setLoading(true)
    setError(null)
    fetch('/api/blogs')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blogs')
        return res.json()
      })
      .then(data => {
        setBlogs(data.blogs || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  function slugify (text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
  }

  function handleFormChange (e) {
    const { name, value } = e.target
    setForm(f => {
      if (name === 'title') {
        return { ...f, title: value, slug: slugify(value) }
      }
      return { ...f, [name]: value }
    })
  }

  function handleImageUrlChange (idx, value) {
    setForm(f => {
      const images = [...(f.images || [])]
      images[idx] = value
      return { ...f, images }
    })
  }

  function addImageField () {
    setForm(f => {
      const images = [...(f.images || [])]
      if (images.length < 4) images.push('')
      return { ...f, images }
    })
  }

  function removeImageField (idx) {
    setForm(f => {
      const images = [...(f.images || [])]
      images.splice(idx, 1)
      return { ...f, images }
    })
  }

  function openAddModal () {
    setForm({
      title: '',
      author: '',
      date: '',
      tags: '',
      content: '',
      image: '',
      summary: '',
      readTime: '',
      slug: '',
      images: []
    })
    setEditId(null)
    setShowModal(true)
  }

  function openEditModal (blog) {
    setForm({
      title: blog.title || '',
      author: blog.author || '',
      date: blog.date ? blog.date.slice(0, 10) : '',
      tags: blog.tags ? blog.tags.join(', ') : '',
      content: blog.content || '',
      image: blog.image || '',
      summary: blog.summary || '',
      readTime: blog.readTime || '',
      slug: blog.slug || '',
      images: blog.images || []
    })
    setEditId(blog._id)
    setShowModal(true)
  }

  async function handleAddOrEditBlog (e) {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)
    const token = localStorage.getItem('adminToken')
    try {
      let res, data
      const payload = {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: form.images.filter(Boolean)
      }
      if (!payload.slug) payload.slug = slugify(form.title)
      if (!payload.readTime) payload.readTime = '5 min' // fallback default
      if (!payload.summary) payload.summary = form.content.slice(0, 120) + '...'
      if (editId) {
        res = await fetch(`/api/blogs/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }
      data = await res.json()
      if (!res.ok) throw new Error(data.error || (editId ? 'Failed to update blog' : 'Failed to add blog'))
      setShowModal(false)
      setEditId(null)
      setForm({ title: '', author: '', date: '', tags: '', content: '', image: '', summary: '', readTime: '', slug: '', images: [] })
      fetchBlogs()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteBlog () {
    setDeleteLoading(true)
    setDeleteError(null)
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`/api/blogs/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete blog')
      setDeleteId(null)
      fetchBlogs()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-serif font-bold text-[#23233a]'>Blogs</h2>
        <button className='px-4 py-2 bg-[#FFD700] text-white rounded font-semibold text-sm' onClick={openAddModal}>+ Add Blog</button>
      </div>
      {loading && <div className='text-gray-500'>Loading blogs...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      {!loading && !error && (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-[#FFD700] rounded-xl'>
            <thead>
              <tr className='bg-[#FFF8DC] text-[#23233a]'>
                <th className='py-3 px-4 text-left'>Title</th>
                <th className='py-3 px-4 text-left'>Author</th>
                <th className='py-3 px-4 text-left'>Date</th>
                <th className='py-3 px-4 text-left'>Tags</th>
                <th className='py-3 px-4 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog._id} className='border-t border-[#FFD700]'>
                  <td className='py-2 px-4'>{blog.title}</td>
                  <td className='py-2 px-4'>{blog.author}</td>
                  <td className='py-2 px-4'>{blog.date ? new Date(blog.date).toLocaleDateString() : ''}</td>
                  <td className='py-2 px-4'>{blog.tags ? blog.tags.join(', ') : ''}</td>
                  <td className='py-2 px-4'>
                    <button className='px-3 py-1 bg-[#5B4DB1] text-white rounded text-xs font-semibold mr-2' onClick={() => openEditModal(blog)}>Edit</button>
                    <button className='px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold' onClick={() => setDeleteId(blog._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add/Edit Blog Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <form className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-lg flex flex-col gap-4 relative' onSubmit={handleAddOrEditBlog}>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => { setShowModal(false); setEditId(null) }}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>{editId ? 'Edit Blog' : 'Add Blog'}</h3>
            <input type='text' name='title' placeholder='Title' className='border border-gray-300 rounded px-3 py-2' value={form.title} onChange={handleFormChange} required />
            <input type='text' name='author' placeholder='Author' className='border border-gray-300 rounded px-3 py-2' value={form.author} onChange={handleFormChange} required />
            <input type='date' name='date' placeholder='Date' className='border border-gray-300 rounded px-3 py-2' value={form.date} onChange={handleFormChange} required />
            <input type='text' name='tags' placeholder='Tags (comma-separated)' className='border border-gray-300 rounded px-3 py-2' value={form.tags} onChange={handleFormChange} />
            <input type='text' name='readTime' placeholder='Read Time (e.g. 5 min)' className='border border-gray-300 rounded px-3 py-2' value={form.readTime} onChange={handleFormChange} required />
            <input type='text' name='summary' placeholder='Summary (optional)' className='border border-gray-300 rounded px-3 py-2' value={form.summary} onChange={handleFormChange} />
            <textarea name='content' placeholder='Content' className='border border-gray-300 rounded px-3 py-2 min-h-[120px]' value={form.content} onChange={handleFormChange} required />
            {/* Multiple images for blog content */}
            <div>
              <div className='flex items-center justify-between mb-1'>
                <label className='font-semibold'>Blog Images (up to 4)</label>
                <button type='button' className='text-[#5B4DB1] font-bold text-sm' onClick={addImageField} disabled={form.images.length >= 4}>+ Add Image</button>
              </div>
              {form.images && form.images.map((img, idx) => (
                <div key={idx} className='flex items-center gap-2 mb-2'>
                  <input
                    type='text'
                    placeholder='Image URL'
                    className='border border-gray-300 rounded px-3 py-2 flex-1'
                    value={img}
                    onChange={e => handleImageUrlChange(idx, e.target.value)}
                  />
                  {img && <img src={img} alt='' style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />}
                  <button type='button' className='text-red-500 text-lg font-bold' onClick={() => removeImageField(idx)} title='Remove'>×</button>
                </div>
              ))}
            </div>
            <input type='hidden' name='slug' value={form.slug} />
            {formError && <div className='text-red-500 text-center'>{formError}</div>}
            <button type='submit' className='w-full py-3 bg-[#FFD700] text-white font-serif rounded transition hover:brightness-110 mt-2 font-bold' disabled={formLoading}>
              {formLoading ? (editId ? 'Saving...' : 'Adding...') : (editId ? 'Save Changes' : 'Add Blog')}
            </button>
          </form>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setDeleteId(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Delete Blog</h3>
            <p>Are you sure you want to delete this blog?</p>
            {deleteError && <div className='text-red-500 text-center'>{deleteError}</div>}
            <div className='flex gap-4 mt-2'>
              <button className='flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold' onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button className='flex-1 py-2 bg-red-500 text-white rounded font-semibold' onClick={handleDeleteBlog} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBlogs 
