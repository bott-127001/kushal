import React from 'react'
import styles from './ProfilePage.module.styl'

function ProfileHeader ({ user, onEditClick }) {
  const getMemberSince = () => {
    if (!user.createdAt) return ''
    const date = new Date(user.createdAt)
    return `Member since ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-4'>
        <div className='h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center'>
          <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
            <circle cx='12' cy='8' r='4' />
            <path d='M4 20c0-4 4-6 8-6s8 2 8 6' />
          </svg>
        </div>
        <div>
          <h1 className={styles.profileTitle + ' text-2xl'}>{user.name || 'User'}</h1>
          <p className={styles.profileLabel + ' text-sm'}>{getMemberSince()}</p>
        </div>
      </div>
      <button
        onClick={onEditClick}
        className='px-4 py-2 bg-[#5B4DB1] text-white text-sm font-semibold rounded-md hover:bg-[#4a3c9a] transition-colors'
      >
        Edit Profile
      </button>
    </div>
  )
}

export default ProfileHeader 