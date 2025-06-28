import React, { useState, useEffect } from 'react'
import Footer from '../homepage/Footer'
import ConsultationHero from './ConsultationHero'
import ConsultationPackages from './ConsultationPackages'
import ConsultationSteps from './ConsultationSteps'
import ConsultationBookingForm from './ConsultationBookingForm'
import styles from './Consultation.module.styl'
import useAuth from '../../store/auth'
import { useNavigate } from 'react-router-dom'

function ConsultationPage () {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [selectedPackage, setSelectedPackage] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className='bg-[#f6f8fa] min-h-screen flex flex-col'>
      <main className='flex-grow'>
        <ConsultationHero />
        <ConsultationPackages selectedPackage={selectedPackage} setSelectedPackage={setSelectedPackage} />
        <ConsultationSteps />
        <ConsultationBookingForm selectedPackage={selectedPackage} />
      </main>
      <Footer />
    </div>
  )
}

export default ConsultationPage 