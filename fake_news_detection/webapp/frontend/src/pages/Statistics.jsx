import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { FadeIn, SlideUp, ScaleIn, StaggerContainer } from '../components/animations';
import Card from '../components/ui/Card';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function Statistics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStats({
      summary: {
        totalArticles: 15823,
        realNews: 8542,
        fakeNews: 7281,
        avgConfidence: 87.3,
        accuracyRate: 94.8,
        processingTime: 0.45
      },
      dailyTrend: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        real: Math.floor(Math.random() * 200) + 100,
        fake: Math.floor(Math.random() * 150) + 80,
        total: 0
      })).map(d => ({ ...d, total: d.real + d.fake })),
      confidenceDistribution: [
        { range: '50-60%', real: 45, fake: 78 },
        { range: '60-70%', real: 156, fake: 234 },
        { range: '70-80%', real: 423, fake: 512 },
        { range: '80-90%', real: 1234, fake: 1456 },
        { range: '90-100%', real: 2134, fake: 1823 }
      ],
      categoryBreakdown: [
        { name: 'Politics', real: 1234, fake: 2341, total: 3575 },
        { name: 'Health', real: 1876, fake: 1543, total: 3419 },
        { name: 'Technology', real: 2341, fake: 876, total: 3217 },
        { name: 'Entertainment', real: 987, fake: 1234, total: 2221 },
        { name: 'Science', real: 1543, fake: 432, total: 1975 },
        { name: 'Sports', real: 561, fake: 855, total: 1416 }
      ],
      sourceCredibility: [
        { name: 'Official News', credibility: 92, count: 3421 },
        { name: 'Independent Media', credibility: 76, count: 2876 },
        { name: 'Social Media', credibility: 45, count: 4532 },
        { name: 'Blogs', credibility: 38, count: 2341 },
        { name: 'Unknown Sources', credibility: 23, count: 2653 }
      ],
      wordFrequency: [
        { word: 'breaking', fake: 85, real: 12 },
        { word: 'shocking', fake: 78, real: 5 },
        { word: 'miracle', fake: 72, real: 3 },
        { word: 'official', fake: 8, real: 67 },
        { word: 'reported', fake: 12, real: 82 },
        { word: 'according', fake: 15, real: 76 },
        { word: 'study', fake: 23, real: 65 },
        { word: 'secret', fake: 68, real: 8 }
      ],
      confusionMatrix: {
        truePositive: 7123,
        trueNegative: 7845,
        falsePositive: 389,
        falseNegative: 466
      },
      hourlyPattern: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        articles: Math.floor(Math.sin((i - 6) * Math.PI / 12) * 50 + 80),
        accuracy: 90 + Math.random() * 8
      })),
      lengthVsAccuracy: Array.from({ length: 20 }, (_, i) => ({
        wordCount: (i + 1) * 50,
        accuracy: Math.min(98, 75 + i * 1.2 + Math.random() * 5),
        size: Math.floor(Math.random() * 500) + 100
      }))
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 Advanced Statistics
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Comprehensive analytics and model performance metrics
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
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

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Analyzed', value: stats.summary.totalArticles.toLocaleString(), icon: '📰', color: 'blue' },
            { label: 'Real News', value: stats.summary.realNews.toLocaleString(), icon: '✅', color: 'green' },
            { label: 'Fake News', value: stats.summary.fakeNews.toLocaleString(), icon: '❌', color: 'red' },
            { label: 'Accuracy', value: `${stats.summary.accuracyRate}%`, icon: '🎯', color: 'purple' },
            { label: 'Avg Confidence', value: `${stats.summary.avgConfidence}%`, icon: '📈', color: 'orange' },
            { label: 'Avg Time', value: `${stats.summary.processingTime}s`, icon: '⚡', color: 'teal' }
          ].map((stat, index) => (
            <SlideUp key={stat.label}>
              <Card className="dark:bg-gray-800 text-center">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </Card>
            </SlideUp>
          ))}
        </StaggerContainer>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Classification Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyTrend}>
                  <defs>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} interval={4} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="real" name="Real News" stroke="#10B981" fillOpacity={1} fill="url(#colorReal)" />
                  <Area type="monotone" dataKey="fake" name="Fake News" stroke="#EF4444" fillOpacity={1} fill="url(#colorFake)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confidence Score Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="real" name="Real News" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fake" name="Fake News" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>
        </div>

        {/* Category Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ScaleIn>
            <Card className="dark:bg-gray-800 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.categoryBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="real" name="Real" stackId="a" fill="#10B981" />
                  <Bar dataKey="fake" name="Fake" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Source Credibility
              </h3>
              <div className="space-y-4">
                {stats.sourceCredibility.map((source, index) => (
                  <div key={source.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{source.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{source.credibility}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${source.credibility}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className={`h-2 rounded-full ${
                          source.credibility > 70 ? 'bg-green-500' :
                          source.credibility > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </ScaleIn>
        </div>

        {/* Word Analysis & Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Key Word Indicators
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.wordFrequency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="word" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="real" name="Real News" fill="#10B981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="fake" name="Fake News" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confusion Matrix
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center"
                >
                  <p className="text-sm text-green-600 dark:text-green-400">True Positive</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {stats.confusionMatrix.truePositive.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">False Positive</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {stats.confusionMatrix.falsePositive.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">False Negative</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {stats.confusionMatrix.falseNegative.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center"
                >
                  <p className="text-sm text-green-600 dark:text-green-400">True Negative</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {stats.confusionMatrix.trueNegative.toLocaleString()}
                  </p>
                </motion.div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precision:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {((stats.confusionMatrix.truePositive / (stats.confusionMatrix.truePositive + stats.confusionMatrix.falsePositive)) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recall:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {((stats.confusionMatrix.truePositive / (stats.confusionMatrix.truePositive + stats.confusionMatrix.falseNegative)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </ScaleIn>
        </div>

        {/* Hourly Pattern & Length Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hourly Activity Pattern
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.hourlyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" tickFormatter={(h) => `${h}:00`} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" domain={[85, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="articles" name="Articles" stroke="#3B82F6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Article Length vs Accuracy
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="wordCount" name="Word Count" stroke="#9CA3AF" />
                  <YAxis dataKey="accuracy" name="Accuracy" domain={[70, 100]} stroke="#9CA3AF" />
                  <ZAxis dataKey="size" range={[50, 400]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value, name) => [name === 'accuracy' ? `${value.toFixed(1)}%` : value, name]}
                  />
                  <Scatter name="Articles" data={stats.lengthVsAccuracy} fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Bubble size represents sample count
              </p>
            </Card>
          </ScaleIn>
        </div>
      </div>
    </div>
  );
}
