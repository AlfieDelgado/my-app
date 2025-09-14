import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Set test name for environment detection
process.env.JEST_TEST_NAME = 'supabaseClient.test.js';

// Store original environment variables
let originalEnv;

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock console.error to avoid noise in test output
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('supabaseClient', () => {
  let mockClient;
  let mockCreateClient;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Store original environment variables
    originalEnv = { ...process.env };
    
    // Get the mocked createClient function
    mockCreateClient = require('@supabase/supabase-js').createClient;
    
    // Create a mock client
    mockClient = {
      from: jest.fn(),
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
    };
    
    // Setup createClient to return our mock
    mockCreateClient.mockReturnValue(mockClient);
    
    // Setup mock environment variables
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('TC-SC-001: Verify Supabase client initialization', () => {
    test('should initialize Supabase client with valid environment variables', () => {
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Get the mocked createClient function again after reset
      const { createClient: freshMockCreateClient } = require('@supabase/supabase-js');
      freshMockCreateClient.mockReturnValue(mockClient);
      
      // Import the module (this will trigger the mocked createClient)
      const { supabase } = require('../supabaseClient');
      
      // Verify createClient was called with correct parameters
      expect(freshMockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
      
      // Verify the client was returned
      expect(supabase).toBe(mockClient);
    });
  });

  describe('TC-SC-002: Verify error handling when environment variables are missing', () => {
    test('should return null when VITE_SUPABASE_URL is missing', () => {
      // Set only one environment variable
      delete process.env.VITE_SUPABASE_URL;
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
      
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Import the module
      const reimportedSupabase = require('../supabaseClient');
      
      // Verify null is returned
      expect(reimportedSupabase.supabase).toBeNull();
    });

    test('should return null when VITE_SUPABASE_ANON_KEY is missing', () => {
      // Set only one environment variable
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.VITE_SUPABASE_ANON_KEY;
      
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Import the module
      const reimportedSupabase = require('../supabaseClient');
      
      // Verify null is returned
      expect(reimportedSupabase.supabase).toBeNull();
    });

    test('should return null when both environment variables are missing', () => {
      // Remove both environment variables
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.VITE_SUPABASE_ANON_KEY;
      
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Import the module
      const reimportedSupabase = require('../supabaseClient');
      
      // Verify null is returned
      expect(reimportedSupabase.supabase).toBeNull();
    });
  });

  describe('TC-SC-003: Verify client configuration with valid credentials', () => {
    test('should configure client with provided URL and key', () => {
      // Set custom environment variables
      const customUrl = 'https://custom.supabase.co';
      const customKey = 'custom-anon-key';
      process.env.VITE_SUPABASE_URL = customUrl;
      process.env.VITE_SUPABASE_ANON_KEY = customKey;
      
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Get the mocked createClient function again after reset
      const { createClient: freshMockCreateClient } = require('@supabase/supabase-js');
      freshMockCreateClient.mockReturnValue(mockClient);
      
      // Import the module
      const { supabase: reimportedSupabase } = require('../supabaseClient');
      
      // Verify createClient was called with custom parameters
      expect(freshMockCreateClient).toHaveBeenCalledWith(customUrl, customKey);
      
      // Verify the client was returned
      expect(reimportedSupabase).toBe(mockClient);
    });

    test('should handle empty string environment variables', () => {
      // Set empty environment variables
      process.env.VITE_SUPABASE_URL = '';
      process.env.VITE_SUPABASE_ANON_KEY = '';
      
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Import the module
      const reimportedSupabase = require('../supabaseClient');
      
      // Verify null is returned
      expect(reimportedSupabase.supabase).toBeNull();
    });

    test('should handle whitespace-only environment variables', () => {
      // Set whitespace-only environment variables
      process.env.VITE_SUPABASE_URL = '   ';
      process.env.VITE_SUPABASE_ANON_KEY = '   ';
      
      // Clear module cache to ensure fresh import
      jest.resetModules();
      
      // Import the module
      const reimportedSupabase = require('../supabaseClient');
      
      // Verify null is returned because whitespace-only values are treated as invalid
      expect(reimportedSupabase.supabase).toBeNull();
    });
  });
});