import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import clsx from 'clsx'

const themes = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'system', icon: Monitor, label: 'System' }
]

function ThemeToggle({ variant = 'icon' }) {
  const { theme, setTheme, actualTheme, toggleTheme } = useThemeStore()

  if (variant === 'dropdown') {
    return (
      <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={clsx(
              'relative flex items-center justify-center w-8 h-8 rounded-md transition-colors',
              theme === t.id
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
            title={t.label}
          >
            {theme === t.id && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <t.icon className="h-4 w-4 relative z-10" />
          </button>
        ))}
      </div>
    )
  }

  // Simple toggle between light and dark
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: actualTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {actualTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle
