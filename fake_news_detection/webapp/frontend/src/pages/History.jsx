import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { History as HistoryIcon, Trash2, Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { newsService } from '../services/newsService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { ResultBadge } from '../components/ui/ResultBadge'
import { LoadingSpinner, LoadingCard } from '../components/ui/Loading'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function History() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [filter, setFilter] = useState('')
  
  // Get initial filter from URL params
  const urlFilter = searchParams.get('filter')
  const [predictionFilter, setPredictionFilter] = useState(urlFilter || 'all')
  const [selectedItems, setSelectedItems] = useState([])
  const [expandedItem, setExpandedItem] = useState(null)

  // Update filter when URL changes
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam && ['Real', 'Fake'].includes(filterParam)) {
      setPredictionFilter(filterParam)
    } else if (!filterParam) {
      setPredictionFilter('all')
    }
  }, [searchParams])

  // Update URL when filter changes
  const handlePredictionFilterChange = (newFilter) => {
    setPredictionFilter(newFilter)
    if (newFilter === 'all') {
      searchParams.delete('filter')
    } else {
      searchParams.set('filter', newFilter)
    }
    setSearchParams(searchParams)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  useEffect(() => {
    fetchHistory()
  }, [pagination.page, predictionFilter])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(predictionFilter !== 'all' && { prediction: predictionFilter })
      }
      const response = await newsService.getHistory(params)
      setHistory(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }))
    } catch (error) {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classification?')) return
    
    try {
      await newsService.deleteClassification(id)
      toast.success('Classification deleted')
      fetchHistory()
    } catch (error) {
      toast.error('Failed to delete classification')
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL classifications? This cannot be undone.')) return
    
    try {
      await newsService.deleteAllHistory()
      toast.success('All classifications deleted')
      setHistory([])
      setPagination(prev => ({ ...prev, total: 0, pages: 1, page: 1 }))
    } catch (error) {
      toast.error('Failed to delete classifications')
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const filteredHistory = history.filter(item => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      item.title?.toLowerCase().includes(searchTerm) ||
      item.text?.toLowerCase().includes(searchTerm)
    )
  })

  const getPageTitle = () => {
    if (predictionFilter === 'Real') return 'Real News History'
    if (predictionFilter === 'Fake') return 'Fake News History'
    return 'Classification History'
  }

  const getPageDescription = () => {
    if (predictionFilter === 'Real') return `Showing ${pagination.total} articles classified as Real News`
    if (predictionFilter === 'Fake') return `Showing ${pagination.total} articles classified as Fake News`
    return 'View and manage your past classifications'
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <HistoryIcon className="mr-3 h-8 w-8 text-primary-600" />
              {getPageTitle()}
              {predictionFilter !== 'all' && (
                <span className={clsx(
                  'ml-3 px-3 py-1 rounded-full text-sm font-medium',
                  predictionFilter === 'Real' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                )}>
                  {predictionFilter}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {getPageDescription()}
            </p>
          </div>
          {history.length > 0 && (
            <Button 
              variant="danger" 
              onClick={handleDeleteAll}
              className="mt-4 sm:mt-0"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Card.Body className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by title or content..."
                  icon={Search}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={predictionFilter}
                  onChange={(e) => handlePredictionFilterChange(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Results</option>
                  <option value="Real">Real Only</option>
                  <option value="Fake">Fake Only</option>
                </select>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* History List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <LoadingCard key={i} />)}
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card 
                key={item._id} 
                hover
                className="cursor-pointer"
                onClick={() => setExpandedItem(expandedItem === item._id ? null : item._id)}
              >
                <Card.Body className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate pr-4">
                          {item.title || 'Untitled Article'}
                        </h3>
                        <ResultBadge 
                          prediction={item.prediction} 
                          confidence={item.confidence}
                          size="sm"
                        />
                      </div>
                      
                      <p className={clsx(
                        "text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap",
                        expandedItem !== item._id && "line-clamp-2"
                      )}>
                        {item.text || item.textPreview || 'No content available'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item._id)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Expanded Content */}
                      {expandedItem === item._id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Contributing Words:
                          </h4>
                          {item.explanation && item.explanation.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.explanation.slice(0, 10).map((exp, idx) => (
                                <span
                                  key={idx}
                                  className={clsx(
                                    'px-2 py-1 rounded text-xs font-medium',
                                    exp.direction === 'Real' || exp.score > 0
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                                  )}
                                >
                                  {exp.word} ({exp.score > 0 ? '+' : ''}{(exp.score * 100).toFixed(1)}%)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              No explanation available. Use "Classify with Explanation" for detailed analysis.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <Card.Body className="p-12 text-center">
              <HistoryIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No classifications yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start classifying news articles to build your history
              </p>
              <Button onClick={() => window.location.href = '/classify'}>
                Classify Your First Article
              </Button>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  )
}

export default History
