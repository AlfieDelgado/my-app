import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import Login from './components/Login'
import SignUp from './components/SignUp'
import AuthButton from './components/AuthButton'
import ProtectedRoute from './components/ProtectedRoute'
import TodoList from './components/TodoList'

function TodoApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-8">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-800">My Todos</h1>
          <AuthButton />
        </div>
        <TodoList showTitle={false} />
      </div>
    </div>
  )
}

function AuthWrapper() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const navigate = useNavigate()
  const location = useLocation()
  
  // Set authMode based on current path when component mounts
  useEffect(() => {
    if (!loading && !user) {
      if (location.pathname === '/signup') {
        setAuthMode('signup')
      } else {
        setAuthMode('login')
      }
    }
  }, [loading, user, location.pathname])
  
  // Navigate to the appropriate route when authMode changes
  useEffect(() => {
    if (!loading && !user) {
      if (authMode === 'signup') {
        navigate('/signup')
      } else {
        navigate('/login')
      }
    }
  }, [authMode, loading, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-indigo-800 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> :
        <Login onToggleMode={() => setAuthMode('signup')} />
      } />
      <Route path="/signup" element={
        user ? <Navigate to="/" replace /> :
        <SignUp onToggleMode={() => setAuthMode('login')} />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <TodoApp />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  )
}

export default App
