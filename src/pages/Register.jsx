import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; 

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ✅ ADDED STATES
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');

    // ✅ OPTIONAL VALIDATION
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // PR-02 Logic: Email/Password Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      alert("Error: " + error.message);
    } else {
      alert("Registration successful! Check your email if confirmation is required.");
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`
        html, body, #root { height: 100%; margin: 0; }
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
        .font-dm-serif { font-family: 'DM Serif Display', serif; }
        .left-gradient { background: linear-gradient(150deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 65%, #f97316 100%); }
        .input-focus:focus { border-color: #b91c1c; outline: none; box-shadow: 0 0 0 4px rgba(185,28,28,0.1); }
      `}</style>

      <div className="flex h-screen w-screen overflow-hidden font-dm-sans">
        <div className="left-gradient flex flex-[3] flex-col justify-end p-16 text-white">
          <h1 className="font-dm-serif text-6xl mb-4 leading-tight">Start your<br/>journey</h1>
          <p className="opacity-75 max-w-xs text-sm">Create an account to unlock all features.</p>
        </div>

        <div className="flex flex-[2] flex-col justify-center px-16 bg-white border-l border-gray-100">
          <p className="text-[10px] font-bold tracking-widest text-red-700 uppercase mb-2">Create Account</p>
          <h2 className="font-dm-serif text-3xl mb-6 text-[#0f0a1e]">Join us today</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="input-focus w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-focus w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="input-focus w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-11" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* ✅ UPDATED BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 mt-2 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* ✅ ERROR MESSAGE UI */}
          {errorMsg && (
            <p className="text-red-600 text-xs mt-2 text-center">
              {errorMsg}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            Already have an account? <Link to="/login" className="font-bold text-red-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;