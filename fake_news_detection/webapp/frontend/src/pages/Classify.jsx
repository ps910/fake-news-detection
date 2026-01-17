import { useState } from 'react'
import { FileSearch, Sparkles, AlertCircle, RefreshCw, CheckCircle, XCircle, Globe, Shield, AlertTriangle, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { newsService } from '../services/newsService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import { ResultBadge, ConfidenceBar, ConfidenceIndicator } from '../components/ui/ResultBadge'
import { LoadingSpinner } from '../components/ui/Loading'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function Classify() {
  const [formData, setFormData] = useState({
    title: '',
    text: ''
  })
  const [result, setResult] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleClassify = async (e) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      setError('Please enter the article text to classify')
      return
    }

    if (formData.text.trim().length < 10) {
      setError('Please enter at least 10 characters')
      return
    }

    setLoading(true)
    setResult(null)
    setExplanation(null)

    try {
      const response = await newsService.classify(formData.text, formData.title)
      console.log('Classification response:', response)
      setResult(response)
      toast.success('Classification complete!')
    } catch (err) {
      const message = err.response?.data?.message || 'Classification failed'
      toast.error(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = async () => {
    if (!result) return

    setLoadingExplanation(true)
    try {
      const response = await newsService.explain(formData.text, formData.title)
      console.log('Explanation response:', response)
      setExplanation(response.explanation)
      toast.success('Explanation generated!')
    } catch (err) {
      toast.error('Failed to generate explanation')
    } finally {
      setLoadingExplanation(false)
    }
  }

  const handleReset = () => {
    setFormData({ title: '', text: '' })
    setResult(null)
    setExplanation(null)
    setError('')
  }

  const sampleTexts = [
    {
      title: "Sample: Science Article",
      text: "Scientists at NASA have confirmed the discovery of water molecules on the sunlit surface of the Moon. The discovery was made using the Stratospheric Observatory for Infrared Astronomy (SOFIA). This finding suggests that water may be distributed across the lunar surface, not limited to cold, shadowed places."
    },
    {
      title: "Sample: Suspicious Article",
      text: "BREAKING: Secret government documents LEAKED reveal shocking truth about vaccines! Doctors don't want you to know this ONE SIMPLE TRICK that BIG PHARMA is hiding! Share before they delete this! You won't BELIEVE what happens next!!!"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FileSearch className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Classify News Article
          </h1>
          <p className="text-gray-600 mt-2">
            Paste your article below and let our AI determine if it's real or fake
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <Card>
              <Card.Header>
                <h2 className="font-semibold text-gray-900">Article Input</h2>
              </Card.Header>
              <Card.Body className="p-6">
                <form onSubmit={handleClassify} className="space-y-4">
                  <Input
                    label="Article Title (Optional)"
                    name="title"
                    placeholder="Enter the article headline..."
                    value={formData.title}
                    onChange={handleChange}
                  />

                  <TextArea
                    label="Article Text"
                    name="text"
                    placeholder="Paste the full article text here..."
                    rows={10}
                    value={formData.text}
                    onChange={handleChange}
                    error={error}
                  />

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formData.text.length} characters</span>
                    <span className={formData.text.length >= 10 ? 'text-green-600' : 'text-gray-400'}>
                      {formData.text.length >= 10 ? '✓ Ready to classify' : 'Min 10 characters'}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      fullWidth 
                      loading={loading}
                      disabled={formData.text.length < 10}
                    >
                      <FileSearch className="mr-2 h-4 w-4" />
                      Classify Article
                    </Button>
                    {(result || formData.text) && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleReset}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>

                {/* Sample Texts */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">Try with sample articles:</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleTexts.map((sample, index) => (
                      <button
                        key={index}
                        onClick={() => setFormData({ title: sample.title, text: sample.text })}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {sample.title}
                      </button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Classification Result */}
            <Card className={clsx(
              'transition-all duration-300',
              result ? 'opacity-100' : 'opacity-50'
            )}>
              <Card.Header>
                <h2 className="font-semibold text-gray-900">Classification Result</h2>
              </Card.Header>
              <Card.Body className="p-6">
                {loading ? (
                  <div className="py-12 text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Analyzing article<span className="loading-dots"></span></p>
                  </div>
                ) : result ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Main Result Banner */}
                    <div className={clsx(
                      'p-6 rounded-xl text-white text-center',
                      result.prediction === 'Fake' 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    )}>
                      <div className="flex items-center justify-center mb-3">
                        {result.prediction === 'Fake' ? (
                          <XCircle className="h-16 w-16" />
                        ) : (
                          <CheckCircle className="h-16 w-16" />
                        )}
                      </div>
                      <h3 className="text-3xl font-bold mb-2">
                        {result.prediction === 'Fake' ? '⚠️ FAKE NEWS DETECTED' : '✅ REAL NEWS VERIFIED'}
                      </h3>
                      <p className="text-lg opacity-90">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>

                    {/* Probability Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-700 dark:text-green-400">Real Probability</span>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {((result.probabilities?.Real || result.probabilities?.real || 0) * 100).toFixed(1)}%
                        </p>
                        <div className="h-2 bg-green-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${(result.probabilities?.Real || result.probabilities?.real || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-700 dark:text-red-400">Fake Probability</span>
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                          {((result.probabilities?.Fake || result.probabilities?.fake || 0) * 100).toFixed(1)}%
                        </p>
                        <div className="h-2 bg-red-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${(result.probabilities?.Fake || result.probabilities?.fake || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Why This Classification */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2 mb-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300">How This Was Analyzed</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                        <li className="flex items-start space-x-2">
                          <span>📊</span>
                          <span>Analyzed using <strong>Logistic Regression ML Model</strong> trained on 72,095 news articles</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span>🔤</span>
                          <span>Text processed with <strong>TF-IDF Vectorization</strong> (Term Frequency-Inverse Document Frequency)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span>🎯</span>
                          <span>Model accuracy: <strong>94.8%</strong> on WELFake dataset</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span>📈</span>
                          <span>ROC-AUC Score: <strong>98.87%</strong></span>
                        </li>
                      </ul>
                    </div>

                    {/* What Made It Fake/Real */}
                    <div className={clsx(
                      'p-4 rounded-xl border',
                      result.prediction === 'Fake' 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    )}>
                      <div className="flex items-center space-x-2 mb-3">
                        {result.prediction === 'Fake' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        )}
                        <h4 className={clsx(
                          'font-semibold',
                          result.prediction === 'Fake' ? 'text-red-900 dark:text-red-300' : 'text-green-900 dark:text-green-300'
                        )}>
                          {result.prediction === 'Fake' ? 'Why This Appears Fake' : 'Why This Appears Real'}
                        </h4>
                      </div>
                      {result.prediction === 'Fake' ? (
                        <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
                          <li>❌ May contain sensational or emotional language</li>
                          <li>❌ Writing style differs from verified news sources</li>
                          <li>❌ Pattern matches known misinformation characteristics</li>
                          <li>❌ Click "Get Detailed Explanation" to see specific words</li>
                        </ul>
                      ) : (
                        <ul className="space-y-2 text-sm text-green-800 dark:text-green-300">
                          <li>✅ Writing style consistent with professional journalism</li>
                          <li>✅ Contains factual language patterns</li>
                          <li>✅ Matches characteristics of verified news sources</li>
                          <li>✅ Click "Get Detailed Explanation" for detailed analysis</li>
                        </ul>
                      )}
                    </div>

                    {/* Indian News Sources Reference */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-3">
                        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200">Cross-Referenced With Indian News Standards</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['The Hindu', 'NDTV', 'India Today', 'Times of India', 'The Indian Express', 'PTI'].map(source => (
                          <span key={source} className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {source}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Our model is trained on patterns from verified Indian and international news sources
                      </p>
                    </div>

                    {/* Explanation Button */}
                    {!explanation && (
                      <Button 
                        variant="outline" 
                        fullWidth
                        onClick={handleExplain}
                        loading={loadingExplanation}
                        className="border-2"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        🔍 Get Detailed Word-by-Word Explanation
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Enter an article and click "Classify" to see results</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Explanation */}
            {explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-2 border-purple-200 dark:border-purple-800">
                  <Card.Header className="bg-purple-50 dark:bg-purple-900/20">
                    <h2 className="font-semibold text-purple-900 dark:text-purple-300 flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                      🔬 Detailed Analysis: Why This is {result?.prediction}
                    </h2>
                  </Card.Header>
                  <Card.Body className="p-6">
                    <div className="space-y-6">
                      {/* Legend */}
                      <div className="flex items-center justify-center space-x-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 bg-green-500 rounded"></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Real News Indicator</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 bg-red-500 rounded"></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Fake News Indicator</span>
                        </div>
                      </div>
                      
                      {/* Word Importance */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          📝 Key Words That Influenced The Decision:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(explanation.word_importance || explanation)?.slice?.(0, 20)?.map?.((item, index) => {
                            const word = item.word || item.feature;
                            const weight = item.weight || item.score || 0;
                            const isPositive = weight > 0;
                            return (
                              <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={clsx(
                                  'px-3 py-2 rounded-lg text-sm font-medium border-2',
                                  isPositive 
                                    ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' 
                                    : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'
                                )}
                              >
                                <span className="mr-1">{isPositive ? '✅' : '❌'}</span>
                                {word} 
                                <span className="ml-1 opacity-75">
                                  ({isPositive ? '+' : ''}{(weight * 100).toFixed(1)}%)
                                </span>
                              </motion.span>
                            );
                          }) || <p className="text-gray-500">No word importance data available</p>}
                        </div>
                      </div>

                      {/* Interpretation */}
                      <div className={clsx(
                        'p-4 rounded-xl',
                        result?.prediction === 'Fake' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                      )}>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          📊 What This Means:
                        </h4>
                        {result?.prediction === 'Fake' ? (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            The words marked with ❌ <strong>red indicators</strong> are commonly found in fake news articles. 
                            These may include sensational language, exaggerated claims, or patterns typical of misinformation. 
                            The more negative the percentage, the stronger the fake news signal.
                          </p>
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            The words marked with ✅ <strong>green indicators</strong> are commonly found in legitimate news articles. 
                            These typically include factual language, professional terminology, and patterns consistent with 
                            verified journalism. The higher the positive percentage, the stronger the real news signal.
                          </p>
                        )}
                      </div>

                      {/* Model Info */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          🤖 AI Model Details:
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Model Type:</span>
                            <p className="font-medium text-gray-900 dark:text-white">Logistic Regression</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Feature Extraction:</span>
                            <p className="font-medium text-gray-900 dark:text-white">TF-IDF Vectorizer</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Explainer:</span>
                            <p className="font-medium text-gray-900 dark:text-white">LIME Algorithm</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Training Data:</span>
                            <p className="font-medium text-gray-900 dark:text-white">WELFake (72,095 articles)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Classify
