import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { render as customRender } from '../../test/utils.jsx';

import { BrowserRouter } from 'react-router-dom';
import Register from '../../src/pages/Register.jsx';
import * as supabaseModule from '../../src/lib/supabaseClient';

vi.mock('../../src/lib/supabaseClient');

const supabase = supabaseModule.supabase;

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.signUp.mockResolvedValue({ error: null });
    supabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders registration form', () => {
    customRender(<Register />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
  });

  it('submits email/password registration successfully', async () => {
    customRender(<Register />);

    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'newuser@example.com');
    await userEvent.type(screen.getByPlaceholderText('At least 6 characters'), 'password123');

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'John Doe' }
        }
      });
    });

    // Note: Manual verification - confirmation email sent (check Supabase dashboard)
    expect(window.alert).toHaveBeenCalledWith('Registration successful! Check your email for a confirmation link.');
  });

  it('shows error on registration failure', async () => {
    supabase.auth.signUp.mockResolvedValue({
      error: { message: 'Email already registered' }
    });

    customRender(<Register />);

    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'duplicate@example.com');
    await userEvent.type(screen.getByPlaceholderText('At least 6 characters'), 'password123');

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    customRender(<Register />);

    const passwordInput = screen.getByPlaceholderText('At least 6 characters');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByText('Show'));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('calls signInWithOAuth for Google registration', async () => {
    customRender(<Register />);

    fireEvent.click(screen.getByRole('button', { name: /google/i }));

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({ redirectTo: expect.any(String) })
      })
    );

    // Note: Manual verification - New Google user auto-provisioned as USER/INACTIVE (check Supabase + trigger 04_provision_user_trigger.sql)
  });
});
