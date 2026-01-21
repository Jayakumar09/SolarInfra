
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js';
import { db, storage } from '../firebase';
import { UserProfile, Quote } from '../types';

interface DashboardProps {
  user: UserProfile | null;
}

const PaymentModal: React.FC<{ quote: Quote; onClose: () => void; onSuccess: () => void }> = ({ quote, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment gateway processing delay
    await new Promise(r => setTimeout(r, 2000));
    try {
      await updateDoc(doc(db, 'quotes', quote.id), {
        status: 'paid',
        updatedAt: Date.now()
      });
      onSuccess();
    } catch (e) {
      alert("Payment sync failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Secure Checkout</h3>
            <p className="text-xs text-slate-400 mt-1">Order #{quote.id.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            {(['upi', 'card', 'netbanking'] as const).map(m => (
              <button 
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition ${method === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                {m === 'netbanking' ? 'Bank Transfer' : m}
              </button>
            ))}
          </div>

          <div className="min-h-[260px]">
            {method === 'upi' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    {/* High Visibility QR Code Mockup */}
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 3h2v2h-2v-2zm3 0h3v2h-3v-2zm-3-3h2v2h-2v-2zm-3 0h2v2h-2v-2zm3-3h2v2h-2v-2zm-3 0h2v2h-2v-2zM18 7h2v2h-2V7zm-7 11h2v2h-2v-2zm3-11h2v2h-2V7z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">Scan QR Code to Pay</p>
                    <p className="text-xs text-slate-500 mt-1">Open GPay, PhonePe, or PayTM</p>
                    <div className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-mono text-slate-600">
                      Merchant VPA: solarinfra@canara
                    </div>
                  </div>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Card Number</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Expiry</label>
                     <input type="text" placeholder="MM/YY" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">CVV</label>
                     <input type="text" placeholder="XXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none" />
                   </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] space-y-4">
                  <div className="flex justify-between items-center border-b border-emerald-200/50 pb-3">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Bank Details</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">CANARA BANK</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Account Holder</p>
                      <p className="text-sm font-bold text-slate-900">JAYAKUMAR V</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Account Number</p>
                      <p className="text-base font-black text-slate-900 tracking-wider">1224101086539</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">IFSC Code</p>
                        <p className="text-sm font-bold text-slate-900">CNRB0001224</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Branch</p>
                        <p className="text-sm font-bold text-slate-900">TURAIYUR</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">After transfer, please share the UTR/Reference number with us.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
             <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-slate-900">₹{(quote.finalPrice || quote.basePrice).toLocaleString()}</span>
             </div>
             <button 
              disabled={processing}
              onClick={handlePay}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-50 flex items-center justify-center gap-3 disabled:opacity-50"
             >
               {processing ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Securing Transaction...
                 </>
               ) : (
                 `Confirm Payment`
               )}
             </button>
             <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bold">PCI DSS COMPLIANT • 256-BIT SSL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedPaymentQuote, setSelectedPaymentQuote] = useState<Quote | null>(null);

  // Computed state for high-visibility UI alerts
  const [hasApprovedQuote, setHasApprovedQuote] = useState(false);

  useEffect(() => {
    if (!initialUser?.uid) return;

    setLoading(true);

    // Real-time listener for user profile
    const unsubUser = onSnapshot(doc(db, 'users', initialUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUser(docSnap.data() as UserProfile);
      }
    });

    // Real-time listener for quotes
    const q = query(
      collection(db, 'quotes'), 
      where('userId', '==', initialUser.uid)
    );
    
    const unsubQuotes = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Quote));
      // Sort client-side by newest first
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setQuotes(docs);
      
      // Explicitly trigger the approval banner check
      const approved = docs.some(q => q.status === 'approved' || q.status === 'sent');
      setHasApprovedQuote(approved);
      
      setLoading(false);
    }, (err) => {
      console.error("Quote listener error:", err);
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubQuotes();
    };
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

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please check your internet connection.");
    } finally {
      setUploading(false);
    }
  };

  if (!initialUser) return <Navigate to="/login" />;

  // Find quotes that are approved and ready for payment
  const activeApprovedQuotes = quotes.filter(q => q.status === 'approved' || q.status === 'sent');

  return (
    <div className="bg-slate-50 min-h-screen py-12 relative">
      {selectedPaymentQuote && (
        <PaymentModal 
          quote={selectedPaymentQuote} 
          onClose={() => setSelectedPaymentQuote(null)} 
          onSuccess={() => {
            setSelectedPaymentQuote(null);
            alert("Payment successful! Your installation is now in our queue.");
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Real-time Status Alert - Visible as soon as Admin clicks Approve */}
        {hasApprovedQuote && activeApprovedQuotes.length > 0 && (
          <div className="mb-8 p-8 bg-emerald-600 rounded-[40px] shadow-2xl shadow-emerald-200/40 animate-in slide-in-from-top-6 flex flex-col md:flex-row items-center justify-between gap-8 ring-4 ring-emerald-500/10 border border-emerald-400/30">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-white shadow-inner">
                <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="text-white text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight">Quote Approved & Ready!</h2>
                <p className="text-emerald-50 font-medium opacity-90 text-sm mt-1">Click the button to secure your rooftop solar kit and lock in your installation date.</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPaymentQuote(activeApprovedQuotes[0])}
              className="px-10 py-5 bg-white text-emerald-700 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-xl whitespace-nowrap active:scale-95 flex items-center gap-3 group"
            >
              <span>Complete Payment Now</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        )}

        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-sm border border-slate-100 overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-1" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mb-2">Connected Dashboard</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Hi, {user?.displayName || initialUser.displayName}</h1>
              <p className="text-slate-600 text-sm font-medium">Account: {user?.email || initialUser.email} • <span className="capitalize font-bold text-emerald-600">{user?.role || initialUser.role}</span></p>
            </div>
            <div className="flex gap-4">
              {initialUser.role === 'admin' && (
                <Link to="/admin" className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition text-sm shadow-lg shadow-rose-100">Admin Console</Link>
              )}
              <Link to="/products" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition text-sm shadow-lg shadow-slate-200">New Request</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              My Quotes
            </h3>
            <div className="space-y-4 flex-grow">
               {loading ? (
                 <div className="flex flex-col items-center py-10 gap-3">
                   <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Syncing status...</p>
                 </div>
               ) : quotes.length === 0 ? (
                 <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 text-sm">No requests found.</p>
                   <Link to="/products" className="text-emerald-600 font-bold text-xs hover:underline mt-2 block uppercase tracking-wider">Start Here →</Link>
                 </div>
               ) : quotes.map(q => (
                 <div key={q.id} className={`p-6 rounded-3xl border transition-all duration-300 ${q.status === 'approved' ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10' : 'bg-slate-50 border-slate-100 group hover:border-emerald-200 hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-bold text-slate-900 line-clamp-1 flex-1">{q.productName}</p>
                       <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${
                        q.status === 'paid' ? 'bg-emerald-500 text-white' :
                        q.status === 'approved' ? 'bg-emerald-600 text-white animate-pulse shadow-sm' : 
                        q.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-5 font-medium">{new Date(q.createdAt).toLocaleDateString()}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
                      <span className="text-sm font-black text-slate-900">₹{(q.finalPrice || q.basePrice).toLocaleString()}</span>
                      {(q.status === 'approved' || q.status === 'sent') && (
                        <button 
                          onClick={() => setSelectedPaymentQuote(q)}
                          className="px-5 py-2 bg-emerald-600 text-white text-[11px] font-black uppercase rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
                        >
                          Complete Payment
                        </button>
                      )}
                      {q.status === 'paid' && (
                         <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1.5 uppercase">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                           Order Confirmed
                         </span>
                      )}
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Engineering Docs
            </h3>
            
            {user?.latestBillURL && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Recent Electricity Bill</p>
                  <p className="text-[10px] text-blue-500">Verified on {new Date(user.billUpdatedAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <a href={user.latestBillURL} target="_blank" rel="noreferrer" className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:text-blue-700 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            )}

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Maintain an active bill on file to speed up technical site surveys.
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
                  <span className="text-xs font-bold text-slate-500 uppercase">Saving...</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-700 block">{user?.latestBillURL ? 'Update Bill' : 'Upload Bill'}</span>
                </div>
              )}
            </label>

            {uploadSuccess && (
              <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl text-center animate-bounce">
                ✓ Document Uploaded Successfully
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Plant Stats
            </h3>
            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 text-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                 <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">System Offline</p>
              <p className="text-slate-400 text-[10px] leading-relaxed italic">Real-time production data will appear here once your panels are commissioned.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
