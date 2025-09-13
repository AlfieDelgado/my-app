import { supabase } from '../supabaseClient'

// Check if supabase is initialized
const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
}

// Fetch all todos for the current user
export const fetchTodos = async () => {
  checkSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching todos:', error)
    throw error
  }
  
  return data
}

// Add a new todo
export const addTodo = async (text) => {
  checkSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        text,
        user_id: user.id,
        completed: false
      }
    ])
    .select()
  
  if (error) {
    console.error('Error adding todo:', error)
    throw error
  }
  
  return data[0]
}

// Update an existing todo
export const updateTodo = async (id, updates) => {
  checkSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
  
  if (error) {
    console.error('Error updating todo:', error)
    throw error
  }
  
  if (!data || data.length === 0) {
    throw new Error('Todo not found or access denied')
  }
  
  return data[0]
}

// Delete a todo
export const deleteTodo = async (id) => {
  checkSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    console.error('Error deleting todo:', error)
    throw error
  }
  
  return true
}

// Toggle the completed status of a todo
export const toggleTodoCompletion = async (id, completed) => {
  checkSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('todos')
    .update({ completed: !completed })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
  
  if (error) {
    console.error('Error toggling todo completion:', error)
    throw error
  }
  
  if (!data || data.length === 0) {
    throw new Error('Todo not found or access denied')
  }
  
  return data[0]
}

// Set up real-time subscription for todos
export const subscribeToTodos = (callback) => {
  checkSupabase()
  
  const subscription = supabase
    .channel('todos-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todos'
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()
  
  return subscription
}