import React, { createContext, useContext, useEffect } from 'react'
import { apiClient, TokenManager, User, AuthResponse } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCurrentUser } from '@/lib/hooks/use-api'
import { AuthContextType } from './types'
import { useQueryClient } from '@tanstack/react-query'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, setLoading, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Use TanStack Query to fetch current user only when authenticated
  const isAuthenticated = TokenManager.isAuthenticated()
  const { data: userData, isLoading, error } = useCurrentUser({
    enabled: isAuthenticated,
    retry: false,
  } as Parameters<typeof useCurrentUser>[0])

  // Update Zustand store when user data changes
  useEffect(() => {
    if (userData?.data) {
      setUser(userData.data)
    } else if (error && isAuthenticated) {
      // Token might be invalid, clear it
      TokenManager.clearTokens()
      clearAuth()
    }
  }, [userData, error, setUser, clearAuth, isAuthenticated])

  // Update loading state
  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  useEffect(() => {
    // Listen for auth logout events
    const handleLogout = () => {
      clearAuth()
    }

    window.addEventListener('auth:logout', handleLogout)

    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [clearAuth])


  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const authResponse = await apiClient.login({ email, password })
      setUser(authResponse.user)
      return { error: null }
    } catch (error: unknown) {
      console.error('[AuthContext] Sign in error:', error)
      return { error: (error as Error).message || 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Record<string, unknown>) => {
    setLoading(true)
    try {
      const authResponse = await apiClient.register({
        email,
        password,
        fullName: userData.full_name as string || email,
        phone: userData.phone as string,
        position: userData.position as string,
        departmentId: userData.departmentId as string
      })
      setUser(authResponse.user)
      return { error: null }
    } catch (error: unknown) {
      console.error('[AuthContext] Sign up error:', error)
      return { error: (error as Error).message || 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('[AuthContext] Logout error:', error)
    } finally {
      // Clear all cached data
      queryClient.clear()
      // Clear auth state and persisted data
      clearAuth()
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const updatedUser = await apiClient.updateUser(user.id, updates)
      setUser(updatedUser)
      return { error: null }
    } catch (error: unknown) {
      console.error('[AuthContext] Update profile error:', error)
      return { error: (error as Error).message || 'Update failed' }
    }
  }

  const promoteToSuperAdmin = async (email: string) => {
    try {
      // This would need to be implemented in the backend
      // For now, just return an error indicating it's not implemented
      return { error: 'Super admin promotion not implemented yet' }
    } catch (error: unknown) {
      console.error('[AuthContext] Promote to super admin error:', error)
      return { error: (error as Error).message || 'Promotion failed' }
    }
  }

  const value = {
    user,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    promoteToSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}