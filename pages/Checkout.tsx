
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db, auth } from '../firebase';
import { Product } from '../types';

const Checkout: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('product');
    if (pid) {
      getDoc(doc(db, 'products', pid)).then(d => {
        if (d.exists()) setProduct({ id: d.id, ...d.data() } as Product);
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !auth.currentUser) return alert('Please login to request a quote');
    setLoading(true);
    try {
      await addDoc(collection(db, 'quotes'), {
        userId: auth.currentUser.uid,
        userName: formData.name,
        userEmail: formData.email,
        productId: product.id,
        productName: product.name,
        basePrice: product.price,
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        phone: formData.phone,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      alert('Quote request sent! Check your dashboard for updates.');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-10">Request Your Solar Design</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input required onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="John Doe" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input required onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="+91 XXXXX XXXXX" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input required onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="john@example.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Installation Address</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                  <textarea required onChange={e => setFormData({...formData, address: e.target.value})} rows={3} placeholder="Building, Society, Area..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                    <input required onChange={e => setFormData({...formData, pincode: e.target.value})} type="text" placeholder="400001" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <input required onChange={e => setFormData({...formData, city: e.target.value})} type="text" placeholder="Mumbai" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              {product ? (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-600">{product.name}</span>
                    <span className="font-bold">₹{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 text-emerald-600 font-bold">
                    <span>Installation Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-4">
                    <span>Est. Investment</span>
                    <span className="text-emerald-600">₹{product.price.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 mb-6">No product selected</p>
              )}
              <button disabled={loading || !product} type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-50 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Request Final Quote'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
