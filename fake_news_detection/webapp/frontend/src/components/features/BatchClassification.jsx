import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Download,
  AlertCircle,
  FileUp,
  Trash2
} from 'lucide-react'
import { newsService } from '../../services/newsService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { ResultBadge } from '../ui/ResultBadge'
import { PageTransition, StaggerContainer, StaggerItem } from '../animations'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function BatchClassification() {
  const [files, setFiles] = useState([])
  const [articles, setArticles] = useState([])
  const [results, setResults] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState('upload') // 'upload' | 'results'

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const validArticles = results.data
            .filter(row => row.text || row.content || row.article)
            .map((row, index) => ({
              id: index,
              title: row.title || row.headline || `Article ${index + 1}`,
              text: row.text || row.content || row.article,
              status: 'pending'
            }))
          
          if (validArticles.length === 0) {
            toast.error('No valid articles found. CSV must have "text", "content", or "article" column.')
            return
          }
          
          setArticles(validArticles)
          setFiles([file])
          toast.success(`Loaded ${validArticles.length} articles from CSV`)
        },
        error: (error) => {
          toast.error('Failed to parse CSV file')
          console.error(error)
        }
      })
    } else {
      toast.error('Please upload a CSV file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  const processArticles = async () => {
    if (articles.length === 0) {
      toast.error('No articles to process')
      return
    }

    setIsProcessing(true)
    setMode('results')
    const newResults = []

    for (let i = 0; i < articles.length; i++) {
      setCurrentIndex(i)
      const article = articles[i]
      
      try {
        const response = await newsService.classify(article.text, article.title)
        newResults.push({
          ...article,
          status: 'completed',
          prediction: response.prediction,
          confidence: response.confidence
        })
      } catch (error) {
        newResults.push({
          ...article,
          status: 'error',
          error: error.message
        })
      }
      
      setResults([...newResults])
    }

    setIsProcessing(false)
    toast.success('Batch classification complete!')
  }

  const exportResults = () => {
    const csv = Papa.unparse(results.map(r => ({
      title: r.title,
      text: r.text.substring(0, 200) + '...',
      prediction: r.prediction || 'Error',
      confidence: r.confidence ? `${(r.confidence * 100).toFixed(2)}%` : 'N/A',
      status: r.status
    })))

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'classification_results.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported!')
  }

  const reset = () => {
    setFiles([])
    setArticles([])
    setResults([])
    setCurrentIndex(0)
    setMode('upload')
    setIsProcessing(false)
  }

  const progress = articles.length > 0 
    ? Math.round((results.length / articles.length) * 100) 
    : 0

  const stats = {
    total: results.length,
    real: results.filter(r => r.prediction === 'Real').length,
    fake: results.filter(r => r.prediction === 'Fake').length,
    errors: results.filter(r => r.status === 'error').length
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
          >
            <FileUp className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Batch Classification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload a CSV file with multiple articles for bulk classification
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'upload' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Upload Zone */}
              <Card className="mb-6">
                <Card.Body className="p-8">
                  <div
                    {...getRootProps()}
                    className={clsx(
                      'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300',
                      isDragActive 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <input {...getInputProps()} />
                    <motion.div
                      animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                    >
                      <Upload className={clsx(
                        'h-8 w-8 transition-colors',
                        isDragActive ? 'text-primary-600' : 'text-gray-400'
                      )} />
                    </motion.div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      CSV must have a "text", "content", or "article" column
                    </p>
                  </div>
                </Card.Body>
              </Card>

              {/* Loaded Articles Preview */}
              {articles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Card>
                    <Card.Header className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <span className="font-semibold">
                          {articles.length} Articles Loaded
                        </span>
                      </div>
                      <button
                        onClick={reset}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {articles.slice(0, 5).map((article, index) => (
                          <div 
                            key={article.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {article.text.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                        {articles.length > 5 && (
                          <p className="text-center text-sm text-gray-500 py-2">
                            And {articles.length - 5} more articles...
                          </p>
                        )}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <Button 
                        fullWidth 
                        onClick={processArticles}
                        className="bg-gradient-to-r from-primary-600 to-purple-600"
                      >
                        <Loader2 className="mr-2 h-4 w-4" />
                        Start Classification
                      </Button>
                    </Card.Footer>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Progress Bar */}
              {isProcessing && (
                <Card className="mb-6">
                  <Card.Body className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Processing articles...
                      </span>
                      <span className="text-sm text-gray-500">
                        {results.length} / {articles.length}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-600 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Stats Cards */}
              {!isProcessing && results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StaggerContainer className="contents">
                    {[
                      { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-800' },
                      { label: 'Real', value: stats.real, color: 'bg-green-100 text-green-800' },
                      { label: 'Fake', value: stats.fake, color: 'bg-red-100 text-red-800' },
                      { label: 'Errors', value: stats.errors, color: 'bg-yellow-100 text-yellow-800' }
                    ].map((stat) => (
                      <StaggerItem key={stat.label}>
                        <Card className="text-center">
                          <Card.Body className="p-4">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {stat.value}
                            </span>
                            <span className={clsx(
                              'block mt-2 text-xs font-medium px-2 py-1 rounded-full',
                              stat.color
                            )}>
                              {stat.label}
                            </span>
                          </Card.Body>
                        </Card>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              {/* Results List */}
              <Card>
                <Card.Header className="flex justify-between items-center">
                  <span className="font-semibold">Classification Results</span>
                  {!isProcessing && results.length > 0 && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={exportResults}>
                        <Download className="mr-1 h-4 w-4" />
                        Export CSV
                      </Button>
                      <Button size="sm" variant="secondary" onClick={reset}>
                        New Batch
                      </Button>
                    </div>
                  )}
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    <AnimatePresence>
                      {results.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </p>
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {result.text.substring(0, 80)}...
                              </p>
                            </div>
                            {result.status === 'completed' ? (
                              <ResultBadge 
                                prediction={result.prediction}
                                confidence={result.confidence}
                                size="sm"
                              />
                            ) : result.status === 'error' ? (
                              <span className="flex items-center text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Error
                              </span>
                            ) : (
                              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default BatchClassification
