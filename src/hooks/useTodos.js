import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { supabase } from '../supabaseClient'
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  subscribeToTodos
} from '../services/todoService'

export function useTodos() {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch todos when the component mounts or user changes
  const fetchTodosData = useCallback(async () => {
    if (!user) {
      setTodos([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await fetchTodos()
      setTodos(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching todos:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    fetchTodosData()

    let subscription
    if (user) {
      subscription = subscribeToTodos((payload) => {
        console.log('Real-time update received:', payload)
        
        // Only process updates for the current user's todos
        if (payload.new && payload.new.user_id !== user.id) return
        if (payload.old && payload.old.user_id !== user.id) return
        
        switch (payload.eventType) {
          case 'INSERT':
            setTodos(prev => [payload.new, ...prev])
            break
          case 'UPDATE':
            setTodos(prev =>
              prev.map(todo =>
                todo.id === payload.new.id ? payload.new : todo
              )
            )
            break
          case 'DELETE':
            setTodos(prev =>
              prev.filter(todo => todo.id !== payload.old.id)
            )
            break
          default:
            break
        }
      })
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [user, fetchTodosData])

  // Function to add a new todo
  const handleAddTodo = useCallback(async (text) => {
    try {
      const newTodo = await addTodo(text)
      // Update the state immediately instead of waiting for real-time subscription
      if (newTodo) {
        setTodos(prev => [newTodo, ...prev])
      }
      return newTodo
    } catch (err) {
      setError(err.message)
      console.error('Error adding todo:', err)
      throw err
    }
  }, [])

  // Function to update a todo
  const handleUpdateTodo = useCallback(async (id, updates) => {
    try {
      const updatedTodo = await updateTodo(id, updates)
      // Update the state immediately instead of waiting for real-time subscription
      if (updatedTodo) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          )
        )
      }
      return updatedTodo
    } catch (err) {
      setError(err.message)
      console.error('Error updating todo:', err)
      throw err
    }
  }, [])

  // Function to delete a todo
  const handleDeleteTodo = useCallback(async (id) => {
    try {
      await deleteTodo(id)
      // Update the state immediately instead of waiting for real-time subscription
      setTodos(prev => prev.filter(todo => todo.id !== id))
      return true
    } catch (err) {
      setError(err.message)
      console.error('Error deleting todo:', err)
      throw err
    }
  }, [])

  // Function to toggle todo completion
  const handleToggleTodoCompletion = useCallback(async (id, completed) => {
    try {
      const updatedTodo = await toggleTodoCompletion(id, completed)
      // Update the state immediately instead of waiting for real-time subscription
      if (updatedTodo) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          )
        )
      }
      return updatedTodo
    } catch (err) {
      setError(err.message)
      console.error('Error toggling todo completion:', err)
      throw err
    }
  }, [])

  return {
    todos,
    loading,
    error,
    addTodo: handleAddTodo,
    updateTodo: handleUpdateTodo,
    deleteTodo: handleDeleteTodo,
    toggleTodoCompletion: handleToggleTodoCompletion,
    refreshTodos: fetchTodosData
  }
}