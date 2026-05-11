import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Register = () => {
  // CHANGED: split 'name' into three separate fields the trigger actually reads
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // CHANGED: now passes firstName, lastName, username so the
        // provision_new_user() trigger can populate those DB columns.
        // full_name is kept as a fallback for Google OAuth display.
        data: {
          firstName,
          lastName,
          username,
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      alert("Registration successful! Your account has been created and is pending activation by an administrator.");
      setLoading(false);
      navigate('/login');
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }

        @keyframes drift1 { 0%,100%{transform:translate(0,0) rotate(18deg);}  40%{transform:translate(10px,-22px) rotate(24deg);}  70%{transform:translate(-6px,-12px) rotate(14deg);} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) rotate(-14deg);} 40%{transform:translate(-12px,-28px) rotate(-20deg);} 70%{transform:translate(7px,-10px) rotate(-9deg);} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) rotate(38deg);}  50%{transform:translate(10px,-20px) rotate(46deg);} }
        @keyframes drift4 { 0%,100%{transform:translate(0,0) rotate(-6deg);}  50%{transform:translate(-9px,-24px) rotate(-13deg);} }
        @keyframes drift5 { 0%,100%{transform:translate(0,0) rotate(62deg);}  50%{transform:translate(7px,-16px) rotate(70deg);} }
        @keyframes orb    { 0%,100%{opacity:.20;transform:scale(1);}           50%{opacity:.34;transform:scale(1.10);} }
        @keyframes spin   { to{transform:rotate(360deg);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer{ 0%{background-position:-600px 0;} 100%{background-position:600px 0;} }
        @keyframes glow   { 0%,100%{opacity:.5;} 50%{opacity:1;} }

        .glass-pill {
          position: absolute;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 24px rgba(0,0,0,0.08);
        }
        .streak {
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,0.20);
          border: 1px solid rgba(255,255,255,0.16);
        }
        .dot-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.38);
          box-shadow: 0 0 14px rgba(255,255,255,0.22);
        }

        .inp {
          width: 100%;
          padding: 11px 15px;
          background: #f9f9fb;
          border: 1.5px solid #ebe8f5;
          border-radius: 12px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #0f0a1e;
          outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .inp::placeholder { color: #c4bed8; }
        .inp:focus {
          border-color: #b91c1c;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(185,28,28,0.10);
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 55%, #e11d48 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 5px 18px rgba(185,28,28,0.34);
          transition: transform .18s, box-shadow .18s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
          background-size: 600px 100%;
          animation: shimmer 2.4s linear infinite;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(185,28,28,0.42); }
        .btn-primary:active  { transform: scale(.98); }
        .btn-primary:disabled { opacity: .7; cursor: not-allowed; }

        .btn-google {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 11px 16px;
          background: #fff;
          border: 1.5px solid #e4e0f0;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 13.5px; color: #2d2640;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all .18s;
        }
        .btn-google:hover { background: #faf8ff; border-color: #c8c0e0; transform: translateY(-1px); box-shadow: 0 5px 16px rgba(0,0,0,0.08); }
        .btn-google:active { transform: scale(.98); }

        .f1 { animation: fadeUp .4s ease both .04s; }
        .f2 { animation: fadeUp .4s ease both .09s; }
        .f3 { animation: fadeUp .4s ease both .14s; }
        .f4 { animation: fadeUp .4s ease both .19s; }
        .f5 { animation: fadeUp .4s ease both .24s; }
        .f6 { animation: fadeUp .4s ease both .29s; }
        .f7 { animation: fadeUp .4s ease both .34s; }
        .f8 { animation: fadeUp .4s ease both .39s; }
        .f9 { animation: fadeUp .4s ease both .44s; }
      `}</style>

      <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', fontFamily:"'DM Sans',sans-serif" }}>

        {/* ════════ LEFT PANEL ════════ */}
        <div style={{
          flex: '3 1 0',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(150deg, #7f1d1d 0%, #b91c1c 32%, #e11d48 62%, #f97316 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px 60px',
          minWidth: 0,
        }}>

          {/* Orbs */}
          {[
            { w:320,h:320, s:{top:'-5%',left:'-3%'},   bg:'rgba(255,80,80,0.26)',  d:'6s',   dl:'0s'  },
            { w:240,h:240, s:{bottom:'3%',right:'-2%'}, bg:'rgba(255,150,50,0.20)',  d:'8.5s', dl:'2s'  },
            { w:180,h:180, s:{top:'36%',right:'13%'},   bg:'rgba(255,255,255,0.09)', d:'7s',   dl:'1s'  },
            { w:150,h:150, s:{top:'10%',left:'40%'},    bg:'rgba(255,100,60,0.14)',  d:'9s',   dl:'3s'  },
          ].map((o,i) => (
            <div key={i} style={{ position:'absolute', borderRadius:'50%', filter:'blur(3px)', width:o.w, height:o.h, background:`radial-gradient(circle,${o.bg} 0%,transparent 70%)`, animation:`orb ${o.d} ease-in-out infinite ${o.dl}`, ...o.s }} />
          ))}

          {/* Glass pills */}
          <div className="glass-pill" style={{ width:160, height:46, bottom:'26%', left:'5%',   animation:'drift1 5.2s ease-in-out infinite' }} />
          <div className="glass-pill" style={{ width:125, height:36, top:'19%',   left:'25%',  animation:'drift2 6.5s ease-in-out infinite 0.7s' }} />
          <div className="glass-pill" style={{ width:200, height:52, bottom:'11%',left:'31%',  animation:'drift3 4.6s ease-in-out infinite 1.1s' }} />
          <div className="glass-pill" style={{ width:88,  height:27, top:'43%',   right:'8%',  animation:'drift4 5.8s ease-in-out infinite 0.4s' }} />
          <div className="glass-pill" style={{ width:115, height:33, top:'10%',   right:'17%', animation:'drift5 7.0s ease-in-out infinite 1.5s' }} />

          {/* Streaks */}
          <div className="streak" style={{ width:105, height:13, top:'14%',    left:'9%',   animation:'drift4 4.2s ease-in-out infinite 0.3s' }} />
          <div className="streak" style={{ width:72,  height:11, top:'33%',    left:'53%',  animation:'drift5 5.6s ease-in-out infinite 1.0s' }} />
          <div className="streak" style={{ width:135, height:14, bottom:'18%', left:'47%',  animation:'drift1 6.1s ease-in-out infinite 0.6s' }} />
          <div className="streak" style={{ width:58,  height:10, top:'57%',    left:'17%',  animation:'drift2 4.9s ease-in-out infinite 1.4s' }} />
          <div className="streak" style={{ width:82,  height:12, bottom:'37%', right:'21%', animation:'drift3 5.3s ease-in-out infinite 0.9s' }} />

          {/* Dots only */}
          <div className="dot-shape" style={{ width:15,height:15, top:'27%',    left:'40%',  animation:'drift3 5.4s ease-in-out infinite 0.4s' }} />
          <div className="dot-shape" style={{ width:10,height:10, bottom:'33%', left:'63%',  animation:'drift4 4.4s ease-in-out infinite 1.1s' }} />
          <div className="dot-shape" style={{ width:19,height:19, top:'53%',    left:'69%',  animation:'drift5 6.6s ease-in-out infinite 0.7s' }} />
          <div className="dot-shape" style={{ width:8, height:8,  top:'10%',    left:'59%',  animation:'drift1 3.9s ease-in-out infinite 0.2s' }} />
          <div className="dot-shape" style={{ width:12,height:12, bottom:'47%', right:'29%', animation:'drift2 5.1s ease-in-out infinite 0.8s' }} />

          {/* Text */}
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 13px', borderRadius:999, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', marginBottom:20 }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:'#fff',boxShadow:'0 0 8px rgba(255,255,255,0.8)',animation:'glow 2s ease-in-out infinite',display:'inline-block' }} />
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:2,color:'rgba(255,255,255,0.90)',textTransform:'uppercase' }}>Hope PMS</span>
            </div>

            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(36px,4vw,58px)', fontWeight:400, color:'#fff', lineHeight:1.10, margin:'0 0 16px', letterSpacing:'-0.5px' }}>
              Start your<br />
              <em style={{ fontStyle:'italic', color:'rgba(255,255,255,0.85)' }}>journey</em>
            </h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.70)', lineHeight:1.75, margin:0, maxWidth:300 }}>
              Create an account to unlock all features and take full control of your workspace today at{' '}
              <strong style={{ color:'rgba(255,255,255,0.92)', fontWeight:600 }}>HOPE, INC.</strong>
            </p>

            <div style={{ marginTop:28, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:18,height:2,borderRadius:999,background:'rgba(255,255,255,0.35)' }} />
              <span style={{ width:10,height:10,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.35)',display:'inline-block' }} />
              <span style={{ width:32,height:2,borderRadius:999,background:'rgba(255,255,255,0.20)' }} />
            </div>
          </div>
        </div>

        {/* ════════ RIGHT PANEL ════════ */}
        <div style={{
          flex: '2 1 0',
          maxWidth: '40vw',
          minWidth: 340,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 52px',
          overflow: 'hidden',
          borderLeft: '1px solid #f0edf8',
        }}>

          {/* Eyebrow */}
          <div className="f1" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ width:22,height:2,borderRadius:999,background:'linear-gradient(90deg,#b91c1c,#e11d48)' }} />
            <span style={{ fontSize:10,fontWeight:700,letterSpacing:3,color:'#b91c1c',textTransform:'uppercase' }}>Join the Workspace</span>
          </div>

          {/* Title */}
          <h2 className="f2" style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(22px,2.2vw,30px)', fontWeight:400, color:'#0f0a1e', margin:'0 0 4px', lineHeight:1.20, letterSpacing:'-0.4px' }}>
            Create your account
          </h2>
          <p className="f2" style={{ fontSize:12.5, color:'#a89ec0', margin:'0 0 22px', lineHeight:1.6 }}>
            Join our internal management system.
          </p>

          {/* Error */}
          {errorMsg && (
            <div style={{ marginBottom:14, padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, fontSize:12, color:'#b91c1c', display:'flex', alignItems:'flex-start', gap:8 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* CHANGED: First Name + Last Name side by side (was single "Full Name" field) */}
            <div className="f3" style={{ display:'flex', gap:12 }}>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#3d3350' }}>First Name</label>
                <input className="inp" type="text" required placeholder="John"
                  value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#3d3350' }}>Last Name</label>
                <input className="inp" type="text" required placeholder="Doe"
                  value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            {/* CHANGED: new Username field */}
            <div className="f3" style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#3d3350' }}>Username</label>
              <input className="inp" type="text" required placeholder="johndoe"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            {/* Email — was f3, now f4 because two new fields push it down */}
            <div className="f4" style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#3d3350' }}>Email address</label>
              <input className="inp" type="email" required placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {/* Password — was f4, now f5 */}
            <div className="f5" style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#3d3350' }}>Create Password</label>
              <div style={{ position:'relative' }}>
                <input className="inp" type={showPassword ? 'text' : 'password'} required
                  placeholder="At least 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight:52 }} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#a89ec0', fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif", padding:'3px 5px', transition:'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#b91c1c'}
                  onMouseLeave={e => e.currentTarget.style.color='#a89ec0'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Register Button — was f5, now f6 */}
            <div className="f6">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading
                  ? <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:9 }}>
                      <span style={{ width:15,height:15,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',animation:'spin .7s linear infinite',display:'inline-block' }} />
                      Creating Account…
                    </span>
                  : 'Create Account'}
              </button>
            </div>

            {/* Divider — was f5, now f7 */}
            <div className="f7" style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ flex:1,height:1,background:'linear-gradient(90deg,transparent,#e8e3f5)' }} />
              <span style={{ fontSize:10,fontWeight:700,color:'#c8c2d8',textTransform:'uppercase',letterSpacing:2 }}>or</span>
              <span style={{ flex:1,height:1,background:'linear-gradient(90deg,#e8e3f5,transparent)' }} />
            </div>

            {/* Google Registration — was f6, now f8 */}
            <div className="f8">
              <button type="button" onClick={handleGoogleRegister} className="btn-google">
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

          </form>

          {/* Footer — stays f7 for the link text */}
          <p className="f7" style={{ marginTop:18, textAlign:'center', fontSize:12, color:'#b0a8c8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#b91c1c', fontWeight:700, textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
              Sign in
            </Link>
          </p>

          {/* Trust badge */}
          <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid #f3f0fa', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#c4bdd8" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize:10, color:'#c4bdd8', letterSpacing:1, fontWeight:500 }}>Secured by Supabase Auth</span>
          </div>
        </div>

      </div>
    </>
  );
};

export default Register;


