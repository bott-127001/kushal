import React from 'react'

function AuthPromptModal ({ open, onClose, onConfirm, message }) {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-500'>
      <div className='bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center max-h-[90vh] overflow-auto transform transition-all duration-500 scale-95 opacity-0 animate-fadeInModal'>
        <div className='text-lg font-semibold mb-4 text-[#18182a]'>{message || 'You must be logged in to perform this action.'}</div>
        <div className='flex justify-center gap-4'>
          <button
            className='px-6 py-2 bg-[#D4AF37] text-white rounded font-semibold hover:brightness-110 transition'
            onClick={onConfirm}
          >
            Go to Login
          </button>
          <button
            className='px-6 py-2 bg-gray-200 text-[#18182a] rounded font-semibold hover:bg-gray-300 transition'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInModal {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInModal {
          animation: fadeInModal 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
    </div>
  )
}

export default AuthPromptModal 