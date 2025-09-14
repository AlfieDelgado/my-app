import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';
import { AuthProvider, AuthContext } from '../AuthContext.jsx';
import { supabase } from '../supabaseClient';
import * as todoService from '../services/todoService';

// Mock the todoService
jest.mock('../services/todoService');

// Mock the supabase client
jest.mock('../supabaseClient');

// Test component to wrap the hook with AuthProvider
const Wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useTodos', () => {
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

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    todoService.fetchTodos.mockResolvedValue(mockTodos);
    todoService.addTodo.mockResolvedValue(mockTodos[0]);
    todoService.updateTodo.mockResolvedValue(mockTodos[0]);
    todoService.deleteTodo.mockResolvedValue(true);
    todoService.toggleTodoCompletion.mockResolvedValue(mockTodos[0]);
    
    // Mock subscription
    const mockSubscription = {
      unsubscribe: jest.fn(),
    };
    todoService.subscribeToTodos.mockReturnValue(mockSubscription);
    
    // Mock supabase removeChannel
    supabase.removeChannel = jest.fn();
    
    // Mock supabase auth getSession and getUser
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  test('fetches todos on mount when user is authenticated', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Initially should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.todos).toEqual([]);

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    expect(todoService.fetchTodos).toHaveBeenCalled();
    expect(result.current.todos).toEqual(mockTodos);
  });

  test('does not fetch todos when user is not authenticated', async () => {
    // Create a custom wrapper that sets no user
    const UnauthenticatedWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: null,
          session: null,
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: UnauthenticatedWrapper });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(todoService.fetchTodos).not.toHaveBeenCalled();
    expect(result.current.todos).toEqual([]);
  });

  test('sets up real-time subscription when user is authenticated', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    expect(todoService.subscribeToTodos).toHaveBeenCalled();
  });

  test('responds to authentication state changes', async () => {
    // Create a wrapper that allows changing the user
    let currentUser = null;
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: currentUser,
          session: currentUser ? { user: currentUser } : null,
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result, rerender } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for loading to complete with no user
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(todoService.fetchTodos).not.toHaveBeenCalled();
    expect(result.current.todos).toEqual([]);

    // Change the user
    currentUser = mockUser;
    rerender();

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    expect(todoService.fetchTodos).toHaveBeenCalled();
    expect(result.current.todos).toEqual(mockTodos);
  });

  test('cleans up subscription on unmount', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const mockSubscription = {
      unsubscribe: jest.fn(),
    };
    todoService.subscribeToTodos.mockReturnValue(mockSubscription);

    // Make sure supabase.removeChannel is properly mocked
    const mockRemoveChannel = jest.fn();
    supabase.removeChannel = mockRemoveChannel;

    const { result, unmount } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Unmount the hook
    unmount();

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockSubscription);
  });

  test('handles real-time INSERT events', async () => {
    // Setup a mock callback function
    let realCallback;
    todoService.subscribeToTodos.mockImplementation((callback) => {
      // Store the callback for later use
      realCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Simulate INSERT event
    const newTodo = {
      id: '3',
      text: 'New Todo',
      user_id: mockUser.id,
      completed: false,
      created_at: '2023-01-03T00:00:00.000Z',
    };

    // Make sure the callback is defined
    expect(realCallback).toBeDefined();
    
    act(() => {
      realCallback({
        eventType: 'INSERT',
        new: newTodo,
        old: null,
      });
    });

    expect(result.current.todos).toEqual([newTodo, ...mockTodos]);
  });

  test('handles real-time UPDATE events', async () => {
    // Setup a mock callback function
    let realCallback;
    todoService.subscribeToTodos.mockImplementation((callback) => {
      // Store the callback for later use
      realCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Simulate UPDATE event
    const updatedTodo = {
      ...mockTodos[0],
      text: 'Updated Todo',
    };

    // Make sure the callback is defined
    expect(realCallback).toBeDefined();
    
    act(() => {
      realCallback({
        eventType: 'UPDATE',
        new: updatedTodo,
        old: mockTodos[0],
      });
    });

    expect(result.current.todos).toEqual([updatedTodo, mockTodos[1]]);
  });

  test('handles real-time DELETE events', async () => {
    // Setup a mock callback function
    let realCallback;
    todoService.subscribeToTodos.mockImplementation((callback) => {
      // Store the callback for later use
      realCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Simulate DELETE event
    // Make sure the callback is defined
    expect(realCallback).toBeDefined();
    
    act(() => {
      realCallback({
        eventType: 'DELETE',
        new: null,
        old: mockTodos[0],
      });
    });

    expect(result.current.todos).toEqual([mockTodos[1]]);
  });

  test('filters real-time events by user ID', async () => {
    // Setup a mock callback function
    let realCallback;
    todoService.subscribeToTodos.mockImplementation((callback) => {
      // Store the callback for later use
      realCallback = callback;
      return { unsubscribe: jest.fn() };
    });

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Simulate INSERT event for different user
    const otherUserTodo = {
      id: '3',
      text: 'Other User Todo',
      user_id: 'other-user-id',
      completed: false,
      created_at: '2023-01-03T00:00:00.000Z',
    };

    // Make sure the callback is defined
    expect(realCallback).toBeDefined();
    
    act(() => {
      realCallback({
        eventType: 'INSERT',
        new: otherUserTodo,
        old: null,
      });
    });

    // Todos should remain unchanged
    expect(result.current.todos).toEqual(mockTodos);
  });

  test('adds a new todo', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const newTodo = {
      id: '3',
      text: 'New Todo',
      user_id: mockUser.id,
      completed: false,
      created_at: '2023-01-03T00:00:00.000Z',
    };
    
    // Mock the addTodo response
    todoService.addTodo.mockResolvedValue(newTodo);

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add a new todo
    await act(async () => {
      await result.current.addTodo('New Todo');
    });

    expect(todoService.addTodo).toHaveBeenCalledWith('New Todo');
    // Check that the new todo was added to the state
    expect(result.current.todos).toEqual([newTodo, ...mockTodos]);
  });

  test('updates a todo', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const updatedTodo = {
      ...mockTodos[0],
      text: 'Updated Todo',
    };
    
    // Mock the updateTodo response
    todoService.updateTodo.mockResolvedValue(updatedTodo);

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update a todo
    await act(async () => {
      await result.current.updateTodo('1', { text: 'Updated Todo' });
    });

    expect(todoService.updateTodo).toHaveBeenCalledWith('1', { text: 'Updated Todo' });
    // Check that the todo was updated in the state
    expect(result.current.todos).toEqual([updatedTodo, mockTodos[1]]);
  });

  test('deletes a todo', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Delete a todo
    await act(async () => {
      await result.current.deleteTodo('1');
    });

    expect(todoService.deleteTodo).toHaveBeenCalledWith('1');
    // Check that the todo was removed from the state
    expect(result.current.todos).toEqual([mockTodos[1]]);
  });

  test('toggles todo completion', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const updatedTodo = {
      ...mockTodos[0],
      completed: true,
    };
    
    // Mock the toggleTodoCompletion response
    todoService.toggleTodoCompletion.mockResolvedValue(updatedTodo);

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Toggle todo completion
    await act(async () => {
      await result.current.toggleTodoCompletion('1', false);
    });

    expect(todoService.toggleTodoCompletion).toHaveBeenCalledWith('1', false);
    // Check that the todo was updated in the state
    expect(result.current.todos).toEqual([updatedTodo, mockTodos[1]]);
  });

  test('refreshes todos', async () => {
    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Reset the mock to track calls
    todoService.fetchTodos.mockClear();

    // Refresh todos
    await act(async () => {
      await result.current.refreshTodos();
    });

    expect(todoService.fetchTodos).toHaveBeenCalledTimes(1); // Only the refresh call
  });

  test('handles errors when fetching todos', async () => {
    // Setup mock error
    const mockError = new Error('Failed to fetch todos');
    todoService.fetchTodos.mockRejectedValue(mockError);

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    expect(result.current.error).toBe(mockError.message);
  });

  test('handles errors when adding todos', async () => {
    // Setup mock error
    const mockError = new Error('Failed to add todo');
    todoService.addTodo.mockRejectedValue(mockError);

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Try to add a todo
    await act(async () => {
      try {
        await result.current.addTodo('New Todo');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(mockError.message);
  });

  test('handles errors when updating todos', async () => {
    // Setup mock error
    const mockError = new Error('Failed to update todo');
    todoService.updateTodo.mockRejectedValue(mockError);

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Try to update a todo
    await act(async () => {
      try {
        await result.current.updateTodo('1', { text: 'Updated Todo' });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(mockError.message);
  });

  test('handles errors when deleting todos', async () => {
    // Setup mock error
    const mockError = new Error('Failed to delete todo');
    todoService.deleteTodo.mockRejectedValue(mockError);

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Try to delete a todo
    await act(async () => {
      try {
        await result.current.deleteTodo('1');
      } catch (error) {
        // Expected to throw
      }
    });

    // Check that the error state is set correctly
    expect(result.current.error).toBe(mockError.message);
  });

  test('handles errors when toggling todo completion', async () => {
    // Setup mock error
    const mockError = new Error('Failed to toggle todo completion');
    todoService.toggleTodoCompletion.mockRejectedValue(mockError);

    // Create a custom wrapper that sets the user immediately
    const CustomWrapper = ({ children }) => {
      return (
        <AuthContext.Provider value={{
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const { result } = renderHook(() => useTodos(), { wrapper: CustomWrapper });

    // Wait for todos to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Try to toggle todo completion
    await act(async () => {
      try {
        await result.current.toggleTodoCompletion('1', false);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to toggle todo completion');
  });
});