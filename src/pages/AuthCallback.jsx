import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    'Verifying credentials…',
    'Establishing secure session…',
    'Loading your workspace…',
  ];

  useEffect(() => {
    // Cycle through status messages
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 1800);

    // FIX: Immediate check for session (This fixes the "stuck" issue)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Short delay so the user can actually see your cool "Loading your workspace" step
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    checkSession();

    // Listener for auth state changes (e.g., initial session or sign in)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes drift1 {
          0%,100% { transform: translate(0,0) rotate(20deg); }
          50%     { transform: translate(12px,-18px) rotate(26deg); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) rotate(-12deg); }
          50%     { transform: translate(-10px,-22px) rotate(-18deg); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0,0) rotate(45deg); }
          50%     { transform: translate(8px,-14px) rotate(52deg); }
        }
        @keyframes orb-pulse {
          0%,100% { opacity: 0.20; transform: scale(1); }
          50%     { opacity: 0.35; transform: scale(1.12); }
        }
        @keyframes step-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bar-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .auth-root {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(150deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 65%, #f97316 100%);
          position: relative;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .glass-pill {
          position: absolute;
          border-radius: 999px;
          backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.25);
          pointer-events: none;
        }
        .streak {
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.15);
          pointer-events: none;
        }

        .auth-card {
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.97);
          border-radius: 28px;
          padding: 52px 48px 44px;
          width: 100%;
          max-width: 420px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.5),
            0 24px 80px rgba(0,0,0,0.25),
            0 8px 20px rgba(0,0,0,0.12);
          animation: fadeUp 0.5s ease both;
          text-align: center;
          backdrop-filter: blur(20px);
        }

        .logo-mark {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #7f1d1d, #b91c1c 60%, #e11d48);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          box-shadow: 0 8px 24px rgba(185,28,28,0.40);
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #fff;
          letter-spacing: -1px;
        }

        .spinner-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto 32px;
        }
        .pulse-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(185,28,28,0.35);
          animation: pulse-ring 1.6s ease-out infinite;
        }
        .pulse-ring-2 {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(185,28,28,0.20);
          animation: pulse-ring 1.6s ease-out infinite 0.5s;
        }
        .spinner-track {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 3px solid #f3f4f6;
          position: relative;
        }
        .spinner-fill {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #b91c1c;
          border-right-color: rgba(185,28,28,0.3);
          animation: spin 0.9s linear infinite;
        }
        .spinner-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #b91c1c;
          letter-spacing: -1px;
        }

        .auth-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #0f0a1e;
          letter-spacing: -0.4px;
          margin-bottom: 8px;
        }
        .auth-sub {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .step-text {
          font-size: 12px;
          font-weight: 600;
          color: #b91c1c;
          letter-spacing: 0.2px;
          min-height: 18px;
          animation: step-in 0.3s ease both;
        }

        .progress-track {
          width: 100%;
          height: 3px;
          background: #f3f4f6;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
        }
        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7f1d1d, #b91c1c, #e11d48);
          background-size: 200% 100%;
          animation: bar-fill 2.8s ease both, shimmer 1.5s linear infinite;
        }

        .dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e5e7eb;
          transition: background 0.3s, transform 0.3s;
        }
        .dot.active {
          background: #b91c1c;
          transform: scale(1.3);
        }

        .brand-footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #f3f4f6;
          font-size: 11px;
          color: #d1d5db;
          letter-spacing: 0.5px;
        }
        .brand-footer strong {
          color: #9ca3af;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-size: 10px;
        }
      `}</style>

      <div className="auth-root">
        <div className="bg-orb" style={{ width:320, height:320, top:'-5%', left:'-4%', background:'radial-gradient(circle,rgba(255,80,80,0.28) 0%,transparent 70%)', filter:'blur(2px)', animation:'orb-pulse 6s ease-in-out infinite' }} />
        <div className="bg-orb" style={{ width:240, height:240, bottom:'5%', right:'-3%', background:'radial-gradient(circle,rgba(255,160,60,0.22) 0%,transparent 70%)', filter:'blur(2px)', animation:'orb-pulse 8s ease-in-out infinite 2s' }} />
        <div className="bg-orb" style={{ width:180, height:180, top:'40%', right:'15%', background:'radial-gradient(circle,rgba(255,255,255,0.10) 0%,transparent 70%)', animation:'orb-pulse 7s ease-in-out infinite 1s' }} />

        <div className="glass-pill" style={{ width:140, height:40, top:'18%', left:'8%',  animation:'drift1 5s ease-in-out infinite' }} />
        <div className="glass-pill" style={{ width:100, height:30, top:'30%', right:'10%', animation:'drift2 6.5s ease-in-out infinite 0.8s' }} />
        <div className="glass-pill" style={{ width:180, height:46, bottom:'18%', left:'12%', animation:'drift3 4.8s ease-in-out infinite 1.1s' }} />
        <div className="glass-pill" style={{ width:80,  height:24, bottom:'30%', right:'8%',  animation:'drift1 5.5s ease-in-out infinite 0.4s' }} />

        <div className="streak" style={{ width:90,  height:12, top:'12%',    right:'22%', animation:'drift2 4.2s ease-in-out infinite 0.3s' }} />
        <div className="streak" style={{ width:60,  height:10, bottom:'22%', right:'28%', animation:'drift3 5.8s ease-in-out infinite 1.2s' }} />
        <div className="streak" style={{ width:110, height:13, top:'60%',    left:'6%',   animation:'drift1 6.2s ease-in-out infinite 0.7s' }} />

        <div style={{ position:'absolute', width:80, height:80, top:'8%', right:'35%', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.20)', animation:'drift2 7s ease-in-out infinite 0.5s' }} />
        <div style={{ position:'absolute', width:50, height:50, bottom:'35%', left:'30%', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.18)', animation:'drift3 5.2s ease-in-out infinite 1.4s' }} />

        <div className="auth-card">
          <div className="logo-mark">H</div>
          <div className="spinner-wrap">
            <div className="pulse-ring" />
            <div className="pulse-ring-2" />
            <div className="spinner-track">
              <div className="spinner-fill" />
              <div className="spinner-inner">H</div>
            </div>
          </div>

          <h2 className="auth-title">Establishing Session</h2>
          <p className="auth-sub">
            Welcome to <strong style={{ color:'#0f0a1e', fontWeight:700 }}>HOPE, INC.</strong><br />
            Securely connecting you to your workspace.
          </p>

          <p className="step-text" key={step}>{steps[step]}</p>

          <div className="progress-track">
            <div className="progress-bar" />
          </div>

          <div className="dots">
            {steps.map((_, i) => (
              <div key={i} className={`dot${i <= step ? ' active' : ''}`} />
            ))}
          </div>

          <div className="brand-footer">
            <strong>Hope PMS</strong> &nbsp;·&nbsp; Secure Authentication
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthCallback;