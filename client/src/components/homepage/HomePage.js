import React from 'react'
import HeroSection from './HeroSection'
import ZodiacFinder from './ZodiacFinder'
import FeaturedGemstones from './FeaturedGemstones'
import AstrologicalGuidance from './AstrologicalGuidance'
import CelestialInsights from './CelestialInsights'
import Newsletter from './Newsletter'
import Footer from './Footer'

function HomePage () {
  return (
    <div className='bg-gray-50 min-h-screen flex flex-col mb-1'>
      <div className='bg-gray-100'><HeroSection /></div>
      <div className='bg-gray-200 mb-1'><ZodiacFinder /></div>
      <div className='bg-gray-100 mb-1'><FeaturedGemstones /></div>
      <div className='bg-gray-200 mb-1'><AstrologicalGuidance /></div>
      <div className='bg-gray-100 mb-1'><CelestialInsights /></div>
      <div className='bg-gray-200'><Newsletter /></div>
      <Footer />
    </div>
  )
}

export default HomePage 