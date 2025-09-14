import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AuthProvider, useAuth } from '../../AuthContext.jsx';

// Mock the useAuth hook
jest.mock('../../AuthContext', () => ({
  ...jest.requireActual('../../AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseAuth = require('../../AuthContext').useAuth;

// Test component to be rendered inside ProtectedRoute
const ProtectedContent = () => {
  return (
    <div data-testid="protected-content">
      <h1>Protected Content</h1>
      <p>This content is only visible to authenticated users</p>
    </div>
  );
};

// Test component wrapper with routing
const TestApp = ({ authState, children }) => {
  // Set up the mock auth state
  mockUseAuth.mockReturnValue(authState);

  return (
    <MemoryRouter initialEntries={['/protected']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                {children || <ProtectedContent />}
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // TC-PR-001: Verify route protection for authenticated users
  test('renders protected content when user is authenticated', async () => {
    const authState = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    };

    render(<TestApp authState={authState} />);

    // Protected content should be visible
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Login page should not be visible
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  // TC-PR-002: Verify redirect to login for unauthenticated users
  test('redirects to login page when user is not authenticated', async () => {
    const authState = {
      user: null,
      loading: false,
    };

    render(<TestApp authState={authState} />);

    // Protected content should not be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  // TC-PR-003: Verify loading state during authentication check
  test('displays loading spinner while checking authentication status', () => {
    const authState = {
      user: null,
      loading: true,
    };

    render(<TestApp authState={authState} />);

    // Loading spinner should be visible
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check for the spinner element
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Protected content and login page should not be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  // TC-PR-004: Verify proper rendering of protected content
  test('renders custom children components when authenticated', () => {
    const authState = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    };

    const customContent = (
      <div data-testid="custom-content">
        <h2>Custom Protected Content</h2>
        <button>Custom Button</button>
      </div>
    );

    render(<TestApp authState={authState}>{customContent}</TestApp>);

    // Custom content should be visible
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Protected Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
    
    // Default protected content should not be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Login page should not be visible
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  // Additional test: Verify transition from loading to authenticated state
  test('transitions from loading to authenticated state correctly', async () => {
    // Start with loading state
    const initialAuthState = {
      user: null,
      loading: true,
    };

    const { rerender } = render(<TestApp authState={initialAuthState} />);

    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // Update to authenticated state
    const authenticatedAuthState = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    };

    rerender(<TestApp authState={authenticatedAuthState} />);

    // Should now show protected content
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Additional test: Verify transition from loading to unauthenticated state
  test('transitions from loading to unauthenticated state correctly', async () => {
    // Start with loading state
    const initialAuthState = {
      user: null,
      loading: true,
    };

    const { rerender } = render(<TestApp authState={initialAuthState} />);

    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();

    // Update to unauthenticated state
    const unauthenticatedAuthState = {
      user: null,
      loading: false,
    };

    rerender(<TestApp authState={unauthenticatedAuthState} />);

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Additional test: Verify loading spinner has correct styling
  test('loading spinner has correct styling classes', () => {
    const authState = {
      user: null,
      loading: true,
    };

    render(<TestApp authState={authState} />);

    // Check for the spinner element with correct classes
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-t-2', 'border-b-2', 'border-indigo-600');
    
    // Check for the loading text
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toHaveClass('mt-4', 'text-indigo-800', 'font-medium');
    
    // Check for the container styling - the outermost div should have these classes
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-indigo-50', 'to-purple-100', 'flex', 'items-center', 'justify-center', 'p-4');
  });
});