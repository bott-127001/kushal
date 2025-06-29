import React, { useState, useEffect } from 'react'
import Footer from '../homepage/Footer'
import ProfileHeader from './ProfileHeader'
import PersonalInformation from './PersonalInformation'
import OrderHistory from './OrderHistory'
import ConsultationHistory from './ConsultationHistory'
import AccountSettings from './AccountSettings'
import EditProfileModal from './EditProfileModal'
import ChangePasswordModal from './ChangePasswordModal'
import NotificationPreferencesModal from './NotificationPreferencesModal'
import DeleteAccountModal from './DeleteAccountModal'
import useAuth from '../../store/auth'
import { useNavigate } from 'react-router-dom'
import styles from './ProfilePage.module.styl'

function ProfilePage () {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setUser(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
      // Handle case where user is not authenticated
    }
  }, [token])

  const handleSaveProfile = async (formData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (err) {
      // Re-throw the error to be caught by the modal's submit handler
      throw err
    }
  }

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change password')
      }

      // No need to update user state, just close modal on success
    } catch (err) {
      throw err
    }
  }

  const handleSaveNotificationPreferences = async (preferences) => {
    try {
      const response = await fetch('/api/account/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update preferences')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteAccount = async (password) => {
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      logout()
      navigate('/')
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return <div>Loading...</div> // Or a proper loading spinner
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) {
    return <div>Please log in to see your profile.</div>
  }

  return (
    <div className='flex flex-col min-h-screen w-full' style={{ background: '#e6f4ea' }}>
      <main className='flex-1 w-full max-w-4xl mx-auto py-6 px-2 sm:py-12 sm:px-4 lg:px-8'>
        <div className='space-y-10'>
          <div className={styles.profileSection}>
          <ProfileHeader user={user} onEditClick={() => setIsEditModalOpen(true)} />
          </div>
          <div className={styles.profileSection}>
          <PersonalInformation user={user} />
          </div>
          <div className={styles.profileSection}>
          <OrderHistory />
          </div>
          <div className={styles.profileSection}>
          <ConsultationHistory />
          </div>
          <div className={styles.profileSection}>
          <AccountSettings
            onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
            onNotificationClick={() => setIsNotificationModalOpen(true)}
            onDeleteAccountClick={() => setIsDeleteModalOpen(true)}
          />
          </div>
        </div>
      </main>
      <Footer />
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordModalOpen(false)}
          onSave={handleChangePassword}
        />
      )}
      {isNotificationModalOpen && (
        <NotificationPreferencesModal
          user={user}
          onClose={() => setIsNotificationModalOpen(false)}
          onSave={handleSaveNotificationPreferences}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteAccountModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  )
}

export default ProfilePage 