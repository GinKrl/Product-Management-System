import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        @keyframes float1 { 0%,100% { transform: translateY(0) rotate(22deg); }  50% { transform: translateY(-22px) rotate(22deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(-28px) rotate(-12deg); } }
        @keyframes float3 { 0%,100% { transform: translateY(0) rotate(42deg); }  50% { transform: translateY(-16px) rotate(42deg); } }
        @keyframes float4 { 0%,100% { transform: translateY(0) rotate(6deg); }   50% { transform: translateY(-20px) rotate(6deg); } }
        @keyframes float5 { 0%,100% { transform: translateY(0) rotate(-30deg); } 50% { transform: translateY(-26px) rotate(-30deg); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-root {
          height: 100vh;
          width: 100vw;
          display: flex;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
        }

        /* ── LEFT PANEL — 60% ── */
        .left-panel {
          flex: 3;
          min-width: 0;
          background: linear-gradient(150deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 65%, #f97316 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 64px 60px;
        }
        .pill {
          position: absolute;
          border-radius: 999px;
        }
        .p1 { width:130px; height:40px; background:rgba(255,150,130,0.55); bottom:24%; left:8%;  animation: float1 4.2s ease-in-out infinite; }
        .p2 { width: 85px; height:27px; background:rgba(255,100,100,0.50); bottom:40%; left:30%; animation: float2 5.1s ease-in-out infinite 0.4s; }
        .p3 { width:155px; height:44px; background:rgba(255,120,80,0.45);  bottom:11%; left:38%; animation: float3 3.8s ease-in-out infinite 0.9s; }
        .p4 { width: 95px; height:30px; background:rgba(255,160,130,0.50); bottom:32%; left:4%;  animation: float4 4.7s ease-in-out infinite 0.7s; }
        .p5 { width: 68px; height:22px; background:rgba(220,80,80,0.45);   top:26%;  left:46%;   animation: float5 6.2s ease-in-out infinite 0.2s; }
        .p6 { width:110px; height:34px; background:rgba(255,140,80,0.45);  bottom:19%; left:56%; animation: float1 5.0s ease-in-out infinite 1.1s; }
        .p7 { width: 75px; height:24px; background:rgba(200,60,60,0.50);   top:17%;  left:14%;   animation: float2 5.6s ease-in-out infinite 0.5s; }
        .p8 { width: 58px; height:19px; background:rgba(255,130,110,0.45); top:42%;  left:62%;   animation: float3 4.3s ease-in-out infinite 1.3s; }
        .p9 { width: 90px; height:28px; background:rgba(255,180,100,0.40); top:12%;  left:50%;   animation: float4 3.6s ease-in-out infinite 0.6s; }

        .left-text { position: relative; z-index: 2; }
        .left-text h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4vw, 58px);
          font-weight: 400;
          color: #ffffff;
          line-height: 1.12;
          margin-bottom: 18px;
          letter-spacing: -0.5px;
        }
        .left-text p {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          line-height: 1.75;
          max-width: 320px;
        }

        /* ── RIGHT PANEL — 40% ── */
        .right-panel {
          flex: 2;
          max-width: 40vw;
          min-width: 300px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 64px;
          overflow-y: auto;
          border-left: 1px solid #f0eef8;
        }

        .form-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.8px;
          color: #b91c1c;
          text-transform: uppercase;
          margin-bottom: 10px;
          animation: fadeSlideUp 0.45s ease both 0.05s;
        }
        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(23px, 2vw, 26px);
          font-weight: 400;
          color: #0f0a1e;
          line-height: 1.18;
          margin-bottom: 28px;
          letter-spacing: -0.5px;
          animation: fadeSlideUp 0.45s ease both 0.1s;
        }

        .field { display: flex; flex-direction: column; gap: 7px; }
        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #2d2640;
          letter-spacing: 0.1px;
        }
        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-link {
          font-size: 10px;
          font-weight: 500;
          color: #b91c1c;
          text-decoration: none;
          transition: color 0.15s;
        }
        .forgot-link:hover { color: #7f1d1d; text-decoration: underline; }

        .input-wrap { position: relative; }
        .input-field {
          width: 100%;
          padding: 10px 14px;
          background: #fafafa;
          border: 1.5px solid #e2ddf0;
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #0f0a1e;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          -webkit-appearance: none;
        }
        .input-field::placeholder { color: #b8b2cc; }
        .input-field:focus {
          border-color: #b91c1c;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(185, 28, 28, 0.10);
        }
        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9d95b8;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .pw-toggle:hover { color: #b91c1c; }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeSlideUp 0.45s ease both 0.18s;
        }

        .field { display: flex; flex-direction: column; gap: 5px; }
        .field label {
          font-size: 12px;
          font-weight: 600;
          color: #2d2640;
          letter-spacing: 0.1px;
        }

        .btn-signin {
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #e11d48 100%);
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 4px 18px rgba(185, 28, 28, 0.30);
        }
        .btn-signin:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(185, 28, 28, 0.42);
        }
        .btn-signin:active { transform: scale(0.98); }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .divider span { flex: 1; height: 1px; background: #e8e3f5; }
        .divider em {
          font-style: normal;
          font-size: 10px;
          font-weight: 700;
          color: #c2bcd8;
          text-transform: uppercase;
          letter-spacing: 1.8px;
        }

        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 10px;
          background: #ffffff;
          border: 1.5px solid #e2ddf0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: #2d2640;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .btn-google:hover {
          background: #faf8ff;
          border-color: #c4bade;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .footer-text {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #9d95b8;
          animation: fadeSlideUp 0.45s ease both 0.35s;
        }
        .footer-text a {
          color: #b91c1c;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-text a:hover { color: #7f1d1d; text-decoration: underline; }
      `}</style>

      <div className="login-root">

        {/* ── LEFT ── */}
        <div className="left-panel">
          <div className="pill p1" /><div className="pill p2" /><div className="pill p3" />
          <div className="pill p4" /><div className="pill p5" /><div className="pill p6" />
          <div className="pill p7" /><div className="pill p8" /><div className="pill p9" />
          <div className="left-text">
            <h1>Welcome<br />to the platform</h1>
            <p>Your workspace, your rules. Sign in to pick up right where you left off.</p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right-panel">
          <p className="form-eyebrow">User Login</p>
          <h2 className="form-title">Sign in to<br />your account</h2>

          <div className="form-fields">

            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
              <div className="input-wrap">
                <input
                  id="password"
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={{ paddingRight: 44 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button className="pw-toggle" onClick={() => setShowPassword(s => !s)} tabIndex={-1} type="button">
                  {showPassword
                    ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Sign In */}
            <button className="btn-signin" type="button">Sign In</button>

            {/* Divider */}
            <div className="divider">
              <span /><em>or</em><span />
            </div>

            {/* Google */}
            <button className="btn-google" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="footer-text">
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </div>

      </div>
    </>
  );
};

export default Login;