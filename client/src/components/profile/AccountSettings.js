import React from 'react'
import useAuth from '../../store/auth'
import styles from './ProfilePage.module.styl'

function AccountSettings ({ onChangePasswordClick, onNotificationClick, onDeleteAccountClick }) {
  const logout = useAuth(state => state.logout)

  const settings = [
    { name: 'Change Password', icon: 'settings', action: onChangePasswordClick },
    { name: 'Notification Preferences', icon: 'notifications', action: onNotificationClick },
    { name: 'Payment Methods', icon: 'payment', action: () => {} },
    { name: 'Delete Account', icon: 'delete', action: onDeleteAccountClick, isDestructive: true }
  ]

  return (
    <div>
      <h2 className={styles.profileTitle + ' mb-4'}>Account Settings</h2>
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='space-y-2'>
        {settings.map(item => (
          <button
            key={item.name}
            onClick={item.action}
            className={`w-full flex justify-between items-center p-3 text-sm rounded-md transition-colors text-left disabled:opacity-50 ${
              item.isDestructive ? 'text-red-700 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
            disabled={!item.action}
          >
            <div className='flex items-center space-x-3'>
              {/* Placeholder for icon */}
              <span className={item.isDestructive ? 'text-red-500' : 'text-gray-400'}>⚙️</span>
              <span>{item.name}</span>
            </div>
            <span className='text-gray-400'>&gt;</span>
          </button>
        ))}
      </div>
      <div className='mt-6'>
        <button
          onClick={logout}
          className={styles.profileButton + ' w-full flex justify-center items-center space-x-2'}
        >
          {/* Placeholder for icon */}
          <span>↪</span>
          <span>Logout</span>
        </button>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings 