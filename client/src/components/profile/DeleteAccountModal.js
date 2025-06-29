import React, { useState } from 'react'

function DeleteAccountModal ({ onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onConfirm(password)
      // The parent component will handle closing and redirecting
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please check your password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-bold text-red-600'>Delete Account</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>&times;</button>
        </div>
        <p className='text-sm text-gray-700 mb-4'>
          This action is permanent and cannot be undone. All your data, including order history and consultations, will be permanently deleted.
        </p>
        <p className='text-sm text-gray-700 mb-4'>
          Please enter your password to confirm.
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor='password' className='sr-only'>Password</label>
            <input
              type='password'
              name='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm'
              placeholder='Enter your password'
            />
          </div>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
          <div className='mt-6 flex justify-end space-x-3'>
            <button type='button' onClick={onClose} className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'>
              Cancel
            </button>
            <button type='submit' disabled={loading} className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'>
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteAccountModal 