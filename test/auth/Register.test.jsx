import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../src/pages/Register.jsx';

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    render(<BrowserRouter><Register /></BrowserRouter>);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
  });

  it('calls signUp on create account button click', () => {
    const { supabase } = require('../../src/lib/supabaseClient');
    render(<BrowserRouter><Register /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(supabase.auth.signUp).toHaveBeenCalled();
  });

  it('calls signInWithOAuth on Google button', () => {
    const { supabase } = require('../../src/lib/supabaseClient');
    render(<BrowserRouter><Register /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({ provider: 'google' }));
  });

  it('shows error message on signUp error', async () => {
    const { supabase } = require('../../src/lib/supabaseClient');
    supabase.auth.signUp.mockResolvedValue({ error: { message: 'Email exists' } });
    render(<BrowserRouter><Register /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => expect(screen.getByText(/email exists/i)).toBeInTheDocument());
  });
});
