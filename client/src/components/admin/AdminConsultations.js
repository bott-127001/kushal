import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function AdminConsultations () {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Upcoming')

  function fetchConsultations () {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('adminToken')
    fetch('/api/consultations/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch consultations')
        return res.json()
      })
      .then(data => {
        setConsultations(data.consultations || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchConsultations()
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Sort consultations by date and time, upcoming first
  const sortedConsultations = consultations.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.slot}`)
    const dateB = new Date(`${b.date} ${b.slot}`)
    return dateA - dateB
  })

  const filteredConsultations = sortedConsultations.filter(c => {
    const consultationDateTime = new Date(`${c.date} ${c.slot}`)
    const compareTime = isNaN(consultationDateTime) ? new Date(c.date) : consultationDateTime
    if (activeTab === 'Upcoming') return compareTime >= new Date()
    if (activeTab === 'Past') return compareTime < new Date()
    return false
  })

  function StatusBadge ({ isUpcoming }) {
    const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full'
    const statusClasses = isUpcoming
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
    return <span className={`${baseClasses} ${statusClasses}`}>{isUpcoming ? 'Upcoming' : 'Past'}</span>
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-serif font-bold text-[#23233a]'>Consultations</h2>
        <div className='flex space-x-1 bg-gray-100 p-1 rounded-md'>
          {['Upcoming', 'Past'].map(tab => (
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
      
      {loading && <div className='text-gray-500'>Loading...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      
      {!loading && !error && (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-[#FFD700] rounded-xl'>
            <thead>
              <tr className='bg-[#FFF8DC] text-[#23233a]'>
                <th className='py-3 px-4 text-left'>Status</th>
                <th className='py-3 px-4 text-left'>User Name</th>
                <th className='py-3 px-4 text-left'>Email</th>
                <th className='py-3 px-4 text-left'>Package</th>
                <th className='py-3 px-4 text-left'>Date</th>
                <th className='py-3 px-4 text-left'>Time</th>
                <th className='py-3 px-4 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.map(consult => {
                const isUpcoming = new Date(consult.date) >= today
                return (
                  <tr key={consult._id} className='border-t border-[#FFD700] hover:bg-gray-50'>
                    <td className='py-2 px-4'>
                      <StatusBadge isUpcoming={isUpcoming} />
                    </td>
                    <td className='py-2 px-4 font-medium'>{consult.name}</td>
                    <td className='py-2 px-4'>{consult.email}</td>
                    <td className='py-2 px-4'>{consult.package}</td>
                    <td className='py-2 px-4'>{new Date(consult.date).toLocaleDateString()}</td>
                    <td className='py-2 px-4'>{consult.slot}</td>
                    <td className='py-2 px-4'>
                      {isUpcoming && consult.roomUrl && (
                        <Link
                          to={`/video-room/${consult._id}`}
                          className='inline-block px-3 py-1 bg-[#5B4DB1] text-white text-xs font-semibold rounded-md hover:bg-[#4a3c9a] transition-colors'
                        >
                          Join Call
                        </Link>
                      )}
                      {isUpcoming && !consult.roomUrl && (
                        <span className='text-xs text-gray-500'>No link</span>
                      )}
                      {!isUpcoming && (
                        <span className='text-xs text-gray-500'>Completed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredConsultations.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              No {activeTab.toLowerCase()} consultations found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminConsultations 
