import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function VideoRoomPage () {
  const { consultationId } = useParams()
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/consultations/${consultationId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if needed
        ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch consultation')
        return res.json()
      })
      .then(data => {
        setConsultation(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [consultationId])

  useEffect(() => {
    if (!consultation) return
    const now = new Date()
    const accessTime = consultation.accessTime ? new Date(consultation.accessTime) : null
    if (accessTime && now < accessTime) {
      setShowPopup(true)
    } else if (consultation.roomUrl) {
      window.location.href = consultation.roomUrl
    }
  }, [consultation])

  if (loading) return <div style={{ color: '#fff', fontSize: 24, textAlign: 'center', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>Loading video room...</div>
  if (error) return <div style={{ color: '#fff', fontSize: 24, textAlign: 'center', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>{error}</div>
  if (!consultation.roomUrl) return <div style={{ color: '#fff', fontSize: 24, textAlign: 'center', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>No video room available for this consultation.</div>

  // Popup/modal for access time
  return (
    <>
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
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                {consultation.accessTime ? new Date(consultation.accessTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}
              </span>
              .
            </div>
            <div style={{ fontSize: 18 }}>Please return closer to your scheduled time.</div>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoRoomPage 