import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileSearch, 
  History, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Calendar,
  Layers,
  GitCompare,
  Bookmark,
  Sparkles
} from 'lucide-react'
import { userService } from '../services/newsService'
import { useAuthStore } from '../store/authStore'
import { useBookmarkStore } from '../store/bookmarkStore'
import Card from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/Loading'
import { ResultBadge } from '../components/ui/ResultBadge'
import { PageTransition, AnimateOnScroll } from '../components/animations'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

// Animated Counter
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (typeof value !== 'number') return
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / 1000, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  if (typeof value !== 'number') return <span>{value}</span>
  return <span>{count.toLocaleString()}</span>
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { bookmarks } = useBookmarkStore()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await userService.getDashboard()
      console.log('Dashboard response:', response)
      setDashboardData(response)
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = dashboardData?.stats || { total: 0, realCount: 0, fakeCount: 0 }
  const recentHistory = dashboardData?.recentClassifications || []

  const pieData = [
    { name: 'Real', value: stats.realCount, color: '#22c55e' },
    { name: 'Fake', value: stats.fakeCount, color: '#ef4444' }
  ]

  const statCards = [
    { title: 'Total Classifications', value: stats.total, icon: FileSearch, gradient: 'from-blue-500 to-blue-600', link: '/history' },
    { title: 'Real News Detected', value: stats.realCount, icon: CheckCircle, gradient: 'from-green-500 to-green-600', link: '/history?filter=Real' },
    { title: 'Fake News Detected', value: stats.fakeCount, icon: XCircle, gradient: 'from-red-500 to-red-600', link: '/history?filter=Fake' },
    { title: 'Saved Bookmarks', value: bookmarks.length, icon: Bookmark, gradient: 'from-amber-500 to-amber-600', link: '/history?saved=true' }
  ]

  const quickActions = [
    { path: '/classify', label: 'Classify', icon: Sparkles, gradient: 'from-primary-500 to-primary-600', desc: 'Analyze an article' },
    { path: '/batch', label: 'Batch', icon: Layers, gradient: 'from-purple-500 to-purple-600', desc: 'Process multiple' },
    { path: '/compare', label: 'Compare', icon: GitCompare, gradient: 'from-amber-500 to-amber-600', desc: 'Side by side' }
  ]

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's an overview of your news classification activity
            </p>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={action.path}>
                  <div className={`bg-gradient-to-r ${action.gradient} rounded-xl p-5 text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                    <action.icon className="h-8 w-8 mb-3" />
                    <h3 className="font-semibold text-lg">{action.label}</h3>
                    <p className="text-white/80 text-sm">{action.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link to={stat.link}>
                  <Card hover className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <Card.Body className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                            <AnimatedCounter value={stat.value} />
                          </p>
                          <p className="text-xs text-primary-500 mt-2 flex items-center">
                            Click to view <ArrowRight className="h-3 w-3 ml-1" />
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <AnimateOnScroll>
              <Card className="lg:col-span-1 h-full">
                <Card.Header className="border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Classification Distribution</h3>
                </Card.Header>
                <Card.Body className="p-6">
                  {stats.total > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: 'none', 
                              borderRadius: '8px',
                              color: '#fff'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center space-x-6 mt-4">
                        {pieData.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.name} ({item.value})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <FileSearch className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No classifications yet</p>
                        <Link to="/classify" className="text-primary-600 hover:underline text-sm">
                          Start classifying
                        </Link>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </AnimateOnScroll>

            {/* Recent History */}
            <AnimateOnScroll>
              <Card className="lg:col-span-2 h-full">
                <Card.Header className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Classifications</h3>
                  <Link 
                    to="/history" 
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    View all <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Card.Header>
                <Card.Body className="p-0">
                  {recentHistory.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {recentHistory.slice(0, 5).map((item, index) => (
                        <motion.div 
                          key={item._id} 
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {item.title || 'Untitled Article'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                {item.text?.substring(0, 100)}...
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                            </div>
                            <ResultBadge 
                              prediction={item.prediction} 
                              confidence={item.confidence} 
                              size="sm"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <History className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No recent classifications</p>
                      <Link to="/classify" className="text-primary-600 hover:underline text-sm">
                        Classify your first article
                      </Link>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Dashboard
