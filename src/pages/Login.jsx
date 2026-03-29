import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      <style>{`
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        .font-dm-sans    { font-family: 'DM Sans', sans-serif; }
        .font-dm-serif   { font-family: 'DM Serif Display', serif; }
        .left-gradient   { background: linear-gradient(150deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 65%, #f97316 100%); }
        .title-clamp     { font-size: clamp(20px, 2vw, 26px); }
        .heading-clamp   { font-size: clamp(36px, 4vw, 58px); }
        
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .fade-in-1 { animation: fadeSlideUp 0.45s ease both 0.05s; }
        .fade-in-2 { animation: fadeSlideUp 0.45s ease both 0.10s; }
        .fade-in-3 { animation: fadeSlideUp 0.45s ease both 0.18s; }
        
        .input-focus:focus {
          border-color: #b91c1c;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(185,28,28,0.10);
          outline: none;
        }
      `}</style>

      <div className="flex h-screen w-screen overflow-hidden font-dm-sans">
        
        {/* ── LEFT PANEL ── */}
        <div className="left-gradient relative flex flex-[3] flex-col justify-end p-16 min-w-0">
          <div className="relative z-10">
            <h1 className="font-dm-serif heading-clamp font-normal text-white leading-tight mb-4 tracking-tight">
              Welcome<br />Back
            </h1>
            <p className="text-sm text-white/75 leading-relaxed max-w-xs">
              Log in to access your dashboard and manage your workspace.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-[2] flex-col justify-center px-16 bg-white border-l border-[#f0eef8]"
             style={{ maxWidth: '40vw', minWidth: 300 }}>

          <p className="fade-in-1 text-[10px] font-bold tracking-[2.8px] text-[#b91c1c] uppercase mb-2.5">
            Internal Access
          </p>
          <h2 className="fade-in-2 font-dm-serif title-clamp font-normal text-[#0f0a1e] mb-5 tracking-tight">
            Sign in to<br />account
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="fade-in-3 flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2d2640]">Email address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-focus w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e2ddf0] rounded-xl text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2d2640]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-focus w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e2ddf0] rounded-xl text-sm transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#9d95b8] hover:text-[#b91c1c] transition-colors py-1 px-1.5"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #e11d48 100%)' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-[#e8e3f5]" />
              <span className="text-[10px] font-bold text-[#c2bcd8] uppercase tracking-wider">or</span>
              <span className="flex-1 h-px bg-[#e8e3f5]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#fbfaff] border-2 border-[#d6cff0] rounded-full text-sm font-semibold text-[#2d2640] transition-all duration-200 hover:bg-[#f5f2ff] hover:border-[#b8addf] hover:-translate-y-px active:scale-[0.98] active:translate-y-0"
              style={{ boxShadow: '0 2px 10px rgba(214,207,240,0.3)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#9d95b8]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#b91c1c] hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
