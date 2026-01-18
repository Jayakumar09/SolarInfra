
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { Product } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(5000);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'products', id)).then(d => {
      if (d.exists()) setProduct({ id: d.id, ...d.data() } as Product);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Details...</div>;
  if (!product) return <div className="p-20 text-center text-rose-600 font-bold">System not found in our catalog.</div>;

  const paybackYears = (product.price / (product.savings * 12)).toFixed(1);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
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
                  <p className="text-slate-400 text-xs">Monthly Savings</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-800/50">
                  <p className="text-blue-400 font-bold text-xl">{paybackYears} Years</p>
                  <p className="text-slate-400 text-xs">Payback Period</p>
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
              <button className="flex-1 px-8 py-5 bg-white text-slate-900 border-2 border-slate-200 text-center font-bold rounded-2xl hover:bg-slate-50 transition">
                Schedule Site Visit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
