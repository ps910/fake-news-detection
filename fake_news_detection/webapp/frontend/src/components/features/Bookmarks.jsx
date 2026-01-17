import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bookmark, 
  Search, 
  Filter, 
  Trash2, 
  Tag,
  Download,
  Upload,
  X,
  Plus,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import { ResultBadge } from '../ui/ResultBadge'
import { PageTransition, StaggerContainer, StaggerItem, AnimatePresence as AP } from '../animations'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function Bookmarks() {
  const { 
    bookmarks, 
    removeBookmark, 
    updateNotes, 
    addTag, 
    removeTag,
    getAllTags,
    clearAll,
    exportBookmarks
  } = useBookmarkStore()
  
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [filterPrediction, setFilterPrediction] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [newTag, setNewTag] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const allTags = getAllTags()

  const filteredBookmarks = bookmarks.filter((b) => {
    // Search filter
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && 
        !b.text.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    // Tag filter
    if (selectedTag && !b.tags.includes(selectedTag)) {
      return false
    }
    // Prediction filter
    if (filterPrediction !== 'all' && b.prediction !== filterPrediction) {
      return false
    }
    return true
  })

  const handleExport = () => {
    const data = exportBookmarks()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bookmarks.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Bookmarks exported!')
  }

  const handleAddTag = (id) => {
    if (newTag.trim()) {
      addTag(id, newTag.trim())
      setNewTag('')
      toast.success('Tag added!')
    }
  }

  const handleClearAll = () => {
    clearAll()
    setShowClearConfirm(false)
    toast.success('All bookmarks cleared')
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Bookmark className="h-6 w-6 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bookmarks
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {bookmarks.length} saved classifications
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={bookmarks.length === 0}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => setShowClearConfirm(true)}
              disabled={bookmarks.length === 0}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Card.Body className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search bookmarks..."
                  icon={Search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Prediction Filter */}
              <select
                value={filterPrediction}
                onChange={(e) => setFilterPrediction(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Classifications</option>
                <option value="Real">Real Only</option>
                <option value="Fake">Fake Only</option>
              </select>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 mr-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Tags:
                </span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={clsx(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      selectedTag === tag
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Bookmarks List */}
        {filteredBookmarks.length > 0 ? (
          <StaggerContainer className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <StaggerItem key={bookmark.id}>
                <Card 
                  hover
                  className={clsx(
                    'transition-all duration-300',
                    expandedId === bookmark.id && 'ring-2 ring-primary-500'
                  )}
                >
                  <Card.Body className="p-4 sm:p-6">
                    {/* Main Content */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === bookmark.id ? null : bookmark.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={clsx(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              bookmark.prediction === 'Real' 
                                ? 'bg-green-100 dark:bg-green-900/50' 
                                : 'bg-red-100 dark:bg-red-900/50'
                            )}>
                              {bookmark.prediction === 'Real' 
                                ? <CheckCircle className="h-4 w-4 text-green-600" />
                                : <XCircle className="h-4 w-4 text-red-600" />
                              }
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {bookmark.title}
                            </h3>
                          </div>
                          <p className={clsx(
                            "text-gray-600 dark:text-gray-400 text-sm",
                            expandedId !== bookmark.id && "line-clamp-2"
                          )}>
                            {bookmark.text}
                          </p>
                        </div>
                        <ResultBadge 
                          prediction={bookmark.prediction}
                          confidence={bookmark.confidence}
                          size="sm"
                        />
                      </div>

                      {/* Tags & Date */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-wrap gap-2">
                          {bookmark.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {format(new Date(bookmark.bookmarkedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedId === bookmark.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                        >
                          {/* Add Tag */}
                          <div className="flex items-center space-x-2 mb-4">
                            <Input
                              placeholder="Add tag..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(bookmark.id)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => handleAddTag(bookmark.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Tags Management */}
                          {bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {bookmark.tags.map((tag) => (
                                <span 
                                  key={tag}
                                  className="flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded text-sm"
                                >
                                  {tag}
                                  <button
                                    onClick={() => removeTag(bookmark.id, tag)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          <textarea
                            placeholder="Add notes..."
                            value={bookmark.notes}
                            onChange={(e) => updateNotes(bookmark.id, e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={3}
                          />

                          {/* Actions */}
                          <div className="flex justify-end mt-4">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => {
                                removeBookmark(bookmark.id)
                                toast.success('Bookmark removed')
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card.Body>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <Card>
            <Card.Body className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
              >
                <Bookmark className="h-8 w-8 text-gray-400" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No bookmarks yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Save interesting classifications for later reference
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Clear Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Clear All Bookmarks?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will permanently delete all {bookmarks.length} bookmarks. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    fullWidth
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger" 
                    fullWidth
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default Bookmarks
