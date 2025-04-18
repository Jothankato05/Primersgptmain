import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('/api/login', { email, password })
          set({ user: response.data.user, token: response.data.token, isLoading: false })
        } catch (error) {
          set({ error: 'Login failed. Please check your credentials.', isLoading: false })
          throw error
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('/api/signup', { username, email, password })
          set({ user: response.data.user, token: response.data.token, isLoading: false })
        } catch (error) {
          set({ error: 'Signup failed. Please try again.', isLoading: false })
          throw error
        }
      },

      logout: () => {
        axios.post('/api/logout')
        set({ user: null, token: null })
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.put('/api/user/profile', data)
          set({ user: { ...response.data }, isLoading: false })
        } catch (error) {
          set({ error: 'Profile update failed.', isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
