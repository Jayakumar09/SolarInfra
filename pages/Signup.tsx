
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { auth, db } from '../firebase';
import { ADMIN_EMAIL } from '../constants';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let newPass = "";
    for (let i = 0; i < 14; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
    setShowPassword(true);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const userEmail = email.trim().toLowerCase();
      const role = userEmail === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: userEmail,
        displayName: name,
        role: role,
        createdAt: Date.now()
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error("Signup error details:", err);
      let friendlyMessage = "Failed to create account. Please try again.";
      
      if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = "Email/Password registration is disabled in Firebase Console.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered. Please sign in instead.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "The password is too weak.";
      }
      
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Start Your Journey</h2>
          <p className="mt-2 text-slate-500">Join 5000+ homeowners saving on energy</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition ${email && !validateEmail(email) ? 'border-red-300' : 'border-slate-200'}`} 
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button 
                  type="button"
                  onClick={generateStrongPassword}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition pr-20" 
                  placeholder="••••••••"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={copyToClipboard}
                    className={`p-1.5 rounded-lg transition ${copied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 014.138-4.39M9.21 9.21L3 3m0 0l3 3m-3-3l18 18m-5.838-5.838A4.947 4.947 0 0112 15a4.948 4.948 0 01-2.79-1.21m2.79-10.79c4.478 0 8.268 2.943 9.542 7a10.059 10.059 0 01-2.27 3.737M15.035 15.035a4.978 4.978 0 01-3.035 1.965" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-50 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
