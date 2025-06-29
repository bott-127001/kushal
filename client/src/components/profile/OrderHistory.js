import React, { useState, useEffect } from 'react'
import useAuth from '../../store/auth'
import API_ENDPOINTS from '../../config/api'

function StatusBadge ({ status }) {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full'
  const statusClasses = {
    Delivered: 'bg-green-100 text-green-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped: 'bg-yellow-100 text-yellow-800'
  }
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>
}

function OrderHistory () {
  const [activeTab, setActiveTab] = useState('All Orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered']

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MY_ORDERS, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [token])

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All Orders') return true
    return order.status === activeTab
  })

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Order History</h2>
        <div className='flex space-x-1 bg-gray-100 p-1 rounded-md'>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className='space-y-4'>
        {loading && <p>Loading orders...</p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && filteredOrders.map(order => (
          <div key={order._id} className='border border-gray-200 rounded-lg p-4 flex justify-between items-center'>
            <div>
              <p className='font-semibold text-gray-800'>{order._id}</p>
              <p className='text-sm text-gray-500 mb-2'>{new Date(order.createdAt).toLocaleDateString()}</p>
              <div className='flex items-center space-x-4'>
                <div className='flex -space-x-2'>
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className='w-10 h-10 bg-gray-200 rounded-full border-2 border-white' title={item.title} />
                  ))}
                </div>
                <div className='text-sm text-gray-600'>
                  {order.items.map(i => i.title).join(' + ')}
                </div>
              </div>
            </div>
            <div className='text-right'>
              <StatusBadge status={order.status || 'Processing'} />
              <p className='font-semibold text-lg text-gray-800 mt-1'>${order.total.toFixed(2)}</p>
              <a href='#' className='text-sm font-semibold text-[#5B4DB1] hover:underline'>
                View Details &gt;
              </a>
            </div>
          </div>
        ))}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            No orders found in this category.
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory 