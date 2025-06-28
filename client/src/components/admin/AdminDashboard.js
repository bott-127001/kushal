import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'

function AdminDashboard () {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [blockLoading, setBlockLoading] = useState(false)
  const [isConsultationBlocked, setIsConsultationBlocked] = useState(false)
  const [consultationBlockedUntil, setConsultationBlockedUntil] = useState('')
  const [blockError, setBlockError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) navigate('/admin/login')
  }, [navigate])

  useEffect(() => {
    fetchAnalytics()
    fetchConsultationBlock()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConsultationBlock = async () => {
    try {
      const response = await fetch('/api/settings/consultation-blocked')
      const data = await response.json()
      setIsConsultationBlocked(!!data.isConsultationBlocked)
      setConsultationBlockedUntil(data.consultationBlockedUntil ? data.consultationBlockedUntil.slice(0, 10) : '')
    } catch (err) {
      setBlockError('Failed to fetch booking status')
    }
  }

  const handleToggleBlock = async () => {
    setBlockLoading(true)
    setBlockError('')
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/settings/consultation-blocked', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isConsultationBlocked: !isConsultationBlocked })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update booking status')
      setIsConsultationBlocked(data.isConsultationBlocked)
    } catch (err) {
      setBlockError(err.message)
    } finally {
      setBlockLoading(false)
    }
  }

  const handleSetBlockedUntil = async (e) => {
    e.preventDefault()
    setBlockLoading(true)
    setBlockError('')
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/settings/consultation-blocked', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consultationBlockedUntil })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update blackout date')
      setConsultationBlockedUntil(data.consultationBlockedUntil ? data.consultationBlockedUntil.slice(0, 10) : '')
    } catch (err) {
      setBlockError(err.message)
    } finally {
      setBlockLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100'
      case 'Processing': return 'text-blue-600 bg-blue-100'
      case 'Shipped': return 'text-purple-600 bg-purple-100'
      case 'Delivered': return 'text-green-600 bg-green-100'
      case 'Cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg text-gray-600'>Loading analytics...</div>
      </div>
    )
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-[#23233a]'>Admin Dashboard</h1>
        <div className='flex items-center gap-4'>
          <span className='font-semibold text-gray-700'>Consultation Booking:</span>
          <button
            onClick={handleToggleBlock}
            disabled={blockLoading}
            className={`px-4 py-2 rounded font-semibold transition ${isConsultationBlocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} ${blockLoading ? 'opacity-60' : ''}`}
          >
            {isConsultationBlocked ? 'Blocked' : 'Open'}
          </button>
        </div>
      </div>
      <form onSubmit={handleSetBlockedUntil} className='flex items-center gap-4 mb-6'>
        <label className='font-semibold text-gray-700'>Block bookings until:</label>
        <input
          type='date'
          value={consultationBlockedUntil}
          onChange={e => setConsultationBlockedUntil(e.target.value)}
          className='border border-gray-300 rounded px-3 py-2'
        />
        <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded font-semibold' disabled={blockLoading}>
          Set Blackout
        </button>
        {consultationBlockedUntil && (
          <span className='text-sm text-gray-600'>Current: {consultationBlockedUntil}</span>
        )}
      </form>
      {blockError && <div className='text-red-500 mb-4'>{blockError}</div>}
      <h1 className='text-3xl font-serif font-bold mb-8 text-[#23233a]'>Dashboard Analytics</h1>
      {/* Key Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-md p-6 border border-[#FFD700]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Sales (30 days)</p>
              <p className='text-2xl font-bold text-[#23233a]'>{formatCurrency(analytics?.totalSales || 0)}</p>
            </div>
            <div className='p-3 bg-green-100 rounded-full'>
              <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6 border border-[#FFD700]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Orders (30 days)</p>
              <p className='text-2xl font-bold text-[#23233a]'>{analytics?.orderCount || 0}</p>
            </div>
            <div className='p-3 bg-blue-100 rounded-full'>
              <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6 border border-[#FFD700]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>New Users (30 days)</p>
              <p className='text-2xl font-bold text-[#23233a]'>{analytics?.newUsers || 0}</p>
            </div>
            <div className='p-3 bg-purple-100 rounded-full'>
              <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
              </svg>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6 border border-[#FFD700]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Consultations (30 days)</p>
              <p className='text-2xl font-bold text-[#23233a]'>{analytics?.consultationBookings || 0}</p>
            </div>
            <div className='p-3 bg-yellow-100 rounded-full'>
              <svg className='w-6 h-6 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Recent Orders Table */}
        <div className='bg-white rounded-xl shadow-md border border-[#FFD700]'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-[#23233a]'>Recent Orders</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Customer</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {analytics?.recentOrders?.map((order, index) => (
                  <tr key={order._id || index} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>{order.name}</div>
                        <div className='text-sm text-gray-500'>{order.email}</div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatCurrency(order.total)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Popular Products Table */}
        <div className='bg-white rounded-xl shadow-md border border-[#FFD700]'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-[#23233a]'>Popular Products</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Product</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Price</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Popularity</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {analytics?.popularProducts?.map((product, index) => (
                  <tr key={product._id || index} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <img src={product.image} alt={product.title} className='w-10 h-10 rounded mr-3 object-cover border border-gray-200' />
                        <span className='text-sm font-medium text-gray-900'>{product.title}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{product.price}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{product.popularity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 