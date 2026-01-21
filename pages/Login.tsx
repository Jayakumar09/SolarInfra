
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import { auth } from '../firebase';
import { UserProfile } from '../types';

interface LoginProps { user: UserProfile | null; }

const Login: React.FC<LoginProps> = ({ user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentDomain = window.location.hostname || "local-preview";

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setErrorCode('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Ensure local persistence for wuaze.com subdomains
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setErrorCode(err.code);
      if (err.code === 'auth/network-request-failed') {
        setError('Network Connection Failed. If you are on wuaze.com, please check if Firebase is whitelisted in your console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain "${currentDomain}" is not authorized in Firebase Console.`);
      } else {
        setError(err.message || "An unknown authentication error occurred.");
      }
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
    } catch (err: any) {
      setErrorCode(err.code);
      console.error("Email Login Error:", err.code, err.message);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Incorrect email or password. Please try again.');
          break;
        case 'auth/network-request-failed':
          setError('Network request failed. This is common on InfinityFree. Try disabling ad-blockers or using a different browser.');
          break;
        case 'auth/too-many-requests':
          setError('Access to this account has been temporarily disabled due to many failed login attempts.');
          break;
        default:
          setError(err.message || "Login failed.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Login to SolarInfra</h2>
          <p className="mt-2 text-slate-500">Access your solar dashboard</p>
        </div>
        
        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 animate-in fade-in">
            <div className="flex gap-2 mb-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p>{error}</p>
            </div>
            
            {(errorCode === 'auth/unauthorized-domain' || errorCode === 'auth/network-request-failed' || errorCode === 'auth/internal-error') && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-rose-200 text-[11px] text-slate-600 leading-relaxed shadow-inner">
                <p className="font-bold text-rose-700 uppercase mb-2 tracking-widest">Setup Guide for wuaze.com:</p>
                <ol className="list-decimal ml-4 space-y-2">
                  <li>Go to <strong>Firebase Console</strong> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong>.</li>
                  <li>Click <strong>Authorized Domains</strong> &gt; <strong>Add Domain</strong>.</li>
                  <li>Add exactly: <code className="bg-slate-100 px-1 font-mono text-rose-600">solarinfra.wuaze.com</code></li>
                  <li>Ensure your hosting isn't blocking <code className="bg-slate-100 px-1">firebaseapp.com</code>.</li>
                  <li>Clear your browser cache and try again.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-slate-200 rounded-2xl bg-white text-slate-700 font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.69 14.94 0 12 0 7.31 0 3.25 2.69 1.25 6.64l3.8 2.95C5.96 6.8 8.76 5.04 12 5.04z" />
              <path fill="#FBBC05" d="M23.75 12.25c0-.85-.07-1.68-.21-2.5H12v4.75h6.58c-.28 1.49-1.12 2.76-2.38 3.6l3.7 2.87c2.16-1.99 3.42-4.92 3.42-8.72z" />
              <path fill="#4285F4" d="M5.05 14.41c-.26-.78-.41-1.62-.41-2.41s.15-1.63.41-2.41L1.25 6.64C.45 8.24 0 10.07 0 12s.45 3.76 1.25 5.36l3.8-2.95z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.81 1.1-3.24 0-6.04-2.2-7.02-5.16l-3.8 2.95C3.25 21.31 7.31 24 12 24z" />
            </svg>
            Sign in with Google
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Or email</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
              placeholder="Email address"
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                placeholder="Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-50 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          New here? <Link to="/signup" className="text-emerald-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
