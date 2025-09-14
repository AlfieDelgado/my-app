import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext()

// Check if we're in a test environment
const isTestEnvironment = process.env.NODE_ENV === 'test'

// Export the context for use in tests
export { AuthContext }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // In test environment, we still want to set up the auth state change listener
    // but we'll set loading to false immediately
    if (isTestEnvironment) {
      setLoading(false)
      
      // Don't set up a mock user by default in tests
      // Tests should control the user state through the supabase mock
      
      // Still set up the listener for tests that need to trigger auth state changes
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            // Use a timeout to ensure state updates are properly batched
            setTimeout(() => {
              setUser(session?.user || null)
              setSession(session)
            }, 0)
          }
        )
        
        return () => {
          if (sub) sub.unsubscribe()
        }
      }
      
      return
    }
    
    // Check for active session on load
    const getSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      // Batch state updates to prevent multiple renders
      setUser(session?.user || null)
      setSession(session)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    let subscription
    if (supabase) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // Batch state updates to prevent multiple renders
          setUser(session?.user || null)
          setSession(session)
          setLoading(false)
        }
      )
      subscription = sub
    }

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  // Sign up with email and password
  const signUp = async (email, password) => {
    console.log('signUp function called with email:', email)
    
    if (!supabase) {
      console.error('Supabase client is not initialized')
      throw new Error('Supabase client not initialized')
    }
    
    console.log('Calling supabase.auth.signUp')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign up error:', error)
      throw error
    }
    
    console.log('Sign up successful, response:', data)
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  // Sign in with OAuth provider
  const signInWithOAuth = async (provider) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    })
    if (error) throw error
  }

  // Sign out
  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Reset password
  const resetPassword = async (email) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}