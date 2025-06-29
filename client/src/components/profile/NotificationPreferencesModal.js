import React, { useState, useEffect } from 'react'
import styles from './ProfilePage.module.styl'

const Toggle = ({ label, enabled, onToggle }) => (
  <div className='flex items-center justify-between'>
    <span className='text-sm text-gray-700'>{label}</span>
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        enabled ? 'bg-[#5B4DB1]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

function NotificationPreferencesModal ({ user, onClose, onSave }) {
  const [preferences, setPreferences] = useState({
    promotions: true,
    orderUpdates: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && user.notificationPreferences) {
      setPreferences(user.notificationPreferences)
    }
  }, [user])

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave(preferences)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save preferences.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Notification Preferences</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <Toggle label='Receive emails about promotions and news.' enabled={preferences.promotions} onToggle={() => handleToggle('promotions')} />
            <Toggle label='Receive email updates about your orders.' enabled={preferences.orderUpdates} onToggle={() => handleToggle('orderUpdates')} />
          </div>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
          <div className='mt-6 flex justify-end space-x-3'>
            <button type='button' onClick={onClose} className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'>Cancel</button>
            <button type='submit' disabled={loading} className={styles.profileButton + ' inline-flex justify-center py-2 px-4 text-sm'}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotificationPreferencesModal 