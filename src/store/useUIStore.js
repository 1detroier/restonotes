import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * UI Store - manages transient UI state only.
 * Persisted to localStorage via zustand/middleware persist.
 * Business data lives in IndexedDB, NOT here.
 */
export const useUIStore = create(
  persist(
    (set) => ({
      // State
      activeTab: 'mesas',
      mesaCount: 14,
      modals: [],
      toasts: [],

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setMesaCount: (count) => set({ mesaCount: count }),

      addToast: (message, type = 'info') => {
        const id = crypto.randomUUID()
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }]
        }))
        // Auto-remove after 3 seconds
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
          }))
        }, 3000)
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        })),

      openModal: (modal) =>
        set((state) => ({
          modals: [...state.modals, modal]
        })),

      closeModal: () =>
        set((state) => ({
          modals: state.modals.slice(1)
        })),

      setModals: (fn) =>
        set((state) => ({
          modals: typeof fn === 'function' ? fn(state.modals) : fn
        }))
    }),
    {
      name: 'restonotes-ui',
      partialize: (state) => ({
        activeTab: state.activeTab,
        mesaCount: state.mesaCount
      })
    }
  )
)
