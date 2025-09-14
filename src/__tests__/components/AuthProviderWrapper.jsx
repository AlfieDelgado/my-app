import React, { useEffect } from 'react';
import { AuthProvider } from '../../AuthContext.jsx';

// Test wrapper that handles AuthContext initialization properly
const AuthProviderWrapper = ({ children, mockAuthValue }) => {
  // Mock the useAuth hook to return our custom value
  const AuthContext = require('../../AuthContext');
  
  useEffect(() => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuthValue);
    
    return () => {
      AuthContext.useAuth.mockRestore();
    };
  }, [mockAuthValue]);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AuthProviderWrapper;