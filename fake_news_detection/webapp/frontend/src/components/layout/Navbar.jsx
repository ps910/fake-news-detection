import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'
import { 
  Menu, 
  X, 
  Shield, 
  LogOut, 
  User, 
  History, 
  FileSearch,
  LayoutDashboard,
  ChevronDown,
  Layers,
  GitCompare,
  Bookmark,
  BarChart2,
  FileText,
  Radio,
  Cloud,
  MessageSquare,
  Settings,
  Globe
} from 'lucide-react'
import clsx from 'clsx'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowDropdown(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = isAuthenticated 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/classify', label: 'Classify', icon: FileSearch },
        { path: '/verify', label: 'Verify', icon: Globe },
        { path: '/live-news', label: 'Live News', icon: Radio },
        { path: '/history', label: 'History', icon: History },
      ]
    : [
        { path: '/verify', label: 'Verify News', icon: Globe },
      ]

  const moreLinks = isAuthenticated
    ? [
        { path: '/batch', label: 'Batch Processing', icon: Layers },
        { path: '/compare', label: 'Compare Articles', icon: GitCompare },
        { path: '/model-comparison', label: 'Model Comparison', icon: Settings },
        { path: '/word-cloud', label: 'Word Cloud', icon: Cloud },
        { path: '/explainability', label: 'Explainability', icon: FileText },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/feedback', label: 'Feedback', icon: MessageSquare },
        { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
        { path: '/admin', label: 'Admin Panel', icon: Settings },
      ]
    : []

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg"
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                FakeNewsDetector
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(path)
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {isActive(path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary-50 dark:bg-primary-900/50 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{label}</span>
              </Link>
            ))}
            
            {/* More Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  className={clsx(
                    'flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <span>More</span>
                  <ChevronDown className={clsx('h-4 w-4 transition-transform', showMoreDropdown && 'rotate-180')} />
                </motion.button>
                
                <AnimatePresence>
                  {showMoreDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50"
                    >
                      {moreLinks.map(({ path, label, icon: Icon }) => (
                        <Link
                          key={path}
                          to={path}
                          onClick={() => setShowMoreDropdown(false)}
                          className={clsx(
                            'flex items-center space-x-2 px-4 py-2 text-sm transition-colors',
                            isActive(path)
                              ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/50'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                      {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={clsx(
                    'h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform',
                    showDropdown && 'rotate-180'
                  )} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <hr className="my-1 border-gray-100 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium',
                    isActive(path)
                      ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
              
              <hr className="my-2 border-gray-100 dark:border-gray-700" />
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-center bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
