import React from 'react'

const FILTERS = {
  categories: ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Malas'],
  price: ['Under $500', '$500 - $1000', '$1000 - $5000', 'Above $5000'],
  materials: ['Gold', 'Silver', 'Platinum'],
  style: ['Classic', 'Modern', 'Vintage', 'Contemporary']
}

function Filters ({ selectedFilters, onChange }) {
  function handleCheckbox (section, value) {
    const current = selectedFilters[section] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...selectedFilters, [section]: updated })
  }

  return (
    <aside className='w-full md:w-64 bg-white rounded-xl shadow p-6 border border-gray-200'>
      <h3 className='font-bold text-lg mb-4'>Filters</h3>
      <div className='mb-6'>
        <div className='font-semibold mb-2'>Categories</div>
        <div className='space-y-1'>
          {FILTERS.categories.map(option => {
            const checked = selectedFilters.categories?.includes(option) || false
            return (
              <label
                key={option}
                className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition-all duration-200
                  ${checked ? 'bg-gray-100 border border-[#003D37]' : 'border border-transparent'}
                  hover:shadow-md hover:border-[#003D37]/60`}
              >
                <input
                  type='checkbox'
                  className='accent-[#003D37] w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-[#003D37] transition'
                  checked={checked}
                  onChange={() => handleCheckbox('categories', option)}
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            )
          })}
        </div>
      </div>
      <div className='mb-6'>
        <div className='font-semibold mb-2'>Price Range</div>
        <div className='space-y-1'>
          {FILTERS.price.map(option => {
            const checked = selectedFilters.price?.includes(option) || false
            return (
              <label
                key={option}
                className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition-all duration-200
                  ${checked ? 'bg-gray-100 border border-[#003D37]' : 'border border-transparent'}
                  hover:shadow-md hover:border-[#003D37]/60`}
              >
                <input
                  type='checkbox'
                  className='accent-[#003D37] w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-[#003D37] transition'
                  checked={checked}
                  onChange={() => handleCheckbox('price', option)}
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            )
          })}
        </div>
      </div>
      <div className='mb-6'>
        <div className='font-semibold mb-2'>Materials</div>
        <div className='space-y-1'>
          {FILTERS.materials.map(option => {
            const checked = selectedFilters.materials?.includes(option) || false
            return (
              <label
                key={option}
                className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition-all duration-200
                  ${checked ? 'bg-gray-100 border border-[#003D37]' : 'border border-transparent'}
                  hover:shadow-md hover:border-[#003D37]/60`}
              >
                <input
                  type='checkbox'
                  className='accent-[#003D37] w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-[#003D37] transition'
                  checked={checked}
                  onChange={() => handleCheckbox('materials', option)}
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            )
          })}
        </div>
      </div>
      <div>
        <div className='font-semibold mb-2'>Style</div>
        <div className='space-y-1'>
          {FILTERS.style.map(option => {
            const checked = selectedFilters.style?.includes(option) || false
            return (
              <label
                key={option}
                className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition-all duration-200
                  ${checked ? 'bg-gray-100 border border-[#003D37]' : 'border border-transparent'}
                  hover:shadow-md hover:border-[#003D37]/60`}
              >
                <input
                  type='checkbox'
                  className='accent-[#003D37] w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-[#003D37] transition'
                  checked={checked}
                  onChange={() => handleCheckbox('style', option)}
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default Filters 