import clsx from 'clsx'
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react'

function ResultBadge({ prediction, confidence, size = 'md' }) {
  const isReal = prediction.toLowerCase() === 'real'
  const confidencePercent = Math.round(confidence * 100)

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const Icon = isReal ? CheckCircle : XCircle

  return (
    <div className={clsx(
      'inline-flex items-center space-x-1.5 rounded-full font-medium',
      sizes[size],
      isReal 
        ? 'bg-real-light text-real-dark' 
        : 'bg-fake-light text-fake-dark'
    )}>
      <Icon className={clsx(
        size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      <span>{prediction}</span>
      <span className="opacity-75">({confidencePercent}%)</span>
    </div>
  )
}

function ConfidenceBar({ confidence, prediction }) {
  const isReal = prediction.toLowerCase() === 'real'
  const percent = Math.round(confidence * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Confidence</span>
        <span className={clsx(
          'text-sm font-bold',
          isReal ? 'text-real-dark' : 'text-fake-dark'
        )}>
          {percent}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            isReal ? 'bg-real' : 'bg-fake'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}

function ConfidenceIndicator({ confidence }) {
  let level, color, icon
  
  if (confidence >= 0.9) {
    level = 'High Confidence'
    color = 'text-green-600'
    icon = CheckCircle
  } else if (confidence >= 0.7) {
    level = 'Medium Confidence'
    color = 'text-yellow-600'
    icon = AlertCircle
  } else {
    level = 'Low Confidence'
    color = 'text-red-600'
    icon = HelpCircle
  }

  const Icon = icon

  return (
    <div className={clsx('flex items-center space-x-1', color)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{level}</span>
    </div>
  )
}

export { ResultBadge, ConfidenceBar, ConfidenceIndicator }
