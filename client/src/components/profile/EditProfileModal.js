import React, { useState, useEffect } from 'react'
import styles from './ProfilePage.module.styl'

function EditProfileModal ({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    zodiacSign: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        zodiacSign: user.zodiacSign || '',
        location: user.location || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Edit Profile</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700'>Full Name</label>
              <input type='text' name='name' id='name' value={formData.name} onChange={handleChange} className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>Phone</label>
              <input type='text' name='phone' id='phone' value={formData.phone} onChange={handleChange} className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
            <div>
              <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700'>Birth Date</label>
              <input type='date' name='birthDate' id='birthDate' value={formData.birthDate} onChange={handleChange} className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
            <div>
              <label htmlFor='zodiacSign' className='block text-sm font-medium text-gray-700'>Zodiac Sign</label>
              <input type='text' name='zodiacSign' id='zodiacSign' value={formData.zodiacSign} onChange={handleChange} className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
            <div>
              <label htmlFor='location' className='block text-sm font-medium text-gray-700'>Location</label>
              <input type='text' name='location' id='location' value={formData.location} onChange={handleChange} className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#5B4DB1] focus:border-[#5B4DB1] sm:text-sm' />
            </div>
          </div>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
          <div className='mt-6 flex justify-end space-x-3'>
            <button type='button' onClick={onClose} className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
              Cancel
            </button>
            <button type='submit' disabled={loading} className={styles.profileButton + ' inline-flex justify-center py-2 px-4 text-sm'}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal 