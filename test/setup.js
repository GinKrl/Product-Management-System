import '@testing-library/jest-dom';

// React 19 JSX transform fix for Vitest
globalThis.React = require('react');

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY
