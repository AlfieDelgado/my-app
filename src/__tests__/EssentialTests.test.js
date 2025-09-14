import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { supabase } from '../supabaseClient';

// Mock the supabase client
jest.mock('../supabaseClient', () => {
  const createMockSupabaseClient = require('./mocks/supabaseMock').default;
  return {
    supabase: createMockSupabaseClient(),
  };
});

// Mock the useTodos hook
jest.mock('../hooks/useTodos', () => ({
  useTodos: jest.fn(),
}));

const mockUseTodos = require('../hooks/useTodos').useTodos;

describe('Todo App - Essential User Workflows', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockTodos = [
    {
      id: '1',
      text: 'Test Todo 1',
      user_id: mockUser.id,
      completed: false,
      created_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      text: 'Test Todo 2',
      user_id: mockUser.id,
      completed: true,
      created_at: '2023-01-02T00:00:00.000Z',
    },
  ];

  const mockAddTodo = jest.fn();
  const mockUpdateTodo = jest.fn();
  const mockDeleteTodo = jest.fn();
  const mockToggleTodoCompletion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup authenticated user
    supabase.__setMockUser(mockUser);
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    // Setup todos
    mockUseTodos.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: jest.fn(),
    });
  });

  test('1. User can login and access protected todo list', async () => {
    // Test unauthenticated state
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    supabase.__setMockUser(null);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Should show login page
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    });

    // Test authenticated access
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    supabase.__setMockUser(mockUser);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    rerender(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Should show todo list
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    });
  });

  test('2. User can create, read, update, and delete todos', async () => {
    const user = userEvent.setup();
    
    // Mock successful operations
    mockAddTodo.mockResolvedValue({
      id: '3',
      text: 'New Todo',
      user_id: mockUser.id,
      completed: false,
      created_at: '2023-01-03T00:00:00.000Z',
    });
    
    mockUpdateTodo.mockResolvedValue({
      ...mockTodos[0],
      text: 'Updated Todo',
    });
    
    mockDeleteTodo.mockResolvedValue(true);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    });

    // Create todo
    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'New Todo');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(mockAddTodo).toHaveBeenCalledWith('New Todo');

    // Read todos (should display existing todos)
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

    // Update todo
    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editButton);
    
    const editInput = screen.getByDisplayValue('Test Todo 1');
    await user.clear(editInput);
    await user.type(editInput, 'Updated Todo');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockUpdateTodo).toHaveBeenCalledWith('1', { text: 'Updated Todo' });

    // Delete todo
    const deleteButton = screen.getAllByRole('button', { name: 'Delete' })[0];
    await user.click(deleteButton);
    expect(mockDeleteTodo).toHaveBeenCalledWith('1');
  });

  test('3. User can filter todos by status', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    });

    // Test All filter (default)
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

    // Test Active filter
    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Todo 2')).not.toBeInTheDocument();

    // Test Completed filter
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

    // Test back to All
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('4. User can signup for new account', async () => {
    // Start unauthenticated
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    supabase.__setMockUser(null);

    const user = userEvent.setup();
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Navigate to signup
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();

    // Test signup form exists
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
  });

  test('5. User can logout and session is cleared', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    });

    // Logout
    await user.click(screen.getByText('test'));
    await user.click(screen.getByText('Sign Out'));
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  test('6. App handles empty todo list state', async () => {
    // Mock empty todos
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Add a task to get started!')).toBeInTheDocument();
    });
  });

  test('7. App handles basic error states', async () => {
    // Mock todos error
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: 'Failed to fetch todos',
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading todos: Failed to fetch todos')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  test('8. App validates todo input (prevents empty todos)', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    });

    // Try to add empty todo
    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    
    // Should not call addTodo
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  test('9. User can toggle todo completion status', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    });

    // Toggle todo completion
    const todoText = screen.getByText('Test Todo 1');
    await user.click(todoText);
    expect(mockToggleTodoCompletion).toHaveBeenCalledWith('1', false);
  });

  test('10. App shows loading states appropriately', async () => {
    // Mock loading state
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: true,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading todos...')).toBeInTheDocument();
    });
  });
});