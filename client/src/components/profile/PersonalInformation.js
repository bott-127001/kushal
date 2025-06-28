import React from 'react'

function InfoField ({ label, value }) {
  return (
    <div>
      <h3 className='text-sm font-medium text-gray-500'>{label}</h3>
      <p className='mt-1 text-sm text-gray-900'>{value || '-'}</p>
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
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>Personal Information</h2>
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