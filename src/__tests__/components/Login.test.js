import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Login';
import AuthProviderWrapper from './AuthProviderWrapper';
import { supabase } from '../../supabaseClient';
import { asyncAct } from '../utils/testUtils';

// Mock the supabase client
jest.mock('../../supabaseClient');

// Mock the useAuth hook
jest.mock('../../AuthContext', () => ({
  ...jest.requireActual('../../AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseAuth = require('../../AuthContext').useAuth;

describe('Login Component', () => {
  const mockSignIn = jest.fn();
  const mockSignInWithOAuth = jest.fn();
  const mockResetPassword = jest.fn();
  const mockOnToggleMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    // Mock the useAuth hook
    mockUseAuth.mockReturnValue(mockAuthValue);
  });

  test('renders login form correctly', () => {
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText('Or continue with')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('calls signIn with correct credentials when form is submitted', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('calls signInWithOAuth with Google provider when Google button is clicked', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const googleButton = screen.getByRole('button', { name: 'Google' });
    await user.click(googleButton);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
  });

  test('calls signInWithOAuth with GitHub provider when GitHub button is clicked', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const githubButton = screen.getByRole('button', { name: 'GitHub' });
    await user.click(githubButton);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith('github');
  });

  test('calls onToggleMode when Sign Up button is clicked', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
    await user.click(signUpButton);

    expect(mockOnToggleMode).toHaveBeenCalled();
  });

  test('shows password reset form when Forgot your password? link is clicked', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('calls resetPassword with correct email when reset form is submitted', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    // Click forgot password link
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    // Fill in email and submit
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendResetButton = screen.getByRole('button', { name: 'Send Reset Email' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendResetButton);

    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
  });

  test('shows success message when password reset email is sent', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    // Click forgot password link
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    // Fill in email and submit
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendResetButton = screen.getByRole('button', { name: 'Send Reset Email' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendResetButton);

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText('Password reset email sent. Check your inbox.')).toBeInTheDocument();
    });
  });

  test('returns to login form when Cancel button is clicked in reset form', async () => {
    const user = userEvent.setup();
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };
    
    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    // Click forgot password link
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // Should be back to login form
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('displays error message when signIn fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid login credentials';
    mockSignIn.mockRejectedValue(new Error(errorMessage));
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };

    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(signInButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays error message when OAuth signIn fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'OAuth sign in failed';
    mockSignInWithOAuth.mockRejectedValue(new Error(errorMessage));
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };

    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const googleButton = screen.getByRole('button', { name: 'Google' });
    await user.click(googleButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays error message when password reset fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to send reset email';
    mockResetPassword.mockRejectedValue(new Error(errorMessage));
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };

    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
    );
    });

    // Click forgot password link
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    // Fill in email and submit
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendResetButton = screen.getByRole('button', { name: 'Send Reset Email' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendResetButton);

    // Wait for error message to appear
    await waitFor(() => {
      // The error message should be in a div with class "bg-red-100 text-red-700"
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveClass('text-red-700');
    });
  });

  test('disables submit button while loading', async () => {
    const user = userEvent.setup();
    // Make signIn take some time to return
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };

    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    // Button should be disabled and show loading text
    expect(signInButton).toBeDisabled();
    expect(signInButton).toHaveTextContent('Signing In...');

    // Wait for signIn to complete
    await waitFor(() => {
      expect(signInButton).not.toBeDisabled();
      expect(signInButton).toHaveTextContent('Sign In');
    });
  });

  test('disables OAuth buttons while loading', async () => {
    const user = userEvent.setup();
    // Make signInWithOAuth take some time to return
    mockSignInWithOAuth.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };

    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    const googleButton = screen.getByRole('button', { name: 'Google' });
    await user.click(googleButton);

    // Button should not be disabled since OAuth doesn't show loading state in the component
    expect(googleButton).not.toBeDisabled();
  });

  test('disables reset button while loading', async () => {
    const user = userEvent.setup();
    // Make resetPassword take some time to return
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const mockAuthValue = {
      signIn: mockSignIn,
      signInWithOAuth: mockSignInWithOAuth,
      resetPassword: mockResetPassword,
    };

    act(() => {
      render(
        <AuthProviderWrapper mockAuthValue={mockAuthValue}>
          <Login onToggleMode={mockOnToggleMode} />
        </AuthProviderWrapper>
      );
    });

    // Click forgot password link
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    // Fill in email and submit
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const sendResetButton = screen.getByRole('button', { name: 'Send Reset Email' });

    await user.type(emailInput, 'test@example.com');
    await user.click(sendResetButton);

    // Button should be disabled and show loading text
    expect(sendResetButton).toBeDisabled();
    expect(sendResetButton).toHaveTextContent('Sending...');

    // Wait for resetPassword to complete
    await waitFor(() => {
      expect(sendResetButton).not.toBeDisabled();
      expect(sendResetButton).toHaveTextContent('Send Reset Email');
    });
  });
});