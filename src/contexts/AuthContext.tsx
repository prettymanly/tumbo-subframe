"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  children: Child[]
  currentChildId?: string
}

interface Child {
  id: string
  name: string
  age: number
  description?: string
  learningSignature?: string
  currentClasses: string[]
  bookmarkedClasses: string[]
  recommendations: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  currentChild: Child | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  switchChild: (childId: string) => void
  updateChild: (childId: string, updates: Partial<Child>) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for development
  const mockUser: User = {
    id: '1',
    email: 'parent@example.com',
    name: 'Sarah Johnson',
    avatar: 'https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif',
    children: [
      {
        id: '1',
        name: 'Emma',
        age: 6,
        description: 'A curious and creative child who loves exploring new activities. She tends to be shy at first but warms up quickly with gentle encouragement.',
        learningSignature: 'Visual learner who thrives in small group settings with hands-on activities. Responds well to patient instructors and structured environments.',
        currentClasses: ['Creative Little Architects', 'Gentle Yoga for Kids'],
        bookmarkedClasses: ['Art Exploration', 'Nature Discovery', 'Music & Movement'],
        recommendations: ['Calm Art Studio', 'Small Group Drama', 'Nature-based Learning']
      },
      {
        id: '2', 
        name: 'Lucas',
        age: 8,
        description: 'An energetic and social child who loves sports and making new friends. He learns best through movement and interactive activities.',
        learningSignature: 'Kinesthetic learner who excels in active, social environments. Thrives with clear goals and friendly competition.',
        currentClasses: ['Soccer Skills', 'STEM Robotics'],
        bookmarkedClasses: ['Swimming Lessons', 'Basketball Basics', 'Science Lab'],
        recommendations: ['Team Sports', 'Active STEM', 'Leadership Skills']
      }
    ],
    currentChildId: '1'
  }

  useEffect(() => {
    // Simulate checking for existing auth session
    const checkAuth = async () => {
      try {
        // In a real app, this would check localStorage, cookies, or make an API call
        const savedAuth = localStorage.getItem('tumbo_auth')
        if (savedAuth) {
          const authData = JSON.parse(savedAuth)
          setUser(authData.user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Mock login - in real app would make API call
      if (email && password) {
        setUser(mockUser)
        localStorage.setItem('tumbo_auth', JSON.stringify({ user: mockUser }))
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      // Mock Google login - in real app would use OAuth
      setUser(mockUser)
      localStorage.setItem('tumbo_auth', JSON.stringify({ user: mockUser }))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithFacebook = async () => {
    setLoading(true)
    try {
      // Mock Facebook login - in real app would use OAuth
      setUser(mockUser)
      localStorage.setItem('tumbo_auth', JSON.stringify({ user: mockUser }))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      // Mock registration - in real app would make API call
      const newUser: User = {
        ...mockUser,
        email,
        name,
        children: [] // New users start with no children
      }
      setUser(newUser)
      localStorage.setItem('tumbo_auth', JSON.stringify({ user: newUser }))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tumbo_auth')
  }

  const switchChild = (childId: string) => {
    if (user) {
      const updatedUser = { ...user, currentChildId: childId }
      setUser(updatedUser)
      localStorage.setItem('tumbo_auth', JSON.stringify({ user: updatedUser }))
    }
  }

  const updateChild = (childId: string, updates: Partial<Child>) => {
    if (user) {
      const updatedChildren = user.children.map(child => 
        child.id === childId ? { ...child, ...updates } : child
      )
      const updatedUser = { ...user, children: updatedChildren }
      setUser(updatedUser)
      localStorage.setItem('tumbo_auth', JSON.stringify({ user: updatedUser }))
    }
  }

  const currentChild = user?.children.find(child => child.id === user.currentChildId) || null

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    currentChild,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    logout,
    switchChild,
    updateChild,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}



