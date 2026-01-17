import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Classify from './pages/Classify'
import History from './pages/History'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Enhanced Feature Pages
import BatchClassification from './components/features/BatchClassification'
import ComparisonTool from './components/features/ComparisonTool'
import Bookmarks from './components/features/Bookmarks'

// New Advanced Feature Pages
import Admin from './pages/Admin'
import Reports from './pages/Reports'
import Explainability from './pages/Explainability'
import LiveNews from './pages/LiveNews'
import ModelComparison from './pages/ModelComparison'
import WordCloud from './pages/WordCloud'
import Feedback from './pages/Feedback'
import ApiDocs from './pages/ApiDocs'
import Statistics from './pages/Statistics'
import NewsVerification from './pages/NewsVerification'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { actualTheme, initTheme } = useThemeStore()
  const { initialize } = useAuthStore()

  // Initialize auth and theme on mount
  useEffect(() => {
    initTheme()
    initialize()
  }, [])

  // Apply dark mode class to document
  useEffect(() => {
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [actualTheme])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/classify" 
            element={
              <ProtectedRoute>
                <Classify />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/batch" 
            element={
              <ProtectedRoute>
                <BatchClassification />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/compare" 
            element={
              <ProtectedRoute>
                <ComparisonTool />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookmarks" 
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            } 
          />
          
          {/* New Advanced Feature Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explainability" 
            element={
              <ProtectedRoute>
                <Explainability />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/live-news" 
            element={
              <ProtectedRoute>
                <LiveNews />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/model-comparison" 
            element={
              <ProtectedRoute>
                <ModelComparison />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/word-cloud" 
            element={
              <ProtectedRoute>
                <WordCloud />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistics" 
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } 
          />
          
          {/* Public API Docs Route */}
          <Route path="/api-docs" element={<ApiDocs />} />
          
          {/* Public News Verification Route */}
          <Route path="/verify" element={<NewsVerification />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App
