import React from 'react'
import Button from './Button.jsx'

// TodoItem component optimized with React.memo
// Learning: React performance optimization, memoization, and component composition

const TodoItem = React.memo(({ 
  todo, 
  isEditing, 
  editText, 
  onToggle, 
  onDelete, 
  onEditStart, 
  onEditSave, 
  onEditCancel, 
  onEditTextChange 
}) => {

  if (isEditing) {
    return (
      <li className="flex justify-between items-center p-5 rounded-xl shadow-sm transition-all duration-200 bg-white hover:shadow-md border border-indigo-100">
        <div className="flex flex-col gap-3 w-full">
          <input
            type="text"
            value={editText}
            onChange={onEditTextChange}
            className="w-full p-4 rounded-xl border-2 border-indigo-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent shadow-sm transition-all duration-200"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button 
              onClick={() => onEditSave(todo.id)}
              variant="success"
              size="small"
            >
              Save
            </Button>
            <Button 
              onClick={onEditCancel}
              variant="secondary"
              size="small"
            >
              Cancel
            </Button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className={`flex justify-between items-center p-5 rounded-xl shadow-sm transition-all duration-200 ${
      todo.completed
        ? 'bg-indigo-50 opacity-80'
        : 'bg-white hover:shadow-md border border-indigo-100'
    }`}>
      <div className="flex items-center w-full">
        <span
          onClick={() => onToggle(todo.id, todo.completed)}
          className={`cursor-pointer flex-1 text-left text-lg font-medium transition-all duration-200 ${
            todo.completed
              ? 'line-through text-indigo-300'
              : 'text-indigo-900 hover:text-indigo-700'
          }`}
        >
          {todo.text}
        </span>
        <div className="flex gap-3 ml-4">
          <Button
            onClick={() => onEditStart(todo.id, todo.text)}
            variant="outline"
            size="small"
          >
            Edit
          </Button>
          <Button
            onClick={() => onDelete(todo.id)}
            variant="danger"
            size="small"
          >
            Delete
          </Button>
        </div>
      </div>
    </li>
  )
})

export default TodoItem