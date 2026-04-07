import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { render as customRender } from '../../test/utils.jsx';

import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/Login.jsx';
import * as supabaseModule from '../../src/lib/supabaseClient';

vi.mock('../../src/lib/supabaseClient');

const supabase = supabaseModule.supabase;

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form', () => {
    customRender(<Login />);
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('submits email/password login successfully', async () => {
    const navigateSpy = vi.fn();
    Object.defineProperty(window, 'navigate', { value: navigateSpy, writable: true });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows error on failed login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' }
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'wrong@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'wrong');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('calls signInWithOAuth on Google button click', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /google/i }));

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({ redirectTo: expect.any(String) })
      })
    );
  });

  it('toggles password visibility', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByText('Show'));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByText('Hide'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
