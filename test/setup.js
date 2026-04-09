import '@testing-library/jest-dom';

// React 19 JSX transform fix for Vitest
globalThis.React = require('react');

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  }
});

// Mock supabaseClient
vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
        signInWithOAuth: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn()
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    }
  };
});
