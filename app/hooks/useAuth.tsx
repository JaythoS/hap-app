"use client"

import React, { useState, useEffect, createContext, useContext, ReactNode } from "react"

export type UserType = "NORMAL" | "PROJE" | "SPONSOR"

export interface User {
  id: number
  adsoyad: string
  email: string
  userType: UserType
  profilFoto?: string | null
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setLoading(false)
        return
      }

      const response = await fetch(`/api/user/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Middleware için cookie'yi de set et
        document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400`
      } else {
        localStorage.removeItem('userId')
        // Cookie'yi de temizle
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('userId')
      // Cookie'yi de temizle
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('userId', data.user.id.toString())
        
        // Middleware için cookie'yi de set et
        document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=86400`
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('userId')
    
    // Cookie'yi de temizle
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ClientAuthProvider fonksiyonalitesini buraya taşıdık
export function ClientAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

 