import React, { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

function SignUp({ onToggleMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { signUp, signInWithOAuth } = useAuth()

  const handleOAuthSignIn = async (provider) => {
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Check if email is provided
    if (!email) {
      console.log('Email is required')
      setError('Email is required')
      return
    }
    
    console.log('Form validation - password match check')
    if (password !== confirmPassword) {
      console.log('Passwords do not match')
      setError('Passwords do not match')
      return
    }
    
    console.log('Form validation - password length check')
    if (password.length < 6) {
      console.log('Password too short')
      setError('Password must be at least 6 characters')
      return
    }
    
    console.log('Form validation passed, setting loading to true')
    setLoading(true)
    
    try {
      console.log('Calling signUp function with email:', email)
      await signUp(email, password)
      console.log('signUp function completed successfully')
      setSuccess(true)
      setLoading(false) // Set loading to false immediately after success
    } catch (err) {
      console.error('Error in signUp:', err)
      setError(err.message || 'Failed to sign up')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-indigo-800">Create Your Account</h1>
        
        {success ? (
          <div className="w-full text-center">
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              <p className="font-medium">Registration successful!</p>
              <p className="text-sm mt-2">Please check your email to verify your account before signing in.</p>
            </div>
            <button
              onClick={onToggleMode}
              className="py-3 px-6 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="w-full p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
            
            <div className="w-full flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleOAuthSignIn('github')}
                  className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
            
            <div className="w-full text-center text-gray-600">
              <p>
                Already have an account?{' '}
                <button
                  onClick={onToggleMode}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SignUp