import React from 'react'
import styles from './ProfilePage.module.styl'

function InfoField ({ label, value }) {
  return (
    <div>
      <h3 className={styles.profileLabel}>{label}</h3>
      <p className={styles.profileValue}>{value || '-'}</p>
    </div>
  )
}

function PersonalInformation ({ user }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const userInfo = {
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    birthDate: formatDate(user.birthDate),
    zodiacSign: user.zodiacSign,
    location: user.location
  }

  return (
    <div>
      <h2 className={styles.profileTitle + ' mb-4'}>Personal Information</h2>
      <div className='grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4'>
        <InfoField label='Full Name' value={userInfo.fullName} />
        <InfoField label='Email' value={userInfo.email} />
        <InfoField label='Phone' value={userInfo.phone} />
        <InfoField label='Birth Date' value={userInfo.birthDate} />
        <InfoField label='Zodiac Sign' value={userInfo.zodiacSign} />
        <InfoField label='Location' value={userInfo.location} />
      </div>
    </div>
  )
}

export default PersonalInformation 