import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '../../components/TodoList';
import { AuthProvider, AuthContext } from '../../AuthContext.jsx';
import { supabase } from '../../supabaseClient';

// Mock the supabase client
jest.mock('../../supabaseClient');

// Mock the useTodos hook
jest.mock('../../hooks/useTodos', () => ({
  useTodos: jest.fn(),
}));

const mockUseTodos = require('../../hooks/useTodos').useTodos;

// Create a mock user for authenticated tests
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
};

// Create a wrapper component with authenticated user
const AuthenticatedTodoList = ({ children }) => {
  const authValue = {
    user: mockUser,
    session: {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    },
    loading: false,
    signUp: jest.fn(),
    signIn: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('TodoList Component', () => {
  const mockTodos = [
    {
      id: '1',
      text: 'Test Todo 1',
      user_id: 'test-user-id',
      completed: false,
      created_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      text: 'Test Todo 2',
      user_id: 'test-user-id',
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
    
    // Setup default mock implementations
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

  test('renders todo list correctly', () => {
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
    
    // Check if todos are rendered
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('calls addTodo when Add button is clicked with valid input', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    expect(mockAddTodo).toHaveBeenCalledWith('New Todo');
  });

  test('calls addTodo when Enter key is pressed with valid input', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const input = screen.getByPlaceholderText('Add a new task...');

    await user.type(input, 'New Todo{enter}');

    expect(mockAddTodo).toHaveBeenCalledWith('New Todo');
  });

  test('does not call addTodo when input is empty', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, '   ');
    await user.click(addButton);

    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  test('filters todos when filter buttons are clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    // Initially all todos should be visible
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

    // Click Active button
    await user.click(screen.getByRole('button', { name: 'Active' }));
    
    // Only active todo should be visible
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Todo 2')).not.toBeInTheDocument();

    // Click Completed button
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    
    // Only completed todo should be visible
    expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

    // Click All button
    await user.click(screen.getByRole('button', { name: 'All' }));
    
    // All todos should be visible again
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('calls toggleTodoCompletion when a todo is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const todoText = screen.getByText('Test Todo 1');
    await user.click(todoText);

    expect(mockToggleTodoCompletion).toHaveBeenCalledWith('1', false);
  });

  test('enters edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editButton);

    // Should show input field with todo text
    const editInput = screen.getByDisplayValue('Test Todo 1');
    expect(editInput).toBeInTheDocument();
    
    // Should show Save and Cancel buttons
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('calls updateTodo when Save button is clicked in edit mode', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    // Enter edit mode
    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editButton);

    // Update text and save
    const editInput = screen.getByDisplayValue('Test Todo 1');
    await user.clear(editInput);
    await user.type(editInput, 'Updated Todo');
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(mockUpdateTodo).toHaveBeenCalledWith('1', { text: 'Updated Todo' });
  });

  test('exits edit mode when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    // Enter edit mode
    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editButton);

    // Update text
    const editInput = screen.getByDisplayValue('Test Todo 1');
    await user.clear(editInput);
    await user.type(editInput, 'Updated Todo');
    
    // Cancel edit
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // Should show original todo text
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(mockUpdateTodo).not.toHaveBeenCalled();
  });

  test('calls deleteTodo when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const deleteButton = screen.getAllByRole('button', { name: 'Delete' })[0];
    await user.click(deleteButton);

    expect(mockDeleteTodo).toHaveBeenCalledWith('1');
  });

  test('shows loading state when loading is true', () => {
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: true,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });

    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Add a new task...')).not.toBeInTheDocument();
  });

  test('shows error state when error is present', () => {
    const errorMessage = 'Failed to fetch todos';
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: errorMessage,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });

    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    expect(screen.getByText(`Error loading todos: ${errorMessage}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  test('calls refreshTodos when Retry button is clicked in error state', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to fetch todos';
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: errorMessage,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });

    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await user.click(retryButton);

    expect(mockRefreshTodos).toHaveBeenCalled();
  });

  test('shows empty state message when there are no todos', () => {
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });

    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    expect(screen.getByText('No tasks yet. Add a task to get started!')).toBeInTheDocument();
  });

  test('shows filtered empty state message when there are no todos matching the filter', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    // Initially all todos should be visible
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

    // Click Active button - should show active todos
    await user.click(screen.getByRole('button', { name: 'Active' }));
    
    // Only active todo should be visible
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Todo 2')).not.toBeInTheDocument();

    // Now mock todos to have only completed todos
    mockUseTodos.mockReturnValue({
      todos: [mockTodos[1]], // Only completed todo
      loading: false,
      error: null,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });

    // Re-render with new todos using rerender
    rerender(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    // Click Active button - should show empty state for active todos
    await user.click(screen.getAllByRole('button', { name: 'Active' })[0]);
    
    expect(screen.getByText('No active tasks.')).toBeInTheDocument();
  });

  test('shows operation error when addTodo fails', async () => {
    const user = userEvent.setup();
    const operationError = 'Failed to add todo. Please try again.';
    
    // Mock addTodo to throw an error
    const mockAddTodoWithError = jest.fn().mockRejectedValue(new Error(operationError));
    
    mockUseTodos.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      addTodo: mockAddTodoWithError,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoCompletion: mockToggleTodoCompletion,
      refreshTodos: mockRefreshTodos,
    });

    render(
      <AuthenticatedTodoList>
        <TodoList />
      </AuthenticatedTodoList>
    );

    // Try to add a new todo which will fail
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(operationError)).toBeInTheDocument();
    });
  });
});