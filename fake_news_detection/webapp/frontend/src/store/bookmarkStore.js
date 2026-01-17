import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookmarkStore = create(
  persist(
    (set, get) => ({
      bookmarks: [],

      // Add bookmark
      addBookmark: (classification) => {
        const bookmark = {
          id: classification._id || Date.now().toString(),
          title: classification.title || 'Untitled',
          text: classification.text,
          prediction: classification.prediction,
          confidence: classification.confidence,
          explanation: classification.explanation,
          bookmarkedAt: new Date().toISOString(),
          tags: [],
          notes: ''
        }

        set((state) => ({
          bookmarks: [bookmark, ...state.bookmarks]
        }))

        return bookmark
      },

      // Remove bookmark
      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id)
        }))
      },

      // Check if bookmarked
      isBookmarked: (id) => {
        return get().bookmarks.some((b) => b.id === id)
      },

      // Update bookmark notes
      updateNotes: (id, notes) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, notes } : b
          )
        }))
      },

      // Add tag
      addTag: (id, tag) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, tags: [...new Set([...b.tags, tag])] } : b
          )
        }))
      },

      // Remove tag
      removeTag: (id, tag) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, tags: b.tags.filter((t) => t !== tag) } : b
          )
        }))
      },

      // Get bookmarks by prediction
      getByPrediction: (prediction) => {
        return get().bookmarks.filter((b) => b.prediction === prediction)
      },

      // Get bookmarks by tag
      getByTag: (tag) => {
        return get().bookmarks.filter((b) => b.tags.includes(tag))
      },

      // Get all tags
      getAllTags: () => {
        const tags = new Set()
        get().bookmarks.forEach((b) => b.tags.forEach((t) => tags.add(t)))
        return Array.from(tags)
      },

      // Clear all bookmarks
      clearAll: () => {
        set({ bookmarks: [] })
      },

      // Export bookmarks
      exportBookmarks: () => {
        return JSON.stringify(get().bookmarks, null, 2)
      },

      // Import bookmarks
      importBookmarks: (json) => {
        try {
          const imported = JSON.parse(json)
          if (Array.isArray(imported)) {
            set((state) => ({
              bookmarks: [...imported, ...state.bookmarks]
            }))
            return true
          }
          return false
        } catch {
          return false
        }
      }
    }),
    {
      name: 'bookmarks-storage',
    }
  )
)
