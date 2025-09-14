import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  subscribeToTodos,
} from '../services/todoService';
import { supabase } from '../supabaseClient';

// Mock the supabase client
jest.mock('../supabaseClient', () => {
  const createMockSupabaseClient = require('./mocks/supabaseMock.js').default;
  return {
    supabase: createMockSupabaseClient(),
  };
});

describe('todoService', () => {
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
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('fetchTodos', () => {
    test('fetches todos for the current user', async () => {
      // Setup mock response
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockTodos,
        error: null,
      });
      
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await fetchTodos();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('todos');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockTodos);
    });

    test('throws error if user is not authenticated', async () => {
      // Setup mock to return no user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(fetchTodos()).rejects.toThrow('User not authenticated');
    });

    test('throws error if fetch fails', async () => {
      // Setup mock error response
      const mockError = new Error('Failed to fetch todos');
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      supabase.from.mockReturnValue({ select: mockSelect });

      await expect(fetchTodos()).rejects.toThrow(mockError);
    });
  });

  describe('addTodo', () => {
    test('adds a new todo for the current user', async () => {
      const newTodo = {
        id: '3',
        text: 'New Todo',
        user_id: mockUser.id,
        completed: false,
        created_at: '2023-01-03T00:00:00.000Z',
      };

      // Setup mock response
      const mockSelect = jest.fn().mockResolvedValue({
        data: [newTodo],
        error: null,
      });
      
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      
      supabase.from.mockReturnValue({ insert: mockInsert });

      const result = await addTodo('New Todo');

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('todos');
      expect(mockInsert).toHaveBeenCalledWith([
        {
          text: 'New Todo',
          user_id: mockUser.id,
          completed: false
        }
      ]);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(newTodo);
    });

    test('throws error if user is not authenticated', async () => {
      // Setup mock to return no user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(addTodo('New Todo')).rejects.toThrow('User not authenticated');
    });

    test('throws error if add fails', async () => {
      // Setup mock error response
      const mockError = new Error('Failed to add todo');
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      
      supabase.from.mockReturnValue({ insert: mockInsert });

      await expect(addTodo('New Todo')).rejects.toThrow(mockError);
    });
  });

  describe('updateTodo', () => {
    test('updates an existing todo', async () => {
      const updatedTodo = {
        ...mockTodos[0],
        text: 'Updated Todo',
      };

      // Setup mock response
      const mockSelect = jest.fn().mockResolvedValue({
        data: [updatedTodo],
        error: null,
      });
      
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ update: mockUpdate });

      const result = await updateTodo('1', { text: 'Updated Todo' });

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('todos');
      expect(mockUpdate).toHaveBeenCalledWith({ text: 'Updated Todo' });
      expect(mockEq1).toHaveBeenCalledWith('id', '1');
      expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(updatedTodo);
    });

    test('throws error if user is not authenticated', async () => {
      // Setup mock to return no user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(updateTodo('1', { text: 'Updated Todo' })).rejects.toThrow('User not authenticated');
    });

    test('throws error if todo not found', async () => {
      // Setup mock response with empty data
      const mockSelect = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ update: mockUpdate });

      await expect(updateTodo('999', { text: 'Updated Todo' })).rejects.toThrow('Todo not found or access denied');
    });

    test('throws error if update fails', async () => {
      // Setup mock error response
      const mockError = new Error('Failed to update todo');
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ update: mockUpdate });
  
      await expect(updateTodo('1', { text: 'Updated Todo' })).rejects.toThrow(mockError);
    });
  });

  describe('deleteTodo', () => {
    test('deletes an existing todo', async () => {
      // Setup mock response
      const mockEq2 = jest.fn().mockResolvedValue({
        error: null,
      });
      
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ delete: mockDelete });

      const result = await deleteTodo('1');

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('todos');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq1).toHaveBeenCalledWith('id', '1');
      expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(result).toBe(true);
    });

    test('throws error if user is not authenticated', async () => {
      // Setup mock to return no user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(deleteTodo('1')).rejects.toThrow('User not authenticated');
    });

    test('throws error if delete fails', async () => {
      // Setup mock error response
      const mockError = new Error('Failed to delete todo');
      const mockEq2 = jest.fn().mockResolvedValue({
        error: mockError,
      });
      
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ delete: mockDelete });

      await expect(deleteTodo('1')).rejects.toThrow('Failed to delete todo');
    });
  });

  describe('toggleTodoCompletion', () => {
    test('toggles todo completion status', async () => {
      const updatedTodo = {
        ...mockTodos[0],
        completed: true,
      };

      // Setup mock response
      const mockSelect = jest.fn().mockResolvedValue({
        data: [updatedTodo],
        error: null,
      });
      
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ update: mockUpdate });

      const result = await toggleTodoCompletion('1', false);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('todos');
      expect(mockUpdate).toHaveBeenCalledWith({ completed: !false }); // The function toggles the value
      expect(mockEq1).toHaveBeenCalledWith('id', '1');
      expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(updatedTodo);
    });

    test('throws error if user is not authenticated', async () => {
      // Setup mock to return no user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(toggleTodoCompletion('1', false)).rejects.toThrow('User not authenticated');
    });

    test('throws error if todo not found', async () => {
      // Setup mock response with empty data
      const mockSelect = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ update: mockUpdate });

      await expect(toggleTodoCompletion('999', false)).rejects.toThrow('Todo not found or access denied');
    });

    test('throws error if toggle fails', async () => {
      // Setup mock error response
      const mockError = new Error('Failed to toggle todo completion');
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      
      supabase.from.mockReturnValue({ update: mockUpdate });
  
      await expect(toggleTodoCompletion('1', false)).rejects.toThrow(mockError);
    });
  });

  describe('subscribeToTodos', () => {
  test('sets up real-time subscription for todos', () => {
    const mockCallback = jest.fn();
    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    // Setup mock response
    supabase.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue(mockSubscription),
    });

    const result = subscribeToTodos(mockCallback);

    expect(supabase.channel).toHaveBeenCalledWith('todos-changes');
    expect(supabase.channel().on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todos'
      },
      expect.any(Function)
    );
    expect(supabase.channel().on().subscribe).toHaveBeenCalled();
    expect(result).toBe(mockSubscription);
  });
});
});