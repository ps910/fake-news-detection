import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SlideUp, ScaleIn } from '../components/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { newsService } from '../services/newsService';
import toast from 'react-hot-toast';
import { RefreshCw, ExternalLink, CheckCircle, XCircle, AlertTriangle, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function LiveNews() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedArticles, setScrapedArticles] = useState([]);
  const [selectedSource, setSelectedSource] = useState('general');
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [expandedArticles, setExpandedArticles] = useState({});

  const newsSources = [
    { id: 'general', name: 'Top Stories', icon: '🔥', color: 'from-orange-500 to-red-500' },
    { id: 'technology', name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { id: 'politics', name: 'Politics', icon: '🏛️', color: 'from-purple-500 to-indigo-500' },
    { id: 'health', name: 'Health', icon: '🏥', color: 'from-green-500 to-emerald-500' },
    { id: 'business', name: 'Business', icon: '💼', color: 'from-yellow-500 to-orange-500' },
    { id: 'sports', name: 'Sports', icon: '🏏', color: 'from-pink-500 to-rose-500' },
    { id: 'science', name: 'Science', icon: '🔬', color: 'from-teal-500 to-green-500' }
  ];

  // Fetch news on component mount and category change
  useEffect(() => {
    fetchNews(selectedSource);
  }, [selectedSource]);

  const fetchNews = async (sourceId) => {
    setLoading(true);
    try {
      const response = await api.get(`/news/live?category=${sourceId}`);
      if (response.data.success) {
        setScrapedArticles(response.data.articles || []);
        if (response.data.source === 'sample') {
          toast('📰 Showing sample news (live feeds unavailable)', { icon: 'ℹ️' });
        } else {
          toast.success(`Fetched ${response.data.articles.length} live articles from India`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      toast.error('Failed to fetch live news');
      setScrapedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    await fetchNews(selectedSource);
    setRefreshing(false);
  };

  const scrapeUrl = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    try {
      // Add custom URL article
      const newArticle = {
        id: Date.now(),
        title: 'Article from: ' + new URL(url).hostname,
        source: new URL(url).hostname,
        icon: '🔗',
        url: url,
        time: 'Just now',
        preview: 'Custom URL article - Click Analyze to classify this content...',
        status: 'pending'
      };
      setScrapedArticles([newArticle, ...scrapedArticles]);
      setUrl('');
      toast.success('URL added! Click Analyze to classify.');
    } catch (error) {
      toast.error('Invalid URL format');
    }
  };

  const analyzeArticle = async (articleId) => {
    const article = scrapedArticles.find(a => a.id === articleId);
    if (!article) return;

    // Update status to analyzing
    setScrapedArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, status: 'analyzing' } : a
    ));

    try {
      // Use the article preview/title as text for classification
      const textToAnalyze = `${article.title}. ${article.preview || ''}`;
      const response = await newsService.classify(textToAnalyze);
      
      setScrapedArticles(prev => prev.map(a => {
        if (a.id === articleId) {
          return {
            ...a,
            status: 'analyzed',
            result: response.prediction.toLowerCase(),
            confidence: response.confidence
          };
        }
        return a;
      }));
      
      toast.success(`Analyzed: ${response.prediction}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      setScrapedArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, status: 'error' } : a
      ));
      toast.error('Analysis failed');
    }
  };

  const analyzeAll = async () => {
    const pendingArticles = scrapedArticles.filter(a => a.status === 'pending');
    if (pendingArticles.length === 0) {
      toast('No pending articles to analyze', { icon: 'ℹ️' });
      return;
    }

    setAnalyzing(true);
    toast.loading(`Analyzing ${pendingArticles.length} articles...`, { id: 'analyze-all' });

    for (const article of pendingArticles) {
      await analyzeArticle(article.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }

    toast.success('All articles analyzed!', { id: 'analyze-all' });
    setAnalyzing(false);
  };

  // Stats for the summary
  const stats = {
    total: scrapedArticles.length,
    analyzed: scrapedArticles.filter(a => a.status === 'analyzed').length,
    real: scrapedArticles.filter(a => a.result === 'real').length,
    fake: scrapedArticles.filter(a => a.result === 'fake').length
  };

  // Toggle article expansion
  const toggleArticle = (articleId) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  // Open article modal
  const openArticleModal = (article) => {
    setSelectedArticle(article);
  };

  // Close article modal
  const closeArticleModal = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📡 Live News Scanner
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Fetch real-time news from Indian sources and analyze for fake news
            </p>
          </div>
        </FadeIn>

        {/* Stats Bar */}
        <SlideUp>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="text-center p-4 dark:bg-gray-800">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Articles</p>
            </Card>
            <Card className="text-center p-4 dark:bg-gray-800">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.analyzed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed</p>
            </Card>
            <Card className="text-center p-4 dark:bg-gray-800">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.real}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real News</p>
            </Card>
            <Card className="text-center p-4 dark:bg-gray-800">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.fake}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fake News</p>
            </Card>
          </div>
        </SlideUp>

        {/* URL Input */}
        <SlideUp delay={0.1}>
          <Card className="mb-8 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🔗 Analyze Custom URL
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a news article URL to analyze..."
                  className="w-full"
                />
              </div>
              <Button onClick={scrapeUrl} disabled={loading || !url.trim()}>
                Add & Analyze
              </Button>
            </div>
          </Card>
        </SlideUp>

        {/* News Sources */}
        <SlideUp delay={0.2}>
          <Card className="mb-8 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                📰 Indian News Sources
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshNews}
                  disabled={refreshing || loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  size="sm" 
                  onClick={analyzeAll}
                  disabled={analyzing || scrapedArticles.filter(a => a.status === 'pending').length === 0}
                >
                  {analyzing ? 'Analyzing...' : '🔍 Analyze All'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {newsSources.map((source) => (
                <motion.button
                  key={source.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSource(source.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedSource === source.id
                      ? `bg-gradient-to-br ${source.color} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{source.icon}</span>
                  <span className="text-xs font-medium">{source.name}</span>
                </motion.button>
              ))}
            </div>
          </Card>
        </SlideUp>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Fetching latest Indian news...</p>
            </div>
          </div>
        )}

        {/* Articles List */}
        {!loading && scrapedArticles.length > 0 && (
          <SlideUp delay={0.3}>
            <Card className="dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  📋 News Articles ({scrapedArticles.length})
                </h2>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {scrapedArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                        article.status === 'analyzed'
                          ? article.result === 'fake'
                            ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                            : 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      {/* Clickable Header */}
                      <div 
                        className="p-4"
                        onClick={() => toggleArticle(article.id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{article.icon || '📰'}</span>
                              <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/50 rounded text-primary-600 dark:text-primary-400 font-medium">
                                {article.source}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {article.time}
                              </span>
                              <button className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                {expandedArticles[article.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {article.title}
                            </h3>
                            <p className={`text-sm text-gray-600 dark:text-gray-400 ${expandedArticles[article.id] ? '' : 'line-clamp-2'}`}>
                              {article.preview}
                            </p>
                          </div>

                          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            {article.status === 'pending' && (
                              <Button
                                onClick={() => analyzeArticle(article.id)}
                                disabled={analyzing}
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                Analyze
                              </Button>
                            )}

                            {article.status === 'analyzing' && (
                              <div className="flex items-center text-blue-600 dark:text-blue-400">
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Analyzing...
                              </div>
                            )}

                            {article.status === 'error' && (
                              <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Error
                              </div>
                            )}

                            {article.status === 'analyzed' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex flex-col items-end"
                              >
                                <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${
                                  article.result === 'fake'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-green-500 text-white'
                                }`}>
                                  {article.result === 'fake' ? (
                                    <><XCircle className="w-4 h-4 mr-1" /> FAKE</>
                                  ) : (
                                    <><CheckCircle className="w-4 h-4 mr-1" /> REAL</>
                                  )}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {(article.confidence * 100).toFixed(1)}% confidence
                                </span>
                              </motion.div>
                            )}

                            {article.url && article.url.startsWith('http') && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                title="Read original article"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedArticles[article.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Full Content</h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {article.preview || 'No additional content available.'}
                                </p>
                                
                                {article.status === 'analyzed' && (
                                  <div className={`mt-4 p-3 rounded-lg ${
                                    article.result === 'fake' 
                                      ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800' 
                                      : 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                                  }`}>
                                    <h5 className={`font-semibold mb-1 ${
                                      article.result === 'fake' ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                                    }`}>
                                      Analysis Result: {article.result === 'fake' ? '❌ FAKE NEWS' : '✅ REAL NEWS'}
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Our AI model is {(article.confidence * 100).toFixed(1)}% confident in this classification.
                                    </p>
                                  </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                  {article.status === 'pending' && (
                                    <Button onClick={() => analyzeArticle(article.id)} disabled={analyzing}>
                                      🔍 Analyze This Article
                                    </Button>
                                  )}
                                  {article.url && article.url.startsWith('http') && (
                                    <a
                                      href={article.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="outline">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Read Full Article
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary Stats */}
              {scrapedArticles.some(a => a.status === 'analyzed') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Analysis Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {scrapedArticles.filter(a => a.status === 'analyzed').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {scrapedArticles.filter(a => a.result === 'real').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Real News</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {scrapedArticles.filter(a => a.result === 'fake').length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fake News</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </SlideUp>
        )}

        {/* Empty State */}
        {!loading && scrapedArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles loaded
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select a news category above or paste a URL to get started
            </p>
          </div>
        )}

        {/* Source Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>📰 News sourced from: Times of India, The Hindu, NDTV, India Today, Economic Times, and more Indian outlets</p>
          <p className="mt-1">🤖 Analyzed using our AI-powered Fake News Detection model (94.8% accuracy)</p>
        </div>
      </div>
    </div>
  );
}
