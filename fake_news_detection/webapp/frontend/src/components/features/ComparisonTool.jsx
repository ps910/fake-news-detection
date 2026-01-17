import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GitCompare, 
  FileText, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react'
import { newsService } from '../../services/newsService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import TextArea from '../ui/TextArea'
import Input from '../ui/Input'
import { ResultBadge, ConfidenceBar } from '../ui/ResultBadge'
import { PageTransition, SlideUp } from '../animations'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function ComparisonTool() {
  const [article1, setArticle1] = useState({ title: '', text: '' })
  const [article2, setArticle2] = useState({ title: '', text: '' })
  const [result1, setResult1] = useState(null)
  const [result2, setResult2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [compared, setCompared] = useState(false)

  const handleCompare = async () => {
    if (!article1.text.trim() || !article2.text.trim()) {
      toast.error('Please enter both articles')
      return
    }

    if (article1.text.length < 50 || article2.text.length < 50) {
      toast.error('Each article must have at least 50 characters')
      return
    }

    setLoading(true)
    setCompared(false)

    try {
      const [res1, res2] = await Promise.all([
        newsService.classify(article1.text, article1.title),
        newsService.classify(article2.text, article2.title)
      ])

      setResult1(res1)
      setResult2(res2)
      setCompared(true)
      toast.success('Comparison complete!')
    } catch (error) {
      toast.error('Failed to compare articles')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setArticle1({ title: '', text: '' })
    setArticle2({ title: '', text: '' })
    setResult1(null)
    setResult2(null)
    setCompared(false)
  }

  const swapArticles = () => {
    const temp = { ...article1 }
    setArticle1({ ...article2 })
    setArticle2(temp)
    
    const tempResult = result1
    setResult1(result2)
    setResult2(tempResult)
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg"
          >
            <GitCompare className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Article Comparison Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Compare two articles side by side to see their classifications
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Swap Button */}
          <motion.button
            onClick={swapArticles}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary-600"
          >
            <GitCompare className="h-5 w-5" />
          </motion.button>

          {/* Article 1 */}
          <SlideUp delay={0.1}>
            <Card className={clsx(
              'transition-all duration-300',
              result1 && (result1.prediction === 'Real' 
                ? 'ring-2 ring-green-500/50' 
                : 'ring-2 ring-red-500/50'
              )
            )}>
              <Card.Header className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  First Article
                </span>
                {result1 && (
                  <ResultBadge 
                    prediction={result1.prediction}
                    confidence={result1.confidence}
                    size="sm"
                  />
                )}
              </Card.Header>
              <Card.Body className="p-6 space-y-4">
                <Input
                  label="Title (Optional)"
                  placeholder="Enter article title..."
                  value={article1.title}
                  onChange={(e) => setArticle1(prev => ({ ...prev, title: e.target.value }))}
                />
                <TextArea
                  label="Article Text"
                  placeholder="Paste the first article here..."
                  rows={8}
                  value={article1.text}
                  onChange={(e) => setArticle1(prev => ({ ...prev, text: e.target.value }))}
                />
                <div className="text-sm text-gray-500">
                  {article1.text.length} characters
                </div>
                
                {result1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t border-gray-100 dark:border-gray-700"
                  >
                    <ConfidenceBar 
                      confidence={result1.confidence}
                      prediction={result1.prediction}
                    />
                  </motion.div>
                )}
              </Card.Body>
            </Card>
          </SlideUp>

          {/* Article 2 */}
          <SlideUp delay={0.2}>
            <Card className={clsx(
              'transition-all duration-300',
              result2 && (result2.prediction === 'Real' 
                ? 'ring-2 ring-green-500/50' 
                : 'ring-2 ring-red-500/50'
              )
            )}>
              <Card.Header className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Second Article
                </span>
                {result2 && (
                  <ResultBadge 
                    prediction={result2.prediction}
                    confidence={result2.confidence}
                    size="sm"
                  />
                )}
              </Card.Header>
              <Card.Body className="p-6 space-y-4">
                <Input
                  label="Title (Optional)"
                  placeholder="Enter article title..."
                  value={article2.title}
                  onChange={(e) => setArticle2(prev => ({ ...prev, title: e.target.value }))}
                />
                <TextArea
                  label="Article Text"
                  placeholder="Paste the second article here..."
                  rows={8}
                  value={article2.text}
                  onChange={(e) => setArticle2(prev => ({ ...prev, text: e.target.value }))}
                />
                <div className="text-sm text-gray-500">
                  {article2.text.length} characters
                </div>
                
                {result2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t border-gray-100 dark:border-gray-700"
                  >
                    <ConfidenceBar 
                      confidence={result2.confidence}
                      prediction={result2.prediction}
                    />
                  </motion.div>
                )}
              </Card.Body>
            </Card>
          </SlideUp>
        </div>

        {/* Action Buttons */}
        <SlideUp delay={0.3} className="mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleCompare}
              loading={loading}
              disabled={article1.text.length < 50 || article2.text.length < 50}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 min-w-[200px]"
            >
              <GitCompare className="mr-2 h-5 w-5" />
              Compare Articles
            </Button>
            
            {compared && (
              <Button
                size="lg"
                variant="outline"
                onClick={reset}
              >
                Start Over
              </Button>
            )}
          </div>
        </SlideUp>

        {/* Comparison Summary */}
        {compared && result1 && result2 && (
          <SlideUp delay={0.4} className="mt-8">
            <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <Card.Body className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Comparison Summary
                </h3>
                
                <div className="flex items-center justify-center space-x-8">
                  {/* Article 1 Summary */}
                  <div className="text-center">
                    <div className={clsx(
                      'w-20 h-20 rounded-full flex items-center justify-center mb-3 mx-auto',
                      result1.prediction === 'Real' 
                        ? 'bg-green-100 dark:bg-green-900/50' 
                        : 'bg-red-100 dark:bg-red-900/50'
                    )}>
                      {result1.prediction === 'Real' 
                        ? <CheckCircle className="h-10 w-10 text-green-600" />
                        : <XCircle className="h-10 w-10 text-red-600" />
                      }
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Article 1</p>
                    <p className={clsx(
                      'text-lg font-bold',
                      result1.prediction === 'Real' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {result1.prediction}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(result1.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>

                  {/* VS */}
                  <div className="text-4xl font-bold text-gray-300 dark:text-gray-600">
                    VS
                  </div>

                  {/* Article 2 Summary */}
                  <div className="text-center">
                    <div className={clsx(
                      'w-20 h-20 rounded-full flex items-center justify-center mb-3 mx-auto',
                      result2.prediction === 'Real' 
                        ? 'bg-green-100 dark:bg-green-900/50' 
                        : 'bg-red-100 dark:bg-red-900/50'
                    )}>
                      {result2.prediction === 'Real' 
                        ? <CheckCircle className="h-10 w-10 text-green-600" />
                        : <XCircle className="h-10 w-10 text-red-600" />
                      }
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Article 2</p>
                    <p className={clsx(
                      'text-lg font-bold',
                      result2.prediction === 'Real' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {result2.prediction}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(result2.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                </div>

                {/* Verdict */}
                {result1.prediction !== result2.prediction && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"
                  >
                    <div className="flex items-center justify-center space-x-2 text-yellow-700 dark:text-yellow-400">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">
                        These articles have different classifications!
                      </span>
                    </div>
                  </motion.div>
                )}
              </Card.Body>
            </Card>
          </SlideUp>
        )}
      </div>
    </PageTransition>
  )
}

export default ComparisonTool
