import React, { useState } from 'react'
import styles from './ProfilePage.module.styl'

function ChangePasswordModal ({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await onSave(formData.currentPassword, formData.newPassword)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Change Password</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='currentPassword' className='block text-sm font-medium text-gray-700'>Current Password</label>
              <input type='password' name='currentPassword' id='currentPassword' value={formData.currentPassword} onChange={handleChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
            <div>
              <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>New Password</label>
              <input type='password' name='newPassword' id='newPassword' value={formData.newPassword} onChange={handleChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>Confirm New Password</label>
              <input type='password' name='confirmPassword' id='confirmPassword' value={formData.confirmPassword} onChange={handleChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
          </div>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
          {success && <p className='mt-2 text-sm text-green-600'>Password changed successfully!</p>}
          <div className='mt-6 flex justify-end space-x-3'>
            <button type='button' onClick={onClose} className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
              Cancel
            </button>
            <button type='submit' disabled={loading || success} className={styles.profileButton + ' inline-flex justify-center py-2 px-4 text-sm'}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordModal 