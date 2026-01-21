
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { Product } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(5000);
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'products', id)).then(d => {
      if (d.exists()) setProduct({ id: d.id, ...d.data() } as Product);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!loading && location.hash === '#calculator' && calculatorRef.current) {
      setTimeout(() => {
        calculatorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [loading, location.hash]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Details...</div>;
  if (!product) return <div className="p-20 text-center text-rose-600 font-bold">System not found in our catalog.</div>;

  // Interactive Calculator Logic
  // Assuming a standard ROI: Savings are roughly 80% of the bill, capped by the system's max production capacity
  const maxPossibleMonthlySavings = product.savings; 
  const currentSavings = Math.min(bill * 0.85, maxPossibleMonthlySavings);
  const paybackYears = (product.price / (currentSavings * 12)).toFixed(1);
  const lifetimeSavings = Math.round(currentSavings * 12 * 25);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex mb-8 text-sm text-slate-500 gap-2">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-emerald-600">Products</Link>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div className="space-y-8">
            <div className="aspect-[4/3] rounded-[40px] overflow-hidden bg-slate-100 border-8 border-slate-50 shadow-2xl relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.stockStatus === 'out_of_stock' && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <span className="text-white font-bold uppercase tracking-widest text-xl">Currently Unavailable</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {product.features.map((feature, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-emerald-600 font-bold text-xs uppercase mb-1">Spec</p>
                  <p className="text-[10px] font-bold text-slate-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 mb-4">{product.name}</h1>
              <p className="text-lg text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1 uppercase tracking-widest font-bold">Total Investment</p>
                  <p className="text-4xl font-bold text-emerald-400">₹{product.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm mb-1 uppercase tracking-widest font-bold">EMI Starts at</p>
                  <p className="text-2xl font-bold">₹{product.emi.toLocaleString()}/mo</p>
                </div>
              </div>
              <div className="h-px bg-slate-800 my-6" />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-2xl bg-slate-800/50">
                  <p className="text-emerald-400 font-bold text-xl">₹{product.savings.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-tighter">Typical Savings</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-800/50">
                  <p className="text-blue-400 font-bold text-xl">{(product.price / (product.savings * 12)).toFixed(1)} Years</p>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-tighter">Fastest Payback</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {product.stockStatus === 'in_stock' ? (
                <Link to={`/checkout?product=${product.id}`} className="flex-1 px-8 py-5 bg-emerald-600 text-white text-center font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition">
                  Get Free Quote
                </Link>
              ) : (
                <button disabled className="flex-1 px-8 py-5 bg-slate-200 text-slate-400 text-center font-bold rounded-2xl cursor-not-allowed">
                  Notify Me When Back
                </button>
              )}
              <button onClick={() => calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 px-8 py-5 bg-white text-slate-900 border-2 border-slate-200 text-center font-bold rounded-2xl hover:bg-slate-50 transition">
                Recalculate ROI
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Calculator Section */}
        <div ref={calculatorRef} id="calculator" className="scroll-mt-32 pt-24 border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-200">
                Interactive ROI Studio
              </span>
              <h2 className="text-4xl font-bold text-slate-900 mt-4">Personalized Payback Analysis</h2>
              <p className="text-slate-500 mt-2">Adjust the slider below to match your monthly consumption and see the {product.capacity} kit's impact.</p>
            </div>

            <div className="bg-white p-8 lg:p-12 rounded-[48px] border border-slate-200 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-16 -translate-y-16 -z-10" />
              
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-slate-900 font-bold text-lg">Your Monthly Electricity Bill</label>
                    <div className="px-6 py-2 bg-slate-900 text-white rounded-full text-xl font-bold">₹{bill.toLocaleString()}</div>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="25000" 
                    step="500"
                    value={bill}
                    onChange={(e) => setBill(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 border border-slate-200"
                  />
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>1,000</span>
                    <span>12,500</span>
                    <span>25,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                    <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">Monthly Savings</p>
                    <p className="text-3xl font-bold text-emerald-900">₹{Math.round(currentSavings).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500 mt-1 font-medium italic">Based on {product.capacity} efficiency</p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                    <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2">Payback Period</p>
                    <p className="text-3xl font-bold text-blue-900">{paybackYears} Years</p>
                    <p className="text-[10px] text-blue-500 mt-1 font-medium italic">Full investment recovery</p>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 text-center">
                    <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-2">25-Year Gain</p>
                    <p className="text-3xl font-bold text-amber-900">₹{lifetimeSavings.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-500 mt-1 font-medium italic">Estimated lifetime value</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      Note: These calculations are based on standard solar yield for {product.capacity} systems in India (approx 4 units per kW per day). Actual results may vary based on rooftop shadow analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
