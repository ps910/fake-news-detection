import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'system'
      actualTheme: 'light',
      
      // Alias for components that use effectiveTheme
      get effectiveTheme() {
        return get().actualTheme
      },

      setTheme: (theme) => {
        set({ theme })
        get().applyTheme()
      },

      toggleTheme: () => {
        const current = get().actualTheme
        const next = current === 'light' ? 'dark' : 'light'
        set({ theme: next })
        get().applyTheme()
      },

      applyTheme: () => {
        const { theme } = get()
        let actualTheme = theme

        if (theme === 'system') {
          actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        }

        set({ actualTheme })

        if (actualTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      initTheme: () => {
        get().applyTheme()

        // Listen for system theme changes
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', () => {
            if (get().theme === 'system') {
              get().applyTheme()
            }
          })
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
