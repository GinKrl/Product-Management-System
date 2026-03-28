import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- AUTO-REDIRECT KUNG NAKA-LOG IN NA ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        .font-dm-sans     { font-family: 'DM Sans', sans-serif; }
        .font-dm-serif    { font-family: 'DM Serif Display', serif; }
        .left-gradient   { background: linear-gradient(150deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 65%, #f97316 100%); }
        .title-clamp     { font-size: clamp(20px, 2vw, 26px); }
        .heading-clamp   { font-size: clamp(36px, 4vw, 58px); }

        @keyframes pulse   { 0%,100%{opacity:0.18;transform:scale(1);} 50%{opacity:0.28;transform:scale(1.08);} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }

        .anim-pulse   { animation: pulse 6s ease-in-out infinite; }
        .fade-in-1 { animation: fadeSlideUp 0.45s ease both 0.05s; }
        .fade-in-2 { animation: fadeSlideUp 0.45s ease both 0.10s; }
        .fade-in-3 { animation: fadeSlideUp 0.45s ease both 0.18s; }
        .fade-in-4 { animation: fadeSlideUp 0.45s ease both 0.35s; }

        .input-focus:focus {
          border-color: #b91c1c;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(185,28,28,0.10);
          outline: none;
        }
        .btn-signin-glow:hover { box-shadow: 0 8px 28px rgba(185,28,28,0.42); }
      `}</style>

      <div className="flex h-screen w-screen overflow-hidden font-dm-sans">
        {/* ── LEFT PANEL ── */}
        <div className="left-gradient relative flex flex-[3] flex-col justify-end overflow-hidden p-16 min-w-0">
          <div className="absolute top-[5%] left-[10%] w-64 h-64 rounded-full anim-pulse"
               style={{ background: 'radial-gradient(circle, rgba(255,80,80,0.30) 0%, transparent 70%)', filter: 'blur(2px)' }} />
          <div className="relative z-10">
            <h1 className="font-dm-serif heading-clamp font-normal text-white leading-tight mb-4 tracking-tight">
              Welcome<br />to the platform
            </h1>
            <p className="text-sm text-white/75 leading-relaxed max-w-xs">
              Your workspace, your rules. Sign in to pick up right where you left off.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-[2] flex-col justify-center overflow-y-auto px-16 py-12 bg-white border-l border-[#f0eef8]"
             style={{ maxWidth: '40vw', minWidth: 300 }}>
          <p className="fade-in-1 text-[10px] font-bold tracking-[2.8px] text-[#b91c1c] uppercase mb-2.5">
            User Login
          </p>
          <h2 className="fade-in-2 font-dm-serif title-clamp font-normal text-[#0f0a1e] leading-tight mb-7 tracking-tight">
            Sign in to<br />your account
          </h2>

          <form onSubmit={handleSubmit} className="fade-in-3 flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#2d2640] tracking-tight">
                Email address
              </label>
              <input
                id="email" type="email" required placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="input-focus w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e2ddf0] rounded-xl text-sm text-[#0f0a1e] transition-all duration-200 placeholder-[#b8b2cc]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-[#2d2640] tracking-tight">
                  Password
                </label>
                <a href="#" className="text-[10px] font-medium text-[#b91c1c] hover:text-[#7f1d1d] hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} required placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input-focus w-full px-3.5 py-2.5 pr-11 bg-[#fafafa] border border-[#e2ddf0] rounded-xl text-sm text-[#0f0a1e] transition-all duration-200 placeholder-[#b8b2cc]"
                />
                <button
                  type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9d95b8] hover:text-[#b91c1c] transition-colors p-1 flex items-center"
                >
                  {showPassword 
                    ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit" className="btn-signin-glow w-full py-2.5 rounded-xl text-white font-bold text-sm tracking-tight transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #e11d48 100%)', boxShadow: '0 4px 18px rgba(185,28,28,0.30)' }}
            >
              Sign In
            </button>
          </form>

          <p className="fade-in-4 mt-5 text-center text-xs text-[#9d95b8]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#b91c1c] hover:text-[#7f1d1d] hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;