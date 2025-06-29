import React, { useState } from 'react'

const FILTERS = {
  categories: ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Malas'],
  price: ['Under $500', '$500 - $1000', '$1000 - $5000', 'Above $5000'],
  materials: ['Gold', 'Silver', 'Platinum'],
  style: ['Classic', 'Modern', 'Vintage', 'Contemporary']
}

function Filters ({ selectedFilters, onChange }) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  function handleCheckbox (section, value) {
    const current = selectedFilters[section] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...selectedFilters, [section]: updated })
  }

  const FilterSection = ({ title, options, section }) => (
    <div className='mb-2 md:mb-6'>
      <div className='font-semibold mb-1 md:mb-2 text-xs md:text-base'>{title}</div>
      <div className='space-y-1'>
        {options.map(option => {
          const checked = selectedFilters[section]?.includes(option) || false
          return (
            <label
              key={option}
              className={`flex items-center gap-2 cursor-pointer rounded-lg px-1.5 md:px-2 py-1 transition-all duration-200 text-xs md:text-base
                ${checked ? 'bg-gray-100 border border-[#003D37]' : 'border border-transparent'}
                hover:shadow-md hover:border-[#003D37]/60`}
            >
              <input
                type='checkbox'
                className='accent-[#003D37] w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 focus:ring-2 focus:ring-[#003D37] transition'
                checked={checked}
                onChange={() => handleCheckbox(section, option)}
              />
              <span className='text-gray-700'>{option}</span>
            </label>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className='md:hidden mb-2'>
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className='w-full flex items-center justify-between px-2 py-2 bg-white rounded-lg shadow border border-gray-200 text-left text-xs font-semibold'
        >
          <span>Filters</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </button>
      </div>

      {/* Mobile Filters Panel */}
      <div className={`md:hidden ${isMobileFiltersOpen ? 'block' : 'hidden'} mb-2`}>
        <div className='bg-white rounded-lg shadow border border-gray-200 p-2'>
          <FilterSection title='Categories' options={FILTERS.categories} section='categories' />
          <FilterSection title='Price Range' options={FILTERS.price} section='price' />
          <FilterSection title='Materials' options={FILTERS.materials} section='materials' />
          <FilterSection title='Style' options={FILTERS.style} section='style' />
        </div>
      </div>

      {/* Desktop Filters */}
      <aside className='hidden md:block w-full md:w-64 bg-white rounded-xl shadow p-4 md:p-6 border border-gray-200'>
        <h3 className='font-bold text-lg mb-4'>Filters</h3>
        <FilterSection title='Categories' options={FILTERS.categories} section='categories' />
        <FilterSection title='Price Range' options={FILTERS.price} section='price' />
        <FilterSection title='Materials' options={FILTERS.materials} section='materials' />
        <FilterSection title='Style' options={FILTERS.style} section='style' />
      </aside>
    </>
  )
}

export default Filters 