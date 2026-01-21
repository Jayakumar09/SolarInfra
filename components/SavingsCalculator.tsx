
import React, { useState } from 'react';
import { addDoc, collection } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db, auth } from '../firebase';

const SavingsCalculator: React.FC = () => {
  const [bill, setBill] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const estimatedSavingsYearly = (bill * 0.8) * 12;
  const carbonOffset = (bill / 7) * 0.8 * 12 * 0.9;

  const handleCaptureLead = async () => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'leads'), {
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous',
        monthlyBill: bill,
        estimatedSavings: estimatedSavingsYearly,
        carbonOffset: carbonOffset,
        status: 'interested',
        createdAt: Date.now()
      });
      setSuccess(true);
      // Success feedback stays for 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      console.error("Lead capture failed:", e);
      setError("Failed to save design lead. Please check your connection and try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto animate-in fade-in duration-700">
      <h3 className="text-2xl font-bold mb-6 text-slate-900">How much can you save?</h3>
      
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-4">
            <label className="text-slate-600 font-medium">Your Monthly Electricity Bill</label>
            <span className="text-emerald-600 font-bold text-xl">₹{bill.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="500" 
            max="25000" 
            step="500"
            value={bill}
            onChange={(e) => setBill(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-emerald-700 text-sm font-semibold uppercase tracking-wider mb-1">Annual Savings</p>
            <p className="text-3xl font-bold text-emerald-800">₹{estimatedSavingsYearly.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-700 text-sm font-semibold uppercase tracking-wider mb-1">CO2 Offset</p>
            <p className="text-3xl font-bold text-blue-800">{Math.round(carbonOffset)} kg/yr</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 flex items-center gap-2 animate-in fade-in zoom-in">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {error}
          </div>
        )}

        <button 
          onClick={handleCaptureLead}
          disabled={loading || success}
          className={`w-full py-4 text-white font-bold rounded-2xl transition flex items-center justify-center gap-3 ${success ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-900 hover:bg-slate-800 disabled:opacity-50'}`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              Design Lead Captured!
            </>
          ) : (
            'Get Detailed System Design'
          )}
        </button>
        
        {success && (
          <p className="text-center text-[10px] text-emerald-600 font-bold uppercase tracking-widest animate-in slide-in-from-top-2">
            Our experts will contact you for a technical site survey
          </p>
        )}
      </div>
    </div>
  );
};

export default SavingsCalculator;
