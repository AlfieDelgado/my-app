import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthButton from '../../components/AuthButton';
import { AuthProvider } from '../../AuthContext.jsx';

// Mock the useAuth hook
jest.mock('../../AuthContext', () => ({
  ...jest.requireActual('../../AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseAuth = require('../../AuthContext').useAuth;

describe('AuthButton Component', () => {
  const mockSignOut = jest.fn();
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
    });
  });

  test('TC-AB-001: Verify user avatar and email display', () => {
    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Check if avatar is displayed with first letter of email
    const avatar = screen.getByText('T'); // First letter of "test@example.com"
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-8', 'h-8', 'rounded-full', 'bg-indigo-600', 'flex', 'items-center', 'justify-center', 'text-white', 'font-semibold');

    // Check if email is displayed (username part before @)
    const emailDisplay = screen.getByText('test'); // Part before @ in "test@example.com"
    expect(emailDisplay).toBeInTheDocument();
    expect(emailDisplay).toHaveClass('text-indigo-800', 'font-medium', 'hidden', 'sm:block');
  });

  test('TC-AB-002: Verify dropdown menu functionality', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Initially dropdown should not be visible
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();

    // Click on the auth button to show dropdown
    const authButton = screen.getByRole('button', { name: /test/i });
    await user.click(authButton);

    // Now dropdown should be visible
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();

    // Click again to hide dropdown
    await user.click(authButton);

    // Dropdown should be hidden again
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
  });

  test('TC-AB-003: Verify sign out functionality', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Click on the auth button to show dropdown
    const authButton = screen.getByRole('button', { name: /test/i });
    await user.click(authButton);

    // Click on sign out button
    const signOutButton = screen.getByText('Sign Out');
    await user.click(signOutButton);

    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
  });

  test('TC-AB-004: Verify proper hiding when user is not authenticated', () => {
    // Mock user as null (not authenticated)
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });

    const { container } = render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Component should return null when user is not authenticated
    expect(container.firstChild).toBeNull();
  });

  test('TC-AB-005: Verify responsive behavior on different screen sizes', () => {
    // Mock window.matchMedia to simulate small screen
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('(max-width: 640px)'), // Simulate small screen
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // On small screens, email should be hidden
    const emailDisplay = screen.getByText('test');
    expect(emailDisplay).toHaveClass('hidden', 'sm:block');

    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  test('displays default avatar when email is not available', () => {
    // Mock user without email
    const userWithoutEmail = { ...mockUser, email: null };
    mockUseAuth.mockReturnValue({
      user: userWithoutEmail,
      signOut: mockSignOut,
    });

    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Check if default avatar is displayed with 'U'
    const avatar = screen.getByText('U');
    expect(avatar).toBeInTheDocument();

    // Check if default username is displayed
    const usernameDisplay = screen.getByText('User');
    expect(usernameDisplay).toBeInTheDocument();
  });

  test('handles sign out error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock signOut to throw an error
    mockSignOut.mockRejectedValue(new Error('Sign out failed'));
    
    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Click on the auth button to show dropdown
    const authButton = screen.getByRole('button', { name: /test/i });
    await user.click(authButton);

    // Click on sign out button
    const signOutButton = screen.getByText('Sign Out');
    await user.click(signOutButton);

    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('closes dropdown after sign out', async () => {
    const user = userEvent.setup();
    
    // Mock signOut to resolve successfully
    mockSignOut.mockResolvedValue({});
    
    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    // Click on the auth button to show dropdown
    const authButton = screen.getByRole('button', { name: /test/i });
    await user.click(authButton);

    // Verify dropdown is open
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();

    // Click on sign out button
    const signOutButton = screen.getByText('Sign Out');
    await user.click(signOutButton);

    // Verify dropdown is closed after sign out
    await waitFor(() => {
      expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });
  });
});