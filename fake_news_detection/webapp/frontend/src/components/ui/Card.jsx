import clsx from 'clsx'

function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors',
        hover && 'card-hover cursor-pointer hover:border-gray-200 dark:hover:border-gray-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-100 dark:border-gray-700', className)}>
      {children}
    </div>
  )
}

function CardBody({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl', className)}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
