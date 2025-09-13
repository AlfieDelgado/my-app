import { useState } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState('all')

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      setTodos([
        ...todos,
        { id: Date.now(), text: inputValue, completed: false }
      ])
      setInputValue('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const startEditing = (id, text) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = (id) => {
    if (editText.trim() !== '') {
      setTodos(
        todos.map(todo =>
          todo.id === id ? { ...todo, text: editText } : todo
        )
      )
      cancelEditing()
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
      addTodo()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 grid place-items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-indigo-800">Todo List</h1>
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
          onClick={addTodo}
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
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
                  autoFocus
                />
                <div className="flex gap-4 ml-4">
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
              </>
            ) : (
              <>
                <span
                  onClick={() => toggleTodo(todo.id)}
                  className={`cursor-pointer flex-1 text-left text-lg font-medium transition-all duration-200 ${
                    todo.completed
                      ? 'line-through text-indigo-300'
                      : 'text-indigo-900 hover:text-indigo-700'
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-4 ml-4">
                  <button
                    onClick={() => startEditing(todo.id, todo.text)}
                    className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-600 font-medium hover:bg-indigo-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
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
      </div>
    </div>
  )
}

export default App
