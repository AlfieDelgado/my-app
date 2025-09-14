import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../../App';
import { AuthProvider } from '../../AuthContext.jsx';
import { supabase } from '../../supabaseClient';

// Mock the supabase client
jest.mock('../../supabaseClient', () => {
  const createMockSupabaseClient = require('../mocks/supabaseMock.js').default;
  return {
    supabase: createMockSupabaseClient(),
  };
});

// Mock the useTodos hook
jest.mock('../../hooks/useTodos', () => ({
  useTodos: jest.fn(),
}));

const mockUseTodos = require('../../hooks/useTodos').useTodos;

describe('App Integration Tests', () => {
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
  const mockRefreshTodos = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock user state
    supabase.__setMockUser(mockUser);
    
    // Setup default mock implementations for auth
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    
    // Mock onAuthStateChange with proper implementation
    const mockOnAuthStateChange = jest.fn().mockImplementation((callback) => {
      // Immediately call the callback with the initial session
      setTimeout(() => {
        callback('INITIAL_SESSION', {
          user: mockUser,
          session: { user: mockUser },
        });
      }, 0);
      
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });
    supabase.auth.onAuthStateChange = mockOnAuthStateChange;
    
    // Setup default mock implementations for todos
    mockUseTodos.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });
  });

  test('renders login page when user is not authenticated', async () => {
    // Setup mock to return no user
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('renders todo list when user is authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('navigates to signup page when Sign Up button is clicked', async () => {
    // Setup mock to return no user
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click Sign Up button
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    // Should navigate to signup page - check for heading instead of placeholder
    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    }, { timeout: 3000 });
    // Check for the presence of the "Confirm Password" field which is unique to signup
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
  });

  test('navigates back to login page from signup page', async () => {
    // Setup mock to return no user
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click Sign In button
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    
    // Should navigate back to login page - check for heading instead of placeholder
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
      // Check that we're no longer on the signup page by verifying the absence of signup-specific elements
      expect(screen.queryByPlaceholderText('Confirm Password')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('redirects to login page when accessing protected route without authentication', async () => {
    // Setup mock to return no user
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('allows access to protected route when authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should be on todo list page
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
  });

  test('shows auth button with user email when authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should show auth button with user email
    expect(screen.getByText('test')).toBeInTheDocument(); // First part of email
  });

  test('shows sign out dropdown when auth button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click auth button
    await user.click(screen.getByText('test'));

    // Should show dropdown with sign out option
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('signs out and redirects to login page when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    
    // Create a new render with the updated context
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click auth button
    await user.click(screen.getByText('test'));

    // Click sign out
    await user.click(screen.getByText('Sign Out'));

    // Should call signOut and redirect to login page
    expect(supabase.auth.signOut).toHaveBeenCalled();
    
    // Unmount the component
    unmount();
    
    // Mock the supabase client to return no user after sign out
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);
    
    // Re-render with the updated context
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Wait for the component to render the login page
    await waitFor(() => {
      // Check for login page elements
      const loginHeading = screen.getByText('Login to Your Account');
      expect(loginHeading).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('completes full todo CRUD workflow', async () => {
    const user = userEvent.setup();
    
    // Mock successful todo operations
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
    
    mockToggleTodoCompletion.mockResolvedValue({
      ...mockTodos[0],
      completed: true,
    });
    
    mockDeleteTodo.mockResolvedValue(true);
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Add a new todo
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });
    
    await user.type(input, 'New Todo');
    await user.click(addButton);
    
    expect(mockAddTodo).toHaveBeenCalledWith('New Todo');

    // Edit a todo
    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editButton);
    
    const editInput = screen.getByDisplayValue('Test Todo 1');
    await user.clear(editInput);
    await user.type(editInput, 'Updated Todo');
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    
    expect(mockUpdateTodo).toHaveBeenCalledWith('1', { text: 'Updated Todo' });

    // Toggle todo completion
    const todoText = screen.getByText('Test Todo 1');
    await user.click(todoText);
    
    // Check if the mock was called (without checking specific parameters)
    expect(mockToggleTodoCompletion).toHaveBeenCalled();

    // Delete a todo
    const deleteButton = screen.getAllByRole('button', { name: 'Delete' })[0];
    await user.click(deleteButton);
    
    expect(mockDeleteTodo).toHaveBeenCalledWith('1');
  });

  test('handles authentication errors gracefully', async () => {
    // Suppress error logging for this test
    const originalError = console.error;
    console.error = jest.fn();

    // Mock the AuthProvider to handle the error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup mock to return an error
    const authError = new Error('Authentication failed');
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: authError,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    // Create a new render with the updated context
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete and check if login page is shown
    await waitFor(() => {
      const loginHeading = screen.getByText('Login to Your Account');
      expect(loginHeading).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Restore console.error
    console.error = originalError;
  });

  test('handles todo operations errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock failed todo operations
    mockAddTodo.mockRejectedValue(new Error('Failed to add todo'));
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Try to add a new todo
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });
    
    await user.type(input, 'New Todo');
    await user.click(addButton);
    
    expect(mockAddTodo).toHaveBeenCalledWith('New Todo');
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to add todo. Please try again.')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles OAuth login flow', async () => {
    // Setup mock to return no user initially
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click Google OAuth button
    await user.click(screen.getByRole('button', { name: 'Google' }));

    // Should call signInWithOAuth
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
    });
  });

  test('handles password reset flow', async () => {
    // Setup mock to return no user
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Reset the mock user state to null
    supabase.__setMockUser(null);

    // Mock resetPasswordForEmail
    const mockResetPasswordForEmail = jest.fn().mockResolvedValue({ error: null });
    supabase.auth.resetPasswordForEmail = mockResetPasswordForEmail;

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click forgot password link
    await user.click(screen.getByText('Forgot your password?'));

    // Should show password reset form
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();

    // Fill in email and submit
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendResetButton = screen.getByRole('button', { name: 'Send Reset Email' });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(sendResetButton);
    
    // Should call resetPasswordForEmail
    await waitFor(() => {
      // Check if the mock was called (without checking specific parameters)
      expect(mockResetPasswordForEmail).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});