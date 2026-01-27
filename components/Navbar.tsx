
import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">SolarInfra<span className="text-emerald-600">.wuaze</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className="text-slate-600 hover:text-emerald-600 font-medium transition">Products</Link>
            <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition">Calculators</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-rose-600 hover:text-rose-700 font-bold transition">Admin Console</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden sm:block text-slate-700 font-medium">Hi, {user.displayName?.split(' ')[0]}</Link>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition">Login</Link>
                <Link to="/signup" className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-100 transition">Get Quote</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
