
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { UserProfile, Quote } from '../types';

interface DashboardProps {
  user: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchQuotes = async () => {
      try {
        const q = query(
          collection(db, 'quotes'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quote)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-1" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-2">Welcome Back</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Hello, {user.displayName}!</h1>
              <p className="text-slate-600">Account: {user.email} • <span className="capitalize">{user.role}</span></p>
            </div>
            <div className="flex gap-4">
              {user.role === 'admin' ? (
                <Link to="/admin" className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition">Go to Admin Console</Link>
              ) : (
                <Link to="/products" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition">New System</Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Your Quotes</h3>
            <div className="space-y-4">
               {quotes.length === 0 ? (
                 <p className="text-xs text-slate-400 text-center py-4">No quote requests yet.</p>
               ) : quotes.map(q => (
                 <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-900">{q.productName}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${q.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {q.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">₹{(q.finalPrice || q.basePrice).toLocaleString()}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Savings Progress</h3>
            <div className="h-64 flex items-center justify-center bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-100">
              <div className="text-center">
                <p className="text-emerald-700 font-bold text-xl mb-1">Live Monitoring Coming Soon!</p>
                <p className="text-slate-500 text-sm">Real-time stats will appear here after your installation is complete.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
