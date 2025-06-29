import React, { useState, useEffect } from 'react'
import useAuth from '../../store/auth'
import PropTypes from 'prop-types'
import API_ENDPOINTS from '../../config/api'

const allSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM'
]

function ConsultationBookingForm ({ selectedPackage }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    dob: '',
    tob: '',
    pob: '',
    package: '',
    date: '',
    slot: '',
    questions: ''
  })
  const [availableSlots, setAvailableSlots] = useState(allSlots)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isConsultationBlocked, setIsConsultationBlocked] = useState(false)
  const [blockMsg, setBlockMsg] = useState('')

  useEffect(() => {
    fetch(API_ENDPOINTS.SETTINGS)
      .then(res => res.json())
      .then(data => {
        setIsConsultationBlocked(!!data.isConsultationBlocked)
        setBlockMsg(data.isConsultationBlocked ? 'Consultations are temporarily unavailable. Please try again later.' : '')
      })
      .catch(() => setIsConsultationBlocked(false))
  }, [])

  useEffect(() => {
    setForm(f => ({
      ...f,
      package: selectedPackage ? `${selectedPackage.type === 'audio' ? 'Audio Call' : 'Video Call'} - ${selectedPackage.mins} Minutes` : ''
    }))
  }, [selectedPackage])

  useEffect(() => {
    if (!form.date) return setAvailableSlots(allSlots)
    setAvailableSlots([])
    fetch(`${API_ENDPOINTS.CONSULTATION_SLOTS}?date=${form.date}`)
      .then(res => res.json())
      .then(data => {
        let slots = data.availableSlots || allSlots
        // If selected date is today, filter out past slots
        const today = new Date()
        const selectedDate = new Date(form.date)
        if (
          today.getFullYear() === selectedDate.getFullYear() &&
          today.getMonth() === selectedDate.getMonth() &&
          today.getDate() === selectedDate.getDate()
        ) {
          const now = today
          slots = slots.filter(slot => {
            // Parse slot time (e.g., '04:00 PM')
            const [time, modifier] = slot.split(' ')
            let [hours, minutes] = time.split(':').map(Number)
            if (modifier === 'PM' && hours !== 12) hours += 12
            if (modifier === 'AM' && hours === 12) hours = 0
            const slotDate = new Date(selectedDate)
            slotDate.setHours(hours, minutes, 0, 0)
            return slotDate > now
          })
        }
        setAvailableSlots(slots)
      })
      .catch(() => setAvailableSlots(allSlots))
  }, [form.date])

  function handleChange (e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!form.dob || !form.tob || !form.pob || !form.package || !form.date || !form.slot) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      if (isConsultationBlocked) {
        setError('Consultations are temporarily unavailable. Please try again later.')
        setLoading(false)
        return
      }
      const res = await fetch(API_ENDPOINTS.CONSULTATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      let errorData = null
      if (!res.ok) {
        try {
          errorData = await res.json()
        } catch (e) {}
        setError((errorData && errorData.error) || 'Booking failed. Please try another slot.')
        setLoading(false)
        return
      }
      setSuccess(true)
      setForm({ dob: '', tob: '', pob: '', package: '', date: '', slot: '', questions: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='w-full flex justify-center py-12 bg-[#f6f8fa]'>
      <form className='bg-white border border-[#003D37] rounded-xl shadow p-8 max-w-md w-full flex flex-col gap-4' onSubmit={handleSubmit} autoComplete='off'>
        <h3 className='text-xl font-serif font-bold text-center mb-4 text-black'>Book Your Consultation</h3>
        {isConsultationBlocked && (
          <div className='text-red-500 text-center font-semibold mb-4'>{blockMsg}</div>
        )}
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-left mb-1' htmlFor='dob'>Date of Birth</label>
          <input id='dob' type='date' name='dob' placeholder='Birth Date' className='border border-gray-300 rounded px-3 py-2' value={form.dob} onChange={handleChange} required disabled={isConsultationBlocked} />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-left mb-1' htmlFor='tob'>Time of Birth</label>
          <input id='tob' type='time' name='tob' placeholder='Time of Birth' className='border border-gray-300 rounded px-3 py-2' value={form.tob} onChange={handleChange} required disabled={isConsultationBlocked} />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-left mb-1' htmlFor='pob'>Place of Birth</label>
          <input id='pob' type='text' name='pob' placeholder='Place of Birth' className='border border-gray-300 rounded px-3 py-2' value={form.pob} onChange={handleChange} required disabled={isConsultationBlocked} />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-left mb-1' htmlFor='package'>Consultation Package</label>
          <select id='package' name='package' className='border border-gray-300 rounded px-3 py-2' value={form.package} onChange={handleChange} required disabled={isConsultationBlocked}>
            <option value=''>Choose your package</option>
            <option value='Audio Call - 10 Minutes'>Audio Call - 10 Minutes</option>
            <option value='Audio Call - 15 Minutes'>Audio Call - 15 Minutes</option>
            <option value='Audio Call - 30 Minutes'>Audio Call - 30 Minutes</option>
            <option value='Video Call - 10 Minutes'>Video Call - 10 Minutes</option>
            <option value='Video Call - 15 Minutes'>Video Call - 15 Minutes</option>
            <option value='Video Call - 30 Minutes'>Video Call - 30 Minutes</option>
            <option value='06:00 PM'>06:00 PM</option>
            <option value='07:00 PM'>07:00 PM</option>
            <option value='08:00 PM'>08:00 PM</option>
          </select>
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-left mb-1' htmlFor='date'>Consultation Date (Time Slot Date)</label>
          <input id='date' type='date' name='date' placeholder='Time Slot Date' className='border border-gray-300 rounded px-3 py-2' value={form.date} onChange={handleChange} required disabled={isConsultationBlocked} />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-semibold text-left mb-1' htmlFor='slot'>Time Slot</label>
          <select id='slot' name='slot' className='border border-gray-300 rounded px-3 py-2' value={form.slot} onChange={handleChange} required disabled={isConsultationBlocked}>
            <option value=''>Select time slot</option>
            {availableSlots.map(slot => (
              <option key={slot} value={slot} disabled={availableSlots.length === 0}>{slot}</option>
            ))}
          </select>
        </div>
        <textarea name='questions' placeholder='Please describe your questions or concerns...' className='border border-gray-300 rounded px-3 py-2 min-h-[60px]' value={form.questions} onChange={handleChange} disabled={isConsultationBlocked} />
        {error && <div className='text-red-500'>{error}</div>}
        {success && <div className='text-green-600'>Booking successful! You will receive a confirmation email.</div>}
        <button type='submit' className='w-full py-3 bg-[#003D37] text-white font-serif rounded transition hover:brightness-110 mt-2' disabled={loading || isConsultationBlocked}>{loading ? 'Booking...' : 'Book Consultation'}</button>
      </form>
    </section>
  )
}

ConsultationBookingForm.propTypes = {
  selectedPackage: PropTypes.object
}

export default ConsultationBookingForm 
