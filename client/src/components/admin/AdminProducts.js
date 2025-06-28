import React, { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

function AdminProducts () {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    image: '', title: '', price: '', originalPrice: '', category: '', material: '', style: '', description: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)

  function fetchProducts () {
    setLoading(true)
    setError(null)
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        setProducts(data.products)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function handleFormChange (e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function openAddModal () {
    setForm({ image: '', title: '', price: '', originalPrice: '', category: '', material: '', style: '', description: '' })
    setEditId(null)
    setShowModal(true)
  }

  function openEditModal (product) {
    setForm({
      image: product.image || '',
      title: product.title || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || '',
      material: product.material || '',
      style: product.style || '',
      description: product.description || ''
    })
    setEditId(product._id)
    setShowModal(true)
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    const formData = new FormData()
    acceptedFiles.forEach(file => formData.append('images', file))
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    setUploading(false)
    setImagePreviews(data.urls)
    setForm(f => ({ ...f, image: data.urls[0] || '' }))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true })

  async function handleAddOrEditProduct (e) {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)
    const token = localStorage.getItem('adminToken')
    try {
      let res, data
      if (editId) {
        res = await fetch(`/api/products/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(form)
        })
      } else {
        res = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(form)
        })
      }
      data = await res.json()
      if (!res.ok) throw new Error(data.error || (editId ? 'Failed to update product' : 'Failed to add product'))
      setShowModal(false)
      setEditId(null)
      setForm({ image: '', title: '', price: '', originalPrice: '', category: '', material: '', style: '', description: '' })
      fetchProducts()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteProduct () {
    setDeleteLoading(true)
    setDeleteError(null)
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete product')
      setDeleteId(null)
      fetchProducts()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-serif font-bold text-[#23233a]'>Products</h2>
        <button className='px-4 py-2 bg-[#FFD700] text-white rounded font-semibold text-sm' onClick={openAddModal}>+ Add Product</button>
      </div>
      {loading && <div className='text-gray-500'>Loading products...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      {!loading && !error && (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-[#FFD700] rounded-xl'>
            <thead>
              <tr className='bg-[#FFF8DC] text-[#23233a]'>
                <th className='py-3 px-4 text-left'>Image</th>
                <th className='py-3 px-4 text-left'>Title</th>
                <th className='py-3 px-4 text-left'>Price</th>
                <th className='py-3 px-4 text-left'>Original Price</th>
                <th className='py-3 px-4 text-left'>Category</th>
                <th className='py-3 px-4 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className='border-t border-[#FFD700]'>
                  <td className='py-2 px-4'>
                    <img src={product.image} alt={product.title} className='w-16 h-16 object-cover rounded' />
                  </td>
                  <td className='py-2 px-4'>{product.title}</td>
                  <td className='py-2 px-4'>{product.price}</td>
                  <td className='py-2 px-4'>{product.originalPrice || '-'}</td>
                  <td className='py-2 px-4'>{product.category}</td>
                  <td className='py-2 px-4'>
                    <button className='px-3 py-1 bg-[#5B4DB1] text-white rounded text-xs font-semibold mr-2' onClick={() => openEditModal(product)}>Edit</button>
                    <button className='px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold' onClick={() => setDeleteId(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <form className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-lg flex flex-col gap-4 relative' onSubmit={handleAddOrEditProduct}>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => { setShowModal(false); setEditId(null) }}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>{editId ? 'Edit Product' : 'Add Product'}</h3>
            {/* Drag-and-drop image upload */}
            <div {...getRootProps()} style={{ border: '2px dashed #003D37', borderRadius: 8, padding: 16, textAlign: 'center', background: isDragActive ? '#e6f7f1' : '#fafafa', cursor: 'pointer' }}>
              <input {...getInputProps()} />
              {isDragActive ? <p>Drop the images here ...</p> : <p>Drag & drop images here, or click to select files</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {imagePreviews.map(url => (
                  <img key={url} src={url} alt='preview' style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                ))}
                {form.image && !imagePreviews.length && (
                  <img src={form.image} alt='preview' style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                )}
              </div>
              {uploading && <div style={{ marginTop: 8 }}>Uploading...</div>}
            </div>
            <input type='text' name='title' placeholder='Title' className='border border-gray-300 rounded px-3 py-2' value={form.title} onChange={handleFormChange} required />
            <div className='flex gap-2'>
              <input type='number' min='0' step='0.01' name='originalPrice' placeholder='Original Price' className='border border-gray-300 rounded px-3 py-2 flex-1' value={form.originalPrice} onChange={handleFormChange} />
              <input type='number' min='0' step='0.01' name='price' placeholder='Discounted Price' className='border border-gray-300 rounded px-3 py-2 flex-1' value={form.price} onChange={handleFormChange} required />
            </div>
            <input type='text' name='category' placeholder='Category' className='border border-gray-300 rounded px-3 py-2' value={form.category} onChange={handleFormChange} required />
            <input type='text' name='material' placeholder='Material' className='border border-gray-300 rounded px-3 py-2' value={form.material} onChange={handleFormChange} />
            <input type='text' name='style' placeholder='Style' className='border border-gray-300 rounded px-3 py-2' value={form.style} onChange={handleFormChange} />
            <textarea name='description' placeholder='Description' className='border border-gray-300 rounded px-3 py-2' value={form.description} onChange={handleFormChange} />
            {formError && <div className='text-red-500 text-center'>{formError}</div>}
            <button type='submit' className='w-full py-3 bg-[#FFD700] text-white font-serif rounded transition hover:brightness-110 mt-2 font-bold' disabled={formLoading}>
              {formLoading ? (editId ? 'Saving...' : 'Adding...') : (editId ? 'Save Changes' : 'Add Product')}
            </button>
          </form>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setDeleteId(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Delete Product</h3>
            <p>Are you sure you want to delete this product?</p>
            {deleteError && <div className='text-red-500 text-center'>{deleteError}</div>}
            <div className='flex gap-4 mt-2'>
              <button className='flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold' onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button className='flex-1 py-2 bg-red-500 text-white rounded font-semibold' onClick={handleDeleteProduct} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts 
