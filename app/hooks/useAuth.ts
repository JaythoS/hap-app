"use client"

import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { ProfileType } from '@prisma/client'
import { StateCreator } from 'zustand'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  profileType: ProfileType
  createdAt: Date
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  
  // Getters
  getUser: () => User | null
  getProfileType: () => ProfileType | null
  getFullName: () => string | null
  isLoggedIn: () => boolean
  getInitialRoute: () => string
}

// Sadece persist edilecek state'lerin tipi
interface AuthPersistedState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}

type AuthPersist = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState, AuthPersistedState>
) => StateCreator<AuthState>

const useAuth = create<AuthState>()(
  (persist as AuthPersist)(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      setUser: (user: User | null) => {
        console.log('Setting user:', user)
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      setAccessToken: (token: string | null) => {
        set({ accessToken: token })
      },

      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Giriş başarısız')
          }

          const data = await response.json()
          console.log('Login response:', data)
          
          if (!data.user || !data.user.profileType) {
            console.error('Invalid user data received:', data)
            throw new Error('Geçersiz kullanıcı verisi')
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
          })

          return data.user.profileType
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },

      // Getter methods
      getUser: () => {
        return get().user
      },

      getProfileType: () => {
        return get().user?.profileType || null
      },

      getFullName: () => {
        const user = get().user
        return user ? `${user.firstName} ${user.lastName}` : null
      },

      isLoggedIn: () => {
        return get().isAuthenticated
      },

      // Kullanıcı tipine göre başlangıç rotasını belirle
      getInitialRoute: () => {
        // Tüm kullanıcı tipleri için ana sayfa
        return '/mainPage'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState): AuthPersistedState => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuth 