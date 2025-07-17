import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Profile, AuthContextType } from './types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('[AuthContext] getInitialSession:', { session, error });
        if (error) {
          console.error('[AuthContext] Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          console.log('[AuthContext] setSession/setUser:', { session, user: session?.user });
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.email)
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      console.log('[AuthContext] onAuthStateChange setSession/setUser:', { session, user: session?.user });
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      console.log('[AuthContext] fetchProfile result:', { profile, error });
      if (error) {
        console.error('[AuthContext] Error fetching profile:', error)
        if (error.code === 'PGRST116') {
          console.log('[AuthContext] Profile not found, creating new profile...')
          const { data: user } = await supabase.auth.getUser()
          if (user.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: user.user.email!,
                full_name: user.user.user_metadata?.full_name || user.user.email,
                role: 'employee',
                is_active: true
              })
              .select()
              .single()
            console.log('[AuthContext] Profile creation result:', { newProfile, createError });
            if (createError) {
              console.error('[AuthContext] Error creating profile:', createError)
            } else {
              setProfile(newProfile)
              console.log('[AuthContext] Profile created successfully:', newProfile)
            }
          }
        }
      }
      if (profile) {
        console.log('[AuthContext] Profile loaded:', profile)
        setProfile(profile)
      } else {
        console.warn('[AuthContext] No profile loaded after fetchProfile')
      }
    } catch (error) {
      console.error('[AuthContext] Error in fetchProfile:', error)
    } finally {
      setLoading(false)
      console.log('[AuthContext] setLoading(false) in fetchProfile')
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: Record<string, unknown>) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role || 'employee'
          },
        },
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setProfile(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const promoteToSuperAdmin = async (email: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_super_admin', {
        user_email: email
      })
      
      if (!error) {
        // Refresh profile if it's the current user
        if (user?.email === email) {
          await fetchProfile(user.id)
        }
      }
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    promoteToSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}