import React, { useState } from 'react'
import { useTodos } from '../hooks/useTodos'

function TodoList({ showTitle = true }) {
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState('all')
  const [operationError, setOperationError] = useState(null)
  
  const { 
    todos, 
    loading, 
    error, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoCompletion,
    refreshTodos
  } = useTodos()

  const handleAddTodo = async () => {
    if (inputValue.trim() !== '') {
      try {
        setOperationError(null)
        await addTodo(inputValue)
        setInputValue('')
      } catch (err) {
        setOperationError('Failed to add todo. Please try again.')
      }
    }
  }

  const handleToggleTodo = async (id, completed) => {
    try {
      setOperationError(null)
      await toggleTodoCompletion(id, completed)
    } catch (err) {
      setOperationError('Failed to update todo. Please try again.')
    }
  }

  const handleDeleteTodo = async (id) => {
    try {
      setOperationError(null)
      await deleteTodo(id)
    } catch (err) {
      setOperationError('Failed to delete todo. Please try again.')
    }
  }

  const startEditing = (id, text) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = async (id) => {
    if (editText.trim() !== '') {
      try {
        setOperationError(null)
        await updateTodo(id, { text: editText })
        cancelEditing()
      } catch (err) {
        setOperationError('Failed to update todo. Please try again.')
      }
    }
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditText('')
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed
    } else if (filter === 'completed') {
      return todo.completed
    } else {
      return true
    }
  })

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-indigo-800 font-medium">Loading todos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 font-medium">Error loading todos: {error}</p>
        <button
          onClick={refreshTodos}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {operationError && (
        <div className="w-full p-3 bg-red-100 text-red-700 rounded-lg">
          {operationError}
        </div>
      )}
      
      <div className="flex w-full gap-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="flex-1 p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
        />
        <button
          onClick={handleAddTodo}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Add
        </button>
      </div>
      <div className="flex w-full gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm ${
            filter === 'active'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm ${
            filter === 'completed'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          Completed
        </button>
      </div>
      <ul className="list-none p-0 w-full flex flex-col gap-4">
        {filteredTodos.map(todo => (
          <li
            key={todo.id}
            className={`flex justify-between items-center p-5 rounded-xl shadow-sm transition-all duration-200 ${
              todo.completed
                ? 'bg-indigo-50 opacity-80'
                : 'bg-white hover:shadow-md border border-indigo-100'
            }`}
          >
            {editingId === todo.id ? (
              <div className="flex flex-col gap-3 w-full">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="px-4 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 rounded-xl bg-gray-400 text-white font-medium hover:bg-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center w-full">
                <span
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  className={`cursor-pointer flex-1 text-left text-lg font-medium transition-all duration-200 ${
                    todo.completed
                      ? 'line-through text-indigo-300'
                      : 'text-indigo-900 hover:text-indigo-700'
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-3 ml-4">
                  <button
                    onClick={() => startEditing(todo.id, todo.text)}
                    className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-600 font-medium hover:bg-indigo-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {filteredTodos.length === 0 && (
        <p className="text-indigo-400 italic text-lg font-medium py-6">
          {todos.length === 0
            ? 'No tasks yet. Add a task to get started!'
            : filter === 'active'
              ? 'No active tasks.'
              : filter === 'completed'
                ? 'No completed tasks.'
                : 'No tasks yet. Add a task to get started!'}
        </p>
      )}
    </>
  )
}

export default TodoList