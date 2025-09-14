import React from 'react'

// Reusable Button component
// Learning: Component composition, props, and variant patterns

function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) {
  // Base classes that apply to all buttons
  const baseClasses = "font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  // Size variants
  const sizeClasses = {
    small: 'px-3 py-2 text-sm rounded-lg',
    medium: 'px-4 py-3 text-base rounded-xl', 
    large: 'px-6 py-4 text-lg rounded-2xl'
  }
  
  // Style variants
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg disabled:opacity-50',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 shadow-md',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-md hover:shadow-md',
    danger: 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500 shadow-md',
    outline: 'bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 shadow-sm'
  }
  
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button