import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Listen for returning Google Login sessions
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') navigate('/dashboard');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
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
        .font-dm-sans  { font-family: 'DM Sans', sans-serif; }
        .font-dm-serif { font-family: 'DM Serif Display', serif; }
        .left-gradient { background: linear-gradient(150deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 65%, #f97316 100%); }
        .title-clamp   { font-size: clamp(20px, 2vw, 26px); }
        .heading-clamp { font-size: clamp(36px, 4vw, 58px); }

        /* ── ALL KEYFRAMES — do not remove these ── */
        @keyframes drift1 {
          0%,100% { transform: translate(0,0) rotate(20deg); }
          33%     { transform: translate(8px,-20px) rotate(25deg); }
          66%     { transform: translate(-6px,-10px) rotate(15deg); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) rotate(-15deg); }
          33%     { transform: translate(-10px,-26px) rotate(-20deg); }
          66%     { transform: translate(6px,-12px) rotate(-10deg); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0,0) rotate(40deg); }
          50%     { transform: translate(10px,-18px) rotate(48deg); }
        }
        @keyframes drift4 {
          0%,100% { transform: translate(0,0) rotate(-5deg); }
          50%     { transform: translate(-8px,-22px) rotate(-12deg); }
        }
        @keyframes drift5 {
          0%,100% { transform: translate(0,0) rotate(65deg); }
          50%     { transform: translate(6px,-14px) rotate(72deg); }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.18; transform: scale(1); }
          50%     { opacity: 0.28; transform: scale(1.08); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── ANIMATION CLASSES ── */
        .anim-drift1  { animation: drift1 5.0s ease-in-out infinite; }
        .anim-drift2  { animation: drift2 6.2s ease-in-out infinite 0.8s; }
        .anim-drift3  { animation: drift3 4.5s ease-in-out infinite 1.2s; }
        .anim-drift4  { animation: drift4 4.0s ease-in-out infinite 0.3s; }
        .anim-drift5  { animation: drift5 5.5s ease-in-out infinite 1.0s; }
        .anim-drift1b { animation: drift1 6.0s ease-in-out infinite 0.6s; }
        .anim-drift2b { animation: drift2 4.8s ease-in-out infinite 1.5s; }
        .anim-drift3b { animation: drift3 5.2s ease-in-out infinite 0.4s; }
        .anim-drift4b { animation: drift4 4.3s ease-in-out infinite 1.1s; }
        .anim-drift5b { animation: drift5 6.5s ease-in-out infinite 0.7s; }
        .anim-drift1c { animation: drift1 3.8s ease-in-out infinite 0.2s; }
        .anim-drift2c { animation: drift2 7.0s ease-in-out infinite 0.5s; }
        .anim-drift3c { animation: drift3 5.8s ease-in-out infinite 1.3s; }
        .anim-pulse   { animation: pulse 6s ease-in-out infinite; }
        .anim-pulse2  { animation: pulse 8s ease-in-out infinite 2s; }
        .anim-pulse3  { animation: pulse 7s ease-in-out infinite 1s; }

        .glass-pill {
          backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.30);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 20px rgba(0,0,0,0.10);
        }

        .fade-in-1 { animation: fadeSlideUp 0.45s ease both 0.05s; }
        .fade-in-2 { animation: fadeSlideUp 0.45s ease both 0.10s; }
        .fade-in-3 { animation: fadeSlideUp 0.45s ease both 0.18s; }

        .input-focus:focus {
          border-color: #b91c1c;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(185,28,28,0.10);
          outline: none;
        }
        .btn-signin-glow:hover { box-shadow: 0 8px 28px rgba(185,28,28,0.42); }
      `}</style>

      <div className="flex h-screen w-screen overflow-hidden font-dm-sans">

        {/* ── LEFT PANEL (60%) ── */}
        <div className="left-gradient relative flex flex-[3] flex-col justify-end overflow-hidden p-16 min-w-0">

          {/* Glowing orbs */}
          <div className="absolute top-[5%] left-[10%] w-64 h-64 rounded-full anim-pulse"
               style={{ background: 'radial-gradient(circle, rgba(255,80,80,0.30) 0%, transparent 70%)', filter: 'blur(2px)' }} />
          <div className="absolute bottom-[10%] right-[8%] w-48 h-48 rounded-full anim-pulse2"
               style={{ background: 'radial-gradient(circle, rgba(255,160,60,0.25) 0%, transparent 70%)', filter: 'blur(2px)' }} />
          <div className="absolute top-[40%] left-[50%] w-36 h-36 rounded-full anim-pulse3"
               style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />

          {/* Glass pills */}
          <div className="absolute glass-pill rounded-full anim-drift1"  style={{ width:160, height:46, bottom:'26%', left:'6%' }} />
          <div className="absolute glass-pill rounded-full anim-drift2"  style={{ width:120, height:36, top:'20%',   left:'28%' }} />
          <div className="absolute glass-pill rounded-full anim-drift3"  style={{ width:200, height:52, bottom:'12%', left:'34%' }} />

          {/* Thin streaks */}
          <div className="absolute rounded-full anim-drift4"  style={{ width:100, height:16, top:'15%',    left:'12%', background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.20)' }} />
          <div className="absolute rounded-full anim-drift5"  style={{ width:70,  height:12, top:'35%',    left:'55%', background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.20)' }} />
          <div className="absolute rounded-full anim-drift1b" style={{ width:130, height:14, bottom:'20%', left:'50%', background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.20)' }} />
          <div className="absolute rounded-full anim-drift2b" style={{ width:55,  height:10, top:'60%',    left:'20%', background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.20)' }} />

          {/* Dots */}
          <div className="absolute rounded-full anim-drift3b" style={{ width:14, height:14, top:'28%',    left:'42%', background:'rgba(255,255,255,0.35)', boxShadow:'0 0 12px rgba(255,255,255,0.20)' }} />
          <div className="absolute rounded-full anim-drift4b" style={{ width:10, height:10, bottom:'35%', left:'65%', background:'rgba(255,255,255,0.35)', boxShadow:'0 0 12px rgba(255,255,255,0.20)' }} />
          <div className="absolute rounded-full anim-drift5b" style={{ width:18, height:18, top:'55%',    left:'72%', background:'rgba(255,255,255,0.35)', boxShadow:'0 0 12px rgba(255,255,255,0.20)' }} />
          <div className="absolute rounded-full anim-drift1c" style={{ width:8,  height:8,  top:'12%',    left:'62%', background:'rgba(255,255,255,0.35)', boxShadow:'0 0 12px rgba(255,255,255,0.20)' }} />

          {/* Rings */}
          <div className="absolute rounded-full anim-drift2c" style={{ width:70, height:70, top:'10%',    left:'48%', border:'2px solid rgba(255,255,255,0.22)', background:'transparent' }} />
          <div className="absolute rounded-full anim-drift3c" style={{ width:45, height:45, bottom:'40%', left:'72%', border:'2px solid rgba(255,255,255,0.22)', background:'transparent' }} />

          {/* Text */}
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
             style={{ maxWidth:'40vw', minWidth:300 }}>

          <p className="fade-in-1 text-[10px] font-bold tracking-[2.8px] text-[#b91c1c] uppercase mb-2.5">
            Internal Access
          </p>
          <h2 className="fade-in-2 font-dm-serif title-clamp font-normal text-[#0f0a1e] mb-5 tracking-tight">
            Sign in to<br />your account
          </h2>

          {/* Error message */}
          {errorMsg && (
            <div className="fade-in-3 mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="fade-in-3 flex flex-col gap-3.5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#2d2640] tracking-tight">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-focus w-full px-3.5 py-2.5 bg-[#fafafa] border border-[#e2ddf0] rounded-xl text-sm text-[#0f0a1e] transition-all duration-200 placeholder-[#b8b2cc]"
              />
            </div>

            {/* Password */}
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
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-focus w-full px-3.5 py-2.5 pr-16 bg-[#fafafa] border border-[#e2ddf0] rounded-xl text-sm text-[#0f0a1e] transition-all duration-200 placeholder-[#b8b2cc]"
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

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-signin-glow w-full py-2.5 rounded-xl text-white font-bold text-sm tracking-tight transition-all duration-200 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ background:'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 60%,#e11d48 100%)', boxShadow:'0 4px 18px rgba(185,28,28,0.30)' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-[#e8e3f5]" />
              <span className="text-[10px] font-bold text-[#c2bcd8] uppercase tracking-wider">or</span>
              <span className="flex-1 h-px bg-[#e8e3f5]" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#fbfaff] border-2 border-[#d6cff0] rounded-full text-sm font-semibold text-[#2d2640] transition-all duration-200 hover:bg-[#f5f2ff] hover:border-[#b8addf] hover:-translate-y-px active:scale-[0.98]"
              style={{ boxShadow:'0 2px 10px rgba(214,207,240,0.3)' }}
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