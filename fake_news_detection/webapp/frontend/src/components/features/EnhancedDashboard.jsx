import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Percent,
  Bookmark,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useClassificationStore } from '../../store/classificationStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ResultBadge } from '../ui/ResultBadge'
import { PageTransition, StaggerContainer, StaggerItem, FadeIn, AnimateOnScroll } from '../animations'
import { format, subDays, isAfter, parseISO } from 'date-fns'
import clsx from 'clsx'

// Animated counter component
function AnimatedCounter({ value, duration = 1000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Stats card component
function StatsCard({ icon: Icon, title, value, change, color, delay = 0 }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card hover className="h-full">
        <Card.Body className="p-6">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {change !== undefined && (
              <span className={clsx(
                'text-sm font-medium',
                change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter value={value} />
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  )
}

// Chart colors
const COLORS = {
  real: '#22c55e',
  fake: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
}

function EnhancedDashboard() {
  const { history, stats } = useClassificationStore()
  const { bookmarks } = useBookmarkStore()

  // Calculate additional statistics
  const last7Days = subDays(new Date(), 7)
  const recentHistory = history.filter(h => isAfter(parseISO(h.timestamp), last7Days))
  
  // Prepare chart data
  const distributionData = [
    { name: 'Real News', value: stats.realCount, color: COLORS.real },
    { name: 'Fake News', value: stats.fakeCount, color: COLORS.fake }
  ]

  // Activity data for last 7 days
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayHistory = history.filter(h => {
      const hDate = parseISO(h.timestamp)
      return format(hDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
    return {
      date: format(date, 'EEE'),
      total: dayHistory.length,
      real: dayHistory.filter(h => h.prediction === 'Real').length,
      fake: dayHistory.filter(h => h.prediction === 'Fake').length
    }
  })

  // Confidence distribution
  const confidenceRanges = [
    { range: '50-60%', real: 0, fake: 0 },
    { range: '60-70%', real: 0, fake: 0 },
    { range: '70-80%', real: 0, fake: 0 },
    { range: '80-90%', real: 0, fake: 0 },
    { range: '90-100%', real: 0, fake: 0 }
  ]

  history.forEach(h => {
    const conf = h.confidence * 100
    let idx = 0
    if (conf >= 90) idx = 4
    else if (conf >= 80) idx = 3
    else if (conf >= 70) idx = 2
    else if (conf >= 60) idx = 1
    else idx = 0

    if (h.prediction === 'Real') {
      confidenceRanges[idx].real++
    } else {
      confidenceRanges[idx].fake++
    }
  })

  // Calculate weekly change
  const previousWeek = subDays(new Date(), 14)
  const previousWeekHistory = history.filter(h => {
    const hDate = parseISO(h.timestamp)
    return isAfter(hDate, previousWeek) && !isAfter(hDate, last7Days)
  })
  const weeklyChange = previousWeekHistory.length > 0 
    ? Math.round(((recentHistory.length - previousWeekHistory.length) / previousWeekHistory.length) * 100)
    : 0

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your fake news detection analytics at a glance
              </p>
            </div>
            <Link to="/classify">
              <Button className="mt-4 md:mt-0">
                <Sparkles className="mr-2 h-4 w-4" />
                New Classification
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={FileText}
            title="Total Classifications"
            value={stats.totalAnalyzed}
            change={weeklyChange}
            color="blue"
            delay={0}
          />
          <StatsCard
            icon={CheckCircle}
            title="Real News Detected"
            value={stats.realCount}
            color="green"
            delay={0.1}
          />
          <StatsCard
            icon={XCircle}
            title="Fake News Detected"
            value={stats.fakeCount}
            color="red"
            delay={0.2}
          />
          <StatsCard
            icon={Bookmark}
            title="Saved Bookmarks"
            value={bookmarks.length}
            color="amber"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <AnimateOnScroll>
            <Card className="h-full">
              <Card.Header className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-gray-900 dark:text-white">Weekly Activity</span>
                </div>
              </Card.Header>
              <Card.Body className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.real} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.real} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.fake} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.fake} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="real"
                        stackId="1"
                        stroke={COLORS.real}
                        fill="url(#colorReal)"
                        name="Real"
                      />
                      <Area
                        type="monotone"
                        dataKey="fake"
                        stackId="1"
                        stroke={COLORS.fake}
                        fill="url(#colorFake)"
                        name="Fake"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </AnimateOnScroll>

          {/* Distribution Pie Chart */}
          <AnimateOnScroll>
            <Card className="h-full">
              <Card.Header className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-gray-900 dark:text-white">Classification Distribution</span>
                </div>
              </Card.Header>
              <Card.Body className="p-6">
                <div className="h-64 flex items-center justify-center">
                  {stats.totalAnalyzed > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
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
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No data yet. Start classifying!</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </AnimateOnScroll>
        </div>

        {/* Confidence Distribution */}
        <AnimateOnScroll>
          <Card className="mb-8">
            <Card.Header className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-white">Confidence Distribution</span>
              </div>
            </Card.Header>
            <Card.Body className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="range" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="real" fill={COLORS.real} name="Real News" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fake" fill={COLORS.fake} name="Fake News" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </AnimateOnScroll>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Classifications */}
          <div className="lg:col-span-2">
            <AnimateOnScroll>
              <Card>
                <Card.Header className="border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary-600 mr-2" />
                    <span className="font-semibold text-gray-900 dark:text-white">Recent Classifications</span>
                  </div>
                  <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                    View all <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Card.Header>
                <Card.Body className="p-0">
                  {history.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {history.slice(0, 5).map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {item.title || 'Untitled Article'}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {item.text.substring(0, 100)}...
                              </p>
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
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No classifications yet</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </AnimateOnScroll>
          </div>

          {/* Quick Actions */}
          <AnimateOnScroll>
            <Card>
              <Card.Header className="border-b border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-white">Quick Actions</span>
              </Card.Header>
              <Card.Body className="p-4">
                <StaggerContainer className="space-y-3">
                  <StaggerItem>
                    <Link to="/classify" className="block">
                      <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white hover:shadow-lg transition-shadow">
                        <Sparkles className="h-6 w-6 mb-2" />
                        <h4 className="font-semibold">Classify Article</h4>
                        <p className="text-sm text-white/80">Analyze a news article</p>
                      </div>
                    </Link>
                  </StaggerItem>
                  <StaggerItem>
                    <Link to="/batch" className="block">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white hover:shadow-lg transition-shadow">
                        <FileText className="h-6 w-6 mb-2" />
                        <h4 className="font-semibold">Batch Processing</h4>
                        <p className="text-sm text-white/80">Classify multiple articles</p>
                      </div>
                    </Link>
                  </StaggerItem>
                  <StaggerItem>
                    <Link to="/compare" className="block">
                      <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white hover:shadow-lg transition-shadow">
                        <TrendingUp className="h-6 w-6 mb-2" />
                        <h4 className="font-semibold">Compare Articles</h4>
                        <p className="text-sm text-white/80">Side-by-side analysis</p>
                      </div>
                    </Link>
                  </StaggerItem>
                </StaggerContainer>
              </Card.Body>
            </Card>
          </AnimateOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}

export default EnhancedDashboard
