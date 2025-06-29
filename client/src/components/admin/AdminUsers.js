import React, { useEffect, useState } from 'react'
import API_ENDPOINTS from '../../config/api'

function AdminUsers () {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [blockId, setBlockId] = useState(null)
  const [blockLoading, setBlockLoading] = useState(false)
  const [blockError, setBlockError] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function fetchUsers () {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('adminToken')
    fetch(API_ENDPOINTS.ADMIN_USERS, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then(data => {
        setUsers(data.users || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function openViewModal (user) {
    setViewUser(user)
  }

  function openBlockModal (user) {
    setBlockId(user._id)
    setBlockError(null)
  }

  async function handleBlockUnblockUser (user) {
    setBlockLoading(true)
    setBlockError(null)
    const token = localStorage.getItem('adminToken')
    try {
      const endpoint = user.isBlocked ? 'unblock' : 'block'
      const res = await fetch(`${API_ENDPOINTS.ADMIN_USERS}/${user._id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update user status')
      setBlockId(null)
      fetchUsers()
    } catch (err) {
      setBlockError(err.message)
    } finally {
      setBlockLoading(false)
    }
  }

  async function handleDeleteUser () {
    setDeleteLoading(true)
    setDeleteError(null)
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN_USERS}/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete user')
      setDeleteId(null)
      fetchUsers()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-serif font-bold text-[#23233a]'>Users</h2>
      </div>
      {loading && <div className='text-gray-500'>Loading users...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      {!loading && !error && (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-[#FFD700] rounded-xl'>
            <thead>
              <tr className='bg-[#FFF8DC] text-[#23233a]'>
                <th className='py-3 px-4 text-left'>User ID</th>
                <th className='py-3 px-4 text-left'>Name</th>
                <th className='py-3 px-4 text-left'>Email</th>
                <th className='py-3 px-4 text-left'>Role</th>
                <th className='py-3 px-4 text-left'>Status</th>
                <th className='py-3 px-4 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className='border-t border-[#FFD700]'>
                  <td className='py-2 px-4'>{user._id}</td>
                  <td className='py-2 px-4'>{user.name || '-'}</td>
                  <td className='py-2 px-4'>{user.email}</td>
                  <td className='py-2 px-4'>{user.isAdmin ? 'Admin' : 'User'}</td>
                  <td className='py-2 px-4'>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td className='py-2 px-4'>
                    <button className='px-3 py-1 bg-[#5B4DB1] text-white rounded text-xs font-semibold mr-2' onClick={() => openViewModal(user)}>View</button>
                    <button className='px-3 py-1 bg-[#FFD700] text-white rounded text-xs font-semibold mr-2' onClick={() => openBlockModal(user)}>{user.isBlocked ? 'Unblock' : 'Block'}</button>
                    <button className='px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold' onClick={() => setDeleteId(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* View User Modal */}
      {viewUser && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-md flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setViewUser(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>User Details</h3>
            <div className='mb-2'><span className='font-semibold'>User ID:</span> {viewUser._id}</div>
            <div className='mb-2'><span className='font-semibold'>Name:</span> {viewUser.name || '-'}</div>
            <div className='mb-2'><span className='font-semibold'>Email:</span> {viewUser.email}</div>
            <div className='mb-2'><span className='font-semibold'>Role:</span> {viewUser.isAdmin ? 'Admin' : 'User'}</div>
            <div className='mb-2'><span className='font-semibold'>Status:</span> {viewUser.isBlocked ? 'Blocked' : 'Active'}</div>
            <div className='mb-2'><span className='font-semibold'>Created:</span> {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : ''}</div>
            <div className='mb-2'><span className='font-semibold'>Order Count:</span> {viewUser.orderCount ?? '-'}</div>
          </div>
        </div>
      )}
      {/* Block/Unblock User Modal */}
      {blockId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setBlockId(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Block/Unblock User</h3>
            <p>Are you sure you want to {users.find(u => u._id === blockId)?.isBlocked ? 'unblock' : 'block'} this user?</p>
            {blockError && <div className='text-red-500 text-center'>{blockError}</div>}
            <div className='flex gap-4 mt-2'>
              <button className='flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold' onClick={() => setBlockId(null)} disabled={blockLoading}>Cancel</button>
              <button className='flex-1 py-2 bg-[#FFD700] text-white rounded font-semibold' onClick={() => handleBlockUnblockUser(users.find(u => u._id === blockId))} disabled={blockLoading}>
                {blockLoading ? (users.find(u => u._id === blockId)?.isBlocked ? 'Unblocking...' : 'Blocking...') : (users.find(u => u._id === blockId)?.isBlocked ? 'Unblock' : 'Block')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white border border-[#FFD700] rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-4 relative'>
            <button type='button' className='absolute top-3 right-4 text-gray-400 hover:text-[#FFD700] text-2xl' onClick={() => setDeleteId(null)}>&times;</button>
            <h3 className='text-lg font-serif font-bold text-[#23233a] mb-2'>Delete User</h3>
            <p>Are you sure you want to delete this user?</p>
            {deleteError && <div className='text-red-500 text-center'>{deleteError}</div>}
            <div className='flex gap-4 mt-2'>
              <button className='flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold' onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button className='flex-1 py-2 bg-red-500 text-white rounded font-semibold' onClick={handleDeleteUser} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers 
