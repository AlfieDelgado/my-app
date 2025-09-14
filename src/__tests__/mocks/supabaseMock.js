// Mock Supabase client for testing
const createMockSupabaseClient = () => {
  // Mock user data
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
  };

  // Mock session data
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  // Mock auth methods
  const mockAuth = {
    getSession: jest.fn().mockResolvedValue({
      data: { session: mockSession },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
    signInWithOAuth: jest.fn().mockResolvedValue({
      data: { url: 'https://example.com/oauth' },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null,
    }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Store the callback for tests to access
      const storedCallback = callback;
      
      // Immediately call the callback with the initial session
      setTimeout(() => {
        callback('INITIAL_SESSION', {
          user: mockUser,
          session: mockSession,
        });
      }, 0);
      
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
        // Expose the callback for testing
        __getCallback: () => storedCallback,
      };
    }),
  };

  // Mock database methods
  const mockFrom = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();

  // Mock channel methods
  const mockChannel = jest.fn().mockReturnThis();
  const mockOn = jest.fn().mockReturnThis();
  const mockSubscribe = jest.fn().mockReturnValue({
    unsubscribe: jest.fn(),
  });

  // Mock removeChannel
  const mockRemoveChannel = jest.fn();

  // Mock todo data
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

  // Mock database responses
  const mockDbResponse = (data, error = null) => ({
    data,
    error,
  });

  // Configure mock methods to return appropriate responses
  mockSelect.mockImplementation(() => ({
    eq: mockEq,
    order: mockOrder,
  }));

  mockEq.mockImplementation(() => ({
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  }));

  mockOrder.mockImplementation(() => ({
    select: mockSelect,
  }));

  mockInsert.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(mockDbResponse([mockTodos[0]])),
  }));

  mockUpdate.mockImplementation(() => ({
    eq: jest.fn().mockResolvedValue(mockDbResponse([mockTodos[0]])),
  }));

  mockDelete.mockImplementation(() => ({
    eq: jest.fn().mockResolvedValue(mockDbResponse(null)),
  }));

  // Override the initial mockFrom to return todos
  mockFrom.mockImplementation((table) => {
    if (table === 'todos') {
      return {
        select: jest.fn().mockResolvedValue(mockDbResponse(mockTodos)),
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        order: mockOrder,
      };
    }
    return {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
    };
  });

  // Return the mock Supabase client
  return {
    auth: mockAuth,
    from: mockFrom,
    channel: mockChannel,
    on: mockOn,
    subscribe: mockSubscribe,
    removeChannel: mockRemoveChannel,
    // Helper methods for tests to control mock behavior
    __setMockUser: (user) => {
      if (user) {
        mockUser.id = user.id;
        mockUser.email = user.email;
        mockSession.user = user;
        mockAuth.getUser.mockResolvedValue({
          data: { user },
          error: null,
        });
        mockAuth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });
      } else {
        mockAuth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });
        mockAuth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });
      }
      
      // Update the onAuthStateChange mock to call the callback with the new user state
      const mockOnAuthStateChange = jest.fn().mockImplementation((callback) => {
        // Immediately call the callback with the current session
        setTimeout(() => {
          callback('SIGNED_IN', user ? {
            user: user,
            session: { user: user },
          } : null);
        }, 0);
        
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });
      mockAuth.onAuthStateChange = mockOnAuthStateChange;
    },
    __setMockTodos: (todos) => {
      mockTodos.splice(0, mockTodos.length, ...todos);
    },
    __setAuthError: (error) => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error,
      });
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error,
      });
    },
    __setDbError: (error) => {
      mockFrom.mockImplementation((table) => {
        if (table === 'todos') {
          return {
            select: jest.fn().mockResolvedValue(mockDbResponse(null, error)),
            insert: jest.fn().mockResolvedValue(mockDbResponse(null, error)),
            update: jest.fn().mockResolvedValue(mockDbResponse(null, error)),
            delete: jest.fn().mockResolvedValue(mockDbResponse(null, error)),
            eq: mockEq,
            order: mockOrder,
          };
        }
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
          eq: mockEq,
          order: mockOrder,
        };
      });
    },
    __resetMocks: () => {
      jest.clearAllMocks();
    },
  };
};

export default createMockSupabaseClient;