import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

function VideoRoom ({ roomUrl }) {
  useEffect(() => {
    window.location.href = roomUrl
  }, [roomUrl])

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#18181b',
    margin: 0,
    padding: 0
  }

  return (
    <div style={containerStyle}>
      <div style={{ color: '#fff', fontSize: 24, textAlign: 'center', width: '100%' }}>
        Redirecting you to the video room...<br />
        <a href={roomUrl} style={{ color: '#FFD700' }}>Click here if not redirected</a>
      </div>
    </div>
  )
}

VideoRoom.propTypes = {
  roomUrl: PropTypes.string.isRequired
}

export default VideoRoom 