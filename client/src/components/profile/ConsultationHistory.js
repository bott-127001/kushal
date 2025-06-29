import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../store/auth'
import API_ENDPOINTS from '../../config/api'

function StatusBadge ({ isUpcoming }) {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full'
  const statusClasses = isUpcoming
    ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-800'
  return <span className={`${baseClasses} ${statusClasses}`}>{isUpcoming ? 'Upcoming' : 'Past'}</span>
}

function ConsultationHistory () {
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const tabs = ['Upcoming', 'Past Sessions']
  const [showPopup, setShowPopup] = useState(false)
  const [popupTime, setPopupTime] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [showCancelPopup, setShowCancelPopup] = useState(false)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CONSULTATIONS, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch consultations')
        }
        const data = await response.json()
        setConsultations(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchConsultations()
    } else {
      setLoading(false)
    }
  }, [token])

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of today for accurate comparison

  const filteredConsultations = consultations.filter(c => {
    // Combine date and slot to get the full datetime
    const consultationDateTime = new Date(`${c.date} ${c.slot}`)
    // Fallback: if slot is missing, just use date
    const compareTime = isNaN(consultationDateTime) ? new Date(c.date) : consultationDateTime
    if (activeTab === 'Upcoming') return compareTime >= new Date()
    if (activeTab === 'Past Sessions') return compareTime < new Date()
    return false
  })

  function handleJoinCall (consultation) {
    const now = new Date()
    const accessTime = consultation.accessTime ? new Date(consultation.accessTime) : null
    if (accessTime && now < accessTime) {
      setPopupTime(accessTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }))
      setShowPopup(true)
    } else {
      window.location.href = consultation.roomUrl
    }
  }

  function canCancel(consultation) {
    const now = new Date()
    const { slot, date } = consultation
    if (!slot || !date) return false
    const [time, modifier] = slot.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier === 'PM' && hours !== 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    const slotDateTime = new Date(date)
    slotDateTime.setHours(hours, minutes, 0, 0)
    const diffMs = slotDateTime - now
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours >= 12
  }

  async function handleCancel(consultation) {
    setCancelError('')
    if (!canCancel(consultation)) {
      setShowCancelPopup(true)
      return
    }
    try {
      const res = await fetch(API_ENDPOINTS.CONSULTATION_DETAILS(consultation._id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const data = await res.json()
        setCancelError(data.error || 'Failed to cancel booking')
        return
      }
      setConsultations(cs => cs.filter(c => c._id !== consultation._id))
    } catch (err) {
      setCancelError('Failed to cancel booking')
    }
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Consultation History</h2>
        <div className='flex space-x-1 bg-gray-100 p-1 rounded-md'>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className='space-y-4'>
        {loading && <p>Loading consultations...</p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && filteredConsultations.map(consultation => {
          const isUpcoming = new Date(consultation.date) >= today
          return (
            <div key={consultation._id} className='border border-gray-200 rounded-lg p-4'>
              <div className='flex justify-between items-start'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-gray-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800'>{consultation.name}</p>
                    <p className='text-sm text-gray-500'>{consultation.package}</p>
                  </div>
                </div>
                <StatusBadge isUpcoming={isUpcoming} />
              </div>
              <div className='mt-3 flex items-center space-x-4 text-sm text-gray-600 pl-13'>
                  <span>{new Date(consultation.date).toLocaleDateString()}</span>
                  <span>{consultation.slot}</span>
              </div>
              {isUpcoming && consultation.roomUrl && (
                <div className='mt-4 pl-13 flex flex-row gap-3'>
                  <button
                    onClick={() => handleJoinCall(consultation)}
                    className='w-full block px-4 py-2 bg-[#5B4DB1] text-white text-sm font-semibold rounded-md hover:bg-[#4a3c9a] transition-colors text-center'
                  >
                    Join Call
                  </button>
                  <button
                    onClick={() => handleCancel(consultation)}
                    className='w-full block px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600 transition-colors text-center'
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {!loading && !error && filteredConsultations.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            No sessions found in this category.
          </div>
        )}
      </div>
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#222',
            color: '#fff',
            padding: '32px 40px',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: 400
          }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>
              Access to the video room will be available at<br />
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{popupTime}</span>.
            </div>
            <div style={{ fontSize: 18 }}>Please return closer to your scheduled time.</div>
            <button onClick={() => setShowPopup(false)} style={{ marginTop: 24, background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>
      )}
      {showCancelPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#222',
            color: '#fff',
            padding: '32px 40px',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: 400
          }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>
              You can only cancel a booking at least 12 hours before the meeting time.
            </div>
            <button onClick={() => setShowCancelPopup(false)} style={{ marginTop: 24, background: '#FFD700', color: '#222', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>
      )}
      {cancelError && (
        <div className='text-red-500 text-center mt-4'>{cancelError}</div>
      )}
    </div>
  )
}

export default ConsultationHistory 