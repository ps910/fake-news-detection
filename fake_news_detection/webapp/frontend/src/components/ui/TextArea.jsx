import { forwardRef } from 'react'
import clsx from 'clsx'

const TextArea = forwardRef(({ 
  label, 
  error, 
  className = '',
  rows = 6,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'block w-full rounded-lg border transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'placeholder:text-gray-400 resize-none',
          'px-4 py-3',
          error 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-white hover:border-gray-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'

export default TextArea
