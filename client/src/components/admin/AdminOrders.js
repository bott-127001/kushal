import React, { useEffect, useState } from 'react'
import API_ENDPOINTS from '../../config/api'

function AdminOrders () {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusOrderId, setStatusOrderId] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function fetchOrders () {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('adminToken')
    fetch(API_ENDPOINTS.ADMIN_ORDERS, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
      })
      .then(data => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  function openViewModal (order) {
    setViewOrder(order)
  }

  function openStatusModal (order) {
    setStatusOrderId(order._id)
    setNewStatus(order.status)
    setShowStatusModal(true)
  }

  async function handleUpdateStatus (e) {
    e.preventDefault()
    setStatusError(null)
    setStatusLoading(true)
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN_ORDERS}/${statusOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')
      setShowStatusModal(false)
      setStatusOrderId(null)
      setNewStatus('')
      fetchOrders()
    } catch (err) {
      setStatusError(err.message)
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleDeleteOrder () {
    setDeleteLoading(true)
    setDeleteError(null)
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN_ORDERS}/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete order')
      setDeleteId(null)
      fetchOrders()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-serif font-bold text-[#23233a]'>Orders</h2>
      </div>
      {loading && <div className='text-gray-500'>Loading orders...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      {!loading && !error && (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-[#FFD700] rounded-xl'>
            <thead>
              <tr className='bg-[#FFF8DC] text-[#23233a]'>
                <th className='py-3 px-4 text-left'>Order ID</th>
                <th className='py-3 px-4 text-left'>User</th>
                <th className='py-3 px-4 text-left'>Date</th>
                <th className='py-3 px-4 text-left'>Total</th>
                <th className='py-3 px-4 text-left'>Status</th>
                <th className='py-3 px-4 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className='border-t border-[#FFD700]'>
                  <td className='py-2 px-4'>{order._id}</td>
                  <td className='py-2 px-4'>{order.user?.email || 'N/A'}</td>
                  <td className='py-2 px-4'>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                  <td className='py-2 px-4'>{order.total ? `₹${order.total}` : ''}</td>
                  <td className='py-2 px-4'>{order.status}</td>
                  <td className='py-2 px-4'>
                    <button className='px-3 py-1 bg-[#5B4DB1] text-white rounded text-xs font-semibold mr-2' onClick={() => openViewModal(order)}>View</button>
                    <button className='px-3 py-1 bg-[#FFD700] text-white rounded text-xs font-semibold mr-2' onClick={() => openStatusModal(order)}>Update Status</button>
                    <button className='px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold' onClick={() => setDeleteId(order._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* View Order Modal */}
      {viewOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-2xl flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setViewOrder(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Order Details</h3>
            <div className='mb-2'>
              <span className='font-semibold'>Order ID:</span> {viewOrder._id}
            </div>
            <div className='mb-2'>
              <span className='font-semibold'>User:</span> {viewOrder.user?.email || 'N/A'}
            </div>
            <div className='mb-2'>
              <span className='font-semibold'>Date:</span> {viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString() : ''}
            </div>
            <div className='mb-2'>
              <span className='font-semibold'>Status:</span> {viewOrder.status}
            </div>
            <div className='mb-2'>
              <span className='font-semibold'>Total:</span> ₹{viewOrder.total}
            </div>
            <div className='mb-2'>
              <span className='font-semibold'>Shipping:</span> {viewOrder.shippingAddress ? `${viewOrder.shippingAddress.address}, ${viewOrder.shippingAddress.city}, ${viewOrder.shippingAddress.state}, ${viewOrder.shippingAddress.zip}` : 'N/A'}
            </div>
            <div className='mb-2'>
              <span className='font-semibold'>Products:</span>
              <ul className='list-disc ml-6'>
                {viewOrder.products?.map((item, idx) => (
                  <li key={idx}>
                    {item.product?.title || 'Product'} x {item.quantity} (₹{item.price})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Update Status Modal */}
      {showStatusModal && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <form className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-4 relative' onSubmit={handleUpdateStatus}>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setShowStatusModal(false)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Update Order Status</h3>
            <select className='border border-gray-300 rounded px-3 py-2' value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
              <option value='Pending'>Pending</option>
              <option value='Processing'>Processing</option>
              <option value='Shipped'>Shipped</option>
              <option value='Delivered'>Delivered</option>
              <option value='Cancelled'>Cancelled</option>
            </select>
            {statusError && <div className='text-red-500 text-center'>{statusError}</div>}
            <button type='submit' className='w-full py-3 bg-[#FFD700] text-white font-serif rounded transition hover:brightness-110 mt-2 font-bold' disabled={statusLoading}>
              {statusLoading ? 'Saving...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setDeleteId(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Delete Order</h3>
            <p>Are you sure you want to delete this order?</p>
            {deleteError && <div className='text-red-500 text-center'>{deleteError}</div>}
            <div className='flex gap-4 mt-2'>
              <button className='flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold' onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button className='flex-1 py-2 bg-red-500 text-white rounded font-semibold' onClick={handleDeleteOrder} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders 
