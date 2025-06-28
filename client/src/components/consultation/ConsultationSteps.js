import React from 'react'

const steps = [
  { icon: '⭐', title: 'Choose Package', desc: 'Select your preferred consultation package' },
  { icon: '📝', title: 'Fill Details', desc: 'Complete the booking form with your information' },
  { icon: '⏰', title: 'Select Time', desc: 'Pick your consultation date and time slot' },
  { icon: '✅', title: 'Confirm Booking', desc: 'Complete secure payment and confirm booking' }
]

function ConsultationSteps () {
  return (
    <section className='w-full py-10 bg-[#e5e7eb]'>
      <div className='w-full rounded-xl px-0 py-8'>
        <h3 className='text-lg md:text-xl font-serif font-bold text-center mb-8 text-black'>Simple Steps to Book Your Consultation</h3>
        <div className='flex flex-col md:flex-row justify-center items-center gap-8'>
          {steps.map(step => (
            <div key={step.title} className='flex flex-col items-center text-center'>
              <div className='w-14 h-14 flex items-center justify-center rounded-full bg-[#003D37] bg-opacity-10 text-2xl mb-3 text-[#003D37]'>{step.icon}</div>
              <div className='font-bold text-[#003D37] mb-1'>{step.title}</div>
              <div className='text-gray-600 text-sm'>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ConsultationSteps 