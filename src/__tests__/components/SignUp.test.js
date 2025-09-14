import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '../../components/SignUp';
import { AuthProvider } from '../../AuthContext.jsx';
import { supabase } from '../../supabaseClient';

// Mock the supabase client
jest.mock('../../supabaseClient');

// Mock the useAuth hook
jest.mock('../../AuthContext', () => ({
  ...jest.requireActual('../../AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseAuth = require('../../AuthContext').useAuth;

describe('SignUp Component', () => {
  const mockSignUp = jest.fn();
  const mockSignInWithOAuth = jest.fn();
  const mockOnToggleMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: mockSignUp,
      signIn: jest.fn(),
      signInWithOAuth: mockSignInWithOAuth,
      signOut: jest.fn(),
      resetPassword: jest.fn(),
    });
    
    // Mock successful sign up by default
    mockSignUp.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://example.com/oauth' }, error: null });
  });

  test('renders signup form correctly', () => {
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByText('Or sign up with')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('calls signUp with correct credentials when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signUpButton);

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('calls signInWithOAuth with Google provider when Google button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const googleButton = screen.getByRole('button', { name: 'Google' });
    await user.click(googleButton);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
  });

  test('calls signInWithOAuth with GitHub provider when GitHub button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const githubButton = screen.getByRole('button', { name: 'GitHub' });
    await user.click(githubButton);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith('github');
  });

  test('calls onToggleMode when Sign In button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(signInButton);

    expect(mockOnToggleMode).toHaveBeenCalled();
  });

  test('shows error message when passwords do not match', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(signUpButton);

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  test('shows error message when password is too short', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(signUpButton);

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  test('shows success message when sign up is successful', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signUpButton);

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
      expect(screen.getByText('Please check your email to verify your account before signing in.')).toBeInTheDocument();
    });

    // Should show back to login button
    expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument();
  });

  test('calls onToggleMode when Back to Login button is clicked after successful signup', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signUpButton);

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });

    // Click back to login button
    const backToLoginButton = screen.getByRole('button', { name: 'Back to Login' });
    await user.click(backToLoginButton);

    expect(mockOnToggleMode).toHaveBeenCalled();
  });

  test('displays error message when signUp fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already registered';
    mockSignUp.mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signUpButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('displays error message when OAuth sign up fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'OAuth sign up failed';
    mockSignInWithOAuth.mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const googleButton = screen.getByRole('button', { name: 'Google' });
    await user.click(googleButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    const user = userEvent.setup();
    // Make signUp take some time to return
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signUpButton);

    // Button should be disabled and show loading text
    expect(signUpButton).toBeDisabled();
    expect(signUpButton).toHaveTextContent('Creating Account...');

    // Wait for signUp to complete and success message to appear
    await waitFor(() => {
      // After successful signup, the form is replaced with a success message
      // So the original Sign Up button should no longer be in the DOM
      expect(screen.queryByRole('button', { name: 'Sign Up' })).not.toBeInTheDocument();
      // Instead, we should see the success message and Back to Login button
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument();
    });
  });

  test('does not disable OAuth buttons while loading', async () => {
    const user = userEvent.setup();
    // Make signInWithOAuth take some time to return
    mockSignInWithOAuth.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const googleButton = screen.getByRole('button', { name: 'Google' });
    await user.click(googleButton);

    // Button should not be disabled since OAuth doesn't show loading state in the component
    expect(googleButton).not.toBeDisabled();
  });

  test('shows success state and does not show form after successful signup', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <SignUp onToggleMode={mockOnToggleMode} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signUpButton);

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });

    // Form should not be visible
    expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Confirm Password')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign Up' })).not.toBeInTheDocument();
  });
});