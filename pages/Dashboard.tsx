
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js';
import { db, storage } from '../firebase';
import { UserProfile, Quote } from '../types';

interface DashboardProps {
  user: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Refresh user data to get latest document URLs
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        }

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
    fetchData();
  }, [initialUser?.uid]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/docs/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateDoc(doc(db, 'users', user.uid), {
        latestBillURL: downloadURL,
        billUpdatedAt: Date.now()
      });

      // Local state update
      setUser(prev => prev ? { ...prev, latestBillURL: downloadURL, billUpdatedAt: Date.now() } : null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please ensure you have enabled Firebase Storage and try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-sm border border-slate-100 overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-1" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-2">Solar Account</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Hello, {user.displayName}!</h1>
              <p className="text-slate-600">Email: {user.email} • <span className="capitalize font-bold text-emerald-600">{user.role}</span></p>
            </div>
            <div className="flex gap-4">
              {user.role === 'admin' && (
                <Link to="/admin" className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition">Admin Console</Link>
              )}
              <Link to="/products" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition">New System</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quotes Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Quote History
            </h3>
            <div className="space-y-4 flex-grow">
               {quotes.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 text-sm">No solar quotes yet.</p>
                   <Link to="/products" className="text-emerald-600 font-bold text-xs hover:underline mt-2 block uppercase tracking-wider">Browse Kits</Link>
                 </div>
               ) : quotes.map(q => (
                 <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition">
                    <p className="font-bold text-slate-900 line-clamp-1">{q.productName}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${q.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {q.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">₹{(q.finalPrice || q.basePrice).toLocaleString()}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Site Documents
            </h3>
            
            {user.latestBillURL && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Electricity Bill</p>
                  <p className="text-[10px] text-blue-500">Last updated: {new Date(user.billUpdatedAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <a href={user.latestBillURL} target="_blank" rel="noreferrer" className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:text-blue-700 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            )}

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Upload your latest electricity bill. Our engineers use this to calculate your exact roof capacity.
            </p>
            
            <label className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 transition cursor-pointer ${uploading ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'hover:border-emerald-400 hover:bg-emerald-50 border-slate-200'}`}>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600 mb-2"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Processing...</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-700 block">{user.latestBillURL ? 'Update Document' : 'Select File'}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tighter">PDF or Image (Max 5MB)</span>
                </div>
              )}
            </label>

            {uploadSuccess && (
              <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl text-center animate-bounce">
                ✓ Document Saved Successfully!
              </div>
            )}
          </div>

          {/* Monitoring / Savings Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Live Savings
            </h3>
            <div className="flex-grow flex flex-col items-center justify-center bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-100 text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                 <svg className="w-8 h-8 text-emerald-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              </div>
              <p className="text-emerald-700 font-bold text-lg mb-1 italic">Waiting for connection</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">Monitoring activates automatically once your rooftop system is connected to the grid.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
