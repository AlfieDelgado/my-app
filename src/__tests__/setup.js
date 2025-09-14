import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Set up import.meta.env for Vite compatibility
if (typeof global.import.meta === 'undefined') {
  global.import.meta = {};
}
if (typeof global.import.meta.env === 'undefined') {
  global.import.meta.env = {};
}
global.import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
global.import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock the Supabase client for all tests except supabaseClient.test.js
jest.mock('../supabaseClient', () => {
  // Check if we're running the supabaseClient.test.js
  const isSupabaseClientTest = process.env.JEST_TEST_NAME === 'supabaseClient.test.js';
  
  if (isSupabaseClientTest) {
    // For supabaseClient.test.js, use our test version that uses process.env
    return require('./mocks/supabaseClientForTests.js');
  } else {
    // For other tests, return the mock
    const createMockSupabaseClient = require('./mocks/supabaseMock.js').default;
    return {
      supabase: createMockSupabaseClient(),
    };
  }
});