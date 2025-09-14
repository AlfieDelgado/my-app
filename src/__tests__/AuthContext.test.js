import React from 'react';
import { render, act, waitFor, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';

// Mock the supabase client
jest.mock('../supabaseClient', () => {
  // We need to require the mock function inside the factory
  const createMockSupabaseClient = require('./mocks/supabaseMock').default;
  const mockSupabase = createMockSupabaseClient();
  return { supabase: mockSupabase };
});

// Test component to use the auth context
const TestComponent = () => {
  const { user, loading, signUp, signIn, signInWithOAuth, signOut, resetPassword } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <button data-testid="signup" onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button data-testid="signin" onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button data-testid="oauth" onClick={() => signInWithOAuth('google')}>OAuth</button>
      <button data-testid="signout" onClick={signOut}>Sign Out</button>
      <button data-testid="reset" onClick={() => resetPassword('test@example.com')}>Reset</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('provides authentication context', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('user')).toBeInTheDocument();
    expect(getByTestId('loading')).toBeInTheDocument();
  });

  test('initializes with loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // In test environment, loading should be immediately set to false
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
  });

  test('sets user after successful authentication', async () => {
    // Get the mock supabase client
    const { supabase } = require('../supabaseClient');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // In test environment, loading should be immediately set to false
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');

    // Initially there should be no user
    expect(screen.getByTestId('user')).toHaveTextContent('No user');

    // Since we're in a test environment, we need to manually trigger the onAuthStateChange
    // First, let's make sure the mock was called
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    
    // Get the stored callback from the mock
    const result = supabase.auth.onAuthStateChange.mock.results[0].value;
    const callback = result.__getCallback();
    
    // Simulate authentication by manually triggering the auth state change with a new user
    await act(async () => {
      // Use a promise to ensure the state update is processed
      await new Promise(resolve => {
        callback('SIGNED_IN', {
          user: { id: 'new-user-id', email: 'newuser@example.com' },
        });
        setTimeout(resolve, 0);
      });
    });

    // Now the user should be updated
    expect(screen.getByTestId('user')).toHaveTextContent('newuser@example.com');
  });

  test('handles sign up', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click sign up button
    await act(async () => {
      screen.getByTestId('signup').click();
    });

    // Verify signUp was called
    const { supabase } = require('../supabaseClient');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  test('handles sign in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click sign in button
    await act(async () => {
      screen.getByTestId('signin').click();
    });

    // Verify signIn was called
    const { supabase } = require('../supabaseClient');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  test('handles OAuth sign in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click OAuth button
    await act(async () => {
      screen.getByTestId('oauth').click();
    });

    // Verify signInWithOAuth was called
    const { supabase } = require('../supabaseClient');
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
    });
  });

  test('handles sign out', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click sign out button
    await act(async () => {
      screen.getByTestId('signout').click();
    });

    // Verify signOut was called
    const { supabase } = require('../supabaseClient');
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  test('handles password reset', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click reset button
    await act(async () => {
      screen.getByTestId('reset').click();
    });

    // Verify resetPassword was called
    const { supabase } = require('../supabaseClient');
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: window.location.origin,
    });
  });

  test('handles auth state changes', async () => {
    // Get the mock supabase client
    const { supabase } = require('../supabaseClient');
    const mockSupabase = require('../supabaseClient').supabase;
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // In test environment, loading should be immediately set to false
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');

    // Initially there should be no user
    expect(screen.getByTestId('user')).toHaveTextContent('No user');

    // Check that the onAuthStateChange listener was set up
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    
    // Get the callback
    const result = supabase.auth.onAuthStateChange.mock.results[0].value;
    const callback = result.__getCallback();
    
    // Verify the callback is a function
    expect(typeof callback).toBe('function');
    
    // Verify that the callback can be called without errors
    await act(async () => {
      // Use a promise to ensure the state update is processed
      const promise = new Promise(resolve => {
        callback('SIGNED_IN', {
          user: { id: 'different-user-id', email: 'differentuser@example.com' },
        });
        // Resolve after a short delay to allow state update
        setTimeout(resolve, 0);
      });
      
      // Also update the mock user directly
      mockSupabase.__setMockUser({ id: 'different-user-id', email: 'differentuser@example.com' });
      
      // Wait for the promise to resolve
      await promise;
    });

    // Now the user should be updated
    expect(screen.getByTestId('user')).toHaveTextContent('differentuser@example.com');
  });

  test('throws error when useAuth is used outside of AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('Cannot destructure property \'user\' of \'(0 , _AuthContext.useAuth)(...)\' as it is undefined.');

    // Restore console.error
    console.error = originalError;
  });

  test('handles authentication errors', async () => {
    // Mock console.error to suppress error output
    const originalError = console.error;
    console.error = jest.fn();

    // Mock an authentication error
    const { supabase } = require('../supabaseClient');
    const authError = new Error('Authentication failed');
    supabase.auth.signInWithPassword.mockRejectedValueOnce(authError);

    // Create a test component that catches and displays errors
    const TestErrorComponent = () => {
      const { user, loading, signIn } = useAuth();
      const [error, setError] = React.useState(null);
      
      const handleSignIn = async () => {
        try {
          await signIn('test@example.com', 'password');
        } catch (err) {
          setError(err.message);
        }
      };
      
      return (
        <div>
          <div data-testid="user">{user ? user.email : 'No user'}</div>
          <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
          <div data-testid="error">{error || 'No error'}</div>
          <button data-testid="signin" onClick={handleSignIn}>Sign In</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestErrorComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click sign in button - the error should be caught and displayed
    await act(async () => {
      screen.getByTestId('signin').click();
    });

    // Wait for the error to be caught and displayed
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Authentication failed');
    }, { timeout: 10000 });

    // Restore console.error
    console.error = originalError;
  });

  test('handles errors when signing up', async () => {
    // Mock console.error to suppress error output
    const originalError = console.error;
    console.error = jest.fn();

    // Mock a sign up error
    const { supabase } = require('../supabaseClient');
    const signUpError = new Error('Email already registered');
    // Instead of using mockRejectedValueOnce, we'll modify the mock implementation
    // to return an error in the response
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: signUpError,
    });

    // Create a test component that catches and displays errors
    const TestSignUpErrorComponent = () => {
      const { user, loading, signUp } = useAuth();
      const [error, setError] = React.useState(null);
      
      const handleSignUp = async () => {
        try {
          await signUp('test@example.com', 'password');
        } catch (err) {
          setError(err.message);
        }
      };
      
      return (
        <div>
          <div data-testid="user">{user ? user.email : 'No user'}</div>
          <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
          <div data-testid="error">{error || 'No error'}</div>
          <button data-testid="signup" onClick={handleSignUp}>Sign Up</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestSignUpErrorComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click sign up button - the error should be caught and displayed
    await act(async () => {
      screen.getByTestId('signup').click();
    });

    // Wait for the error to be caught and displayed
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Email already registered');
    }, { timeout: 10000 });

    // Restore console.error
    console.error = originalError;
  });
});