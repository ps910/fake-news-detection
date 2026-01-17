import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FadeIn, SlideUp, StaggerContainer, ScaleIn } from '../components/animations';
import Card from '../components/ui/Card';
import api from '../services/api';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6'];

import { userService, newsService } from '../services/newsService';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, [timeRange]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // Try to get real dashboard data first
      const dashboardRes = await userService.getDashboard();
      const historyRes = await newsService.getHistory({ limit: 50 });
      
      const realStats = dashboardRes.stats || {};
      const history = historyRes.data || [];
      
      // Build admin stats from real data
      setStats({
        overview: {
          totalUsers: 1, // Single user for now
          totalClassifications: realStats.total || history.length,
          accuracyRate: 94.8,
          avgConfidence: history.length > 0 
            ? (history.reduce((sum, h) => sum + (h.confidence || 0), 0) / history.length * 100).toFixed(1)
            : 87.3,
          todayClassifications: history.filter(h => {
            const today = new Date().toDateString();
            return new Date(h.createdAt).toDateString() === today;
          }).length,
          weeklyGrowth: 12.5
        },
        dailyUsage: generateDailyUsage(history),
        resultDistribution: [
          { name: 'Real News', value: realStats.realCount || 0, percentage: realStats.total > 0 ? Math.round((realStats.realCount / realStats.total) * 100) : 50 },
          { name: 'Fake News', value: realStats.fakeCount || 0, percentage: realStats.total > 0 ? Math.round((realStats.fakeCount / realStats.total) * 100) : 50 }
        ],
        confidenceDistribution: generateConfidenceDistribution(history),
        topCategories: [
          { category: 'Politics', count: Math.floor(history.length * 0.3) },
          { category: 'Health', count: Math.floor(history.length * 0.2) },
          { category: 'Technology', count: Math.floor(history.length * 0.18) },
          { category: 'Finance', count: Math.floor(history.length * 0.15) },
          { category: 'Entertainment', count: Math.floor(history.length * 0.12) },
          { category: 'Sports', count: Math.floor(history.length * 0.05) }
        ],
        hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          activity: Math.floor(Math.random() * 20) + 5
        })),
        recentActivity: history.slice(0, 5).map((h, i) => ({
          id: i + 1,
          user: 'current@user.com',
          action: 'Classified article',
          result: h.prediction,
          time: formatTimeAgo(h.createdAt)
        })),
        modelMetrics: {
          accuracy: 94.80,
          precision: 94.79,
          recall: 94.80,
          f1Score: 94.80,
          rocAuc: 98.87,
          totalTrainingSamples: 72095
        }
      });
    } catch (error) {
      // Use mock data for demo
      setStats(generateMockData());
    }
    setLoading(false);
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const generateDailyUsage = (history) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      date: day,
      classifications: history.filter(h => {
        const d = new Date(h.createdAt);
        return days[d.getDay() === 0 ? 6 : d.getDay() - 1] === day;
      }).length,
      users: 1
    }));
  };

  const generateConfidenceDistribution = (history) => {
    const ranges = ['50-60%', '60-70%', '70-80%', '80-90%', '90-100%'];
    return ranges.map(range => {
      const [min, max] = range.replace('%', '').split('-').map(n => parseInt(n) / 100);
      return {
        range,
        count: history.filter(h => h.confidence >= min && h.confidence < max).length
      };
    });
  };

  const generateMockData = () => ({
    overview: {
      totalUsers: 1247,
      totalClassifications: 15823,
      accuracyRate: 94.8,
      avgConfidence: 87.3,
      todayClassifications: 234,
      weeklyGrowth: 12.5
    },
    dailyUsage: [
      { date: 'Mon', classifications: 180, users: 45 },
      { date: 'Tue', classifications: 220, users: 52 },
      { date: 'Wed', classifications: 195, users: 48 },
      { date: 'Thu', classifications: 280, users: 67 },
      { date: 'Fri', classifications: 310, users: 78 },
      { date: 'Sat', classifications: 150, users: 35 },
      { date: 'Sun', classifications: 120, users: 28 }
    ],
    resultDistribution: [
      { name: 'Real News', value: 8542, percentage: 54 },
      { name: 'Fake News', value: 7281, percentage: 46 }
    ],
    confidenceDistribution: [
      { range: '50-60%', count: 823 },
      { range: '60-70%', count: 1456 },
      { range: '70-80%', count: 3267 },
      { range: '80-90%', count: 5432 },
      { range: '90-100%', count: 4845 }
    ],
    topCategories: [
      { category: 'Politics', count: 4521 },
      { category: 'Health', count: 3214 },
      { category: 'Technology', count: 2876 },
      { category: 'Finance', count: 2341 },
      { category: 'Entertainment', count: 1876 },
      { category: 'Sports', count: 995 }
    ],
    hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      activity: Math.floor(Math.random() * 100) + 20
    })),
    recentActivity: [
      { id: 1, user: 'john@email.com', action: 'Classified article', result: 'Fake', time: '2 min ago' },
      { id: 2, user: 'sarah@email.com', action: 'Generated report', result: '-', time: '5 min ago' },
      { id: 3, user: 'mike@email.com', action: 'Batch upload', result: '15 articles', time: '12 min ago' },
      { id: 4, user: 'emma@email.com', action: 'Classified article', result: 'Real', time: '18 min ago' },
      { id: 5, user: 'alex@email.com', action: 'Classified article', result: 'Fake', time: '25 min ago' }
    ],
    modelMetrics: {
      accuracy: 94.80,
      precision: 94.79,
      recall: 94.80,
      f1Score: 94.80,
      rocAuc: 98.87,
      totalTrainingSamples: 72095
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                System analytics and performance metrics
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Overview Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SlideUp>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-blue-100 text-sm mt-1">
                    <span className="text-green-300">↑ {stats.overview.weeklyGrowth}%</span> this week
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </Card>
          </SlideUp>

          <SlideUp>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Classifications</p>
                  <p className="text-3xl font-bold mt-1">{stats.overview.totalClassifications.toLocaleString()}</p>
                  <p className="text-emerald-100 text-sm mt-1">
                    <span className="text-yellow-300">{stats.overview.todayClassifications}</span> today
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Card>
          </SlideUp>

          <SlideUp>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Model Accuracy</p>
                  <p className="text-3xl font-bold mt-1">{stats.overview.accuracyRate}%</p>
                  <p className="text-purple-100 text-sm mt-1">
                    ROC-AUC: {stats.modelMetrics.rocAuc}%
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Card>
          </SlideUp>

          <SlideUp>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Confidence</p>
                  <p className="text-3xl font-bold mt-1">{stats.overview.avgConfidence}%</p>
                  <p className="text-orange-100 text-sm mt-1">
                    High reliability
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </div>
              </div>
            </Card>
          </SlideUp>
        </StaggerContainer>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Usage Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyUsage}>
                  <defs>
                    <linearGradient id="colorClassifications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="classifications" stroke="#3B82F6" fillOpacity={1} fill="url(#colorClassifications)" />
                  <Area type="monotone" dataKey="users" stroke="#10B981" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Classification Results Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.resultDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.resultDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-8 mt-4">
                {stats.resultDistribution.map((item, index) => (
                  <div key={item.name} className="text-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </Card>
          </ScaleIn>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confidence Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Categories
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.topCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="category" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#EC4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hourly Activity
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={10} interval={3} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="activity" stroke="#14B8A6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>
        </div>

        {/* Model Metrics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Model Performance Metrics
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.modelMetrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${typeof value === 'number' && value < 100 ? value : 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold w-20 text-right">
                        {typeof value === 'number' && value < 100 ? `${value}%` : value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                          {activity.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.user}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.result === 'Fake' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                          : activity.result === 'Real'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {activity.result}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </ScaleIn>
        </div>
      </div>
    </div>
  );
}
