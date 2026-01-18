
import React, { useState } from 'react';

const SavingsCalculator: React.FC = () => {
  const [bill, setBill] = useState(3000);
  
  const estimatedSavingsYearly = (bill * 0.8) * 12; // Simplified logic
  const carbonOffset = (bill / 7) * 0.8 * 12 * 0.9; // approx kg CO2

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
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

        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition">
          Get Detailed System Design
        </button>
      </div>
    </div>
  );
};

export default SavingsCalculator;
