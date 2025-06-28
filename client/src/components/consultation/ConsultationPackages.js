import React from 'react'
import PropTypes from 'prop-types'

const audioPackages = [
  { type: 'audio', mins: 10, price: 19.99, features: ['Personal Query', 'Quick Solutions'] },
  { type: 'audio', mins: 15, price: 29.99, features: ['Detailed Analysis', 'Multiple Questions'] },
  { type: 'audio', mins: 30, price: 49.99, features: ['Comprehensive Reading', 'Life Path Analysis'] }
]
const videoPackages = [
  { type: 'video', mins: 10, price: 29.99, features: ['Face-to-Face Interaction', 'Personal Query'] },
  { type: 'video', mins: 15, price: 39.99, features: ['Visual Chart Reading', 'Multiple Questions'] },
  { type: 'video', mins: 30, price: 69.99, features: ['Comprehensive Horoscope Analysis', 'Life Guidance'] }
]

function PackageCard ({ pkg, selected, onSelect }) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`relative group rounded-lg p-5 flex flex-col justify-between min-h-[120px] border-2 w-full text-left transition-all duration-300
        border-transparent bg-gradient-to-r from-[rgba(0,61,55,0.07)] to-[#f3f4f6]
        ${selected ? 'ring-2 ring-[#4286f4]' : ''}
      `}
      style={{ overflow: 'hidden' }}
    >
      <div className='relative z-10'>
        <div className='font-bold text-lg text-[#003D37]'>{pkg.mins} Minutes</div>
        <ul className='text-sm text-black mt-2 mb-3 list-disc list-inside'>
          {pkg.features.map(f => <li key={f}>{f}</li>)}
        </ul>
      </div>
      <div className='relative z-10 text-right font-bold text-gray-700 text-lg'>${pkg.price.toFixed(2)}</div>
    </button>
  )
}

PackageCard.propTypes = {
  pkg: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired
}

function ConsultationPackages ({ selectedPackage, setSelectedPackage }) {
  return (
    <section className='w-full max-w-5xl mx-auto py-10 px-4'>
      <h2 className='text-xl md:text-2xl font-serif font-bold text-center mb-8 text-black'>Choose Your Consultation Package</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <h3 className='font-bold text-black mb-4 text-lg text-center md:text-center'>Audio Call Packages</h3>
          <div className='flex flex-col gap-4'>
            {audioPackages.map(pkg => (
              <PackageCard
                key={pkg.mins}
                pkg={pkg}
                selected={selectedPackage && selectedPackage.type === 'audio' && selectedPackage.mins === pkg.mins}
                onSelect={() => setSelectedPackage(pkg)}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className='font-bold text-black mb-4 text-lg text-center md:text-center'>Video Call Packages</h3>
          <div className='flex flex-col gap-4'>
            {videoPackages.map(pkg => (
              <PackageCard
                key={pkg.mins}
                pkg={pkg}
                selected={selectedPackage && selectedPackage.type === 'video' && selectedPackage.mins === pkg.mins}
                onSelect={() => setSelectedPackage(pkg)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

ConsultationPackages.propTypes = {
  selectedPackage: PropTypes.object,
  setSelectedPackage: PropTypes.func.isRequired
}

export default ConsultationPackages 