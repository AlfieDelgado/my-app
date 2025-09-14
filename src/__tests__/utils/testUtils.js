import { act } from 'react-dom/test-utils';

// Utility to wrap async operations in act()
export const asyncAct = async (callback) => {
  let result;
  await act(async () => {
    result = await callback();
  });
  return result;
};

// Utility to create a custom AuthProvider for testing
export const createTestAuthProvider = (mockAuthValue) => {
  const { AuthProvider } = require('../../AuthContext.jsx');
  
  // Mock the useAuth hook to return our custom value
  jest.mock('../../AuthContext', () => ({
    ...jest.requireActual('../../AuthContext'),
    useAuth: jest.fn(() => mockAuthValue),
  }));

  return AuthProvider;
};