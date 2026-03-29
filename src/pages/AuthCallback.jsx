import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MESSAGES = ['Verifying your credentials…','Setting up your workspace…','Almost there…'];

const AuthCallback = () => {
  const navigate  = useNavigate();
  const [msgIdx, setMsgIdx] = useState(0);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    const msgInterval = setInterval(() => setMsgIdx(i => (i+1) % MESSAGES.length), 1400);
    // TODO Sprint 2: replace with real auth callback (parse code, call authService.handleCallback)
    const simulateAuth = setTimeout(() => {
      const success = true;
      if (success) navigate('/dashboard', { replace: true });
      else setError('Authentication failed. Please try again.');
    }, 3200);
    return () => { clearInterval(msgInterval); clearTimeout(simulateAuth); };
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes msgFade{0%{opacity:0;transform:translateY(6px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
        .cb-wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#fef2f2 0%,#fff 40%,#f8f9fc 100%);font-family:'DM Sans',sans-serif;padding:24px;}
        .cb-card{background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:24px;padding:48px 40px;width:100%;max-width:400px;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,0.08);animation:fadeUp .4s ease both;}
        .spinner-ring{width:60px;height:60px;border-radius:50%;border:3px solid #fee2e2;border-top-color:#b91c1c;animation:spin .8s linear infinite;margin:0 auto 28px;}
        .dot{width:6px;height:6px;border-radius:50%;background:#fca5a5;animation:pulse 1.4s ease-in-out infinite;}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        .status-msg{font-size:13px;color:#9ca3af;min-height:20px;animation:msgFade 1.4s ease infinite;}
        .retry-btn{margin-top:20px;padding:10px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#7f1d1d,#b91c1c);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .15s;}
        .retry-btn:hover{opacity:.88;}
      `}</style>
      <div className="cb-wrapper">
        <div className="cb-card">
          <div style={{width:52,height:52,borderRadius:16,margin:'0 auto 20px',background:'linear-gradient(135deg,#7f1d1d,#b91c1c 55%,#e11d48)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 20px rgba(185,28,28,0.30)'}}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
          </div>
          {error ? (
            <>
              <p style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0f0a1e',marginBottom:8}}>Something went wrong</p>
              <p style={{fontSize:13,color:'#9ca3af',marginBottom:4}}>{error}</p>
              <button className="retry-btn" onClick={() => navigate('/login')}>Back to Login</button>
            </>
          ) : (
            <>
              <div className="spinner-ring"/>
              <p style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0f0a1e',marginBottom:8}}>Signing you in</p>
              <p className="status-msg" key={msgIdx}>{MESSAGES[msgIdx]}</p>
              <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:28}}>
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
              <p style={{fontSize:11,color:'#d1d5db',marginTop:24}}>Powered by <strong style={{color:'#b91c1c'}}>Inventra</strong></p>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default AuthCallback;
