import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db, auth } from '../firebase';
import { Product } from '../types';

const Checkout: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('product');
    if (pid) {
      getDoc(doc(db, 'products', pid)).then(d => {
        if (d.exists()) {
          setProduct({ id: d.id, ...d.data() } as Product);
        } else {
          setError("Product not found.");
        }
      }).catch(err => {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('Your session has expired. Please log in again to request a quote.');
      return navigate('/login');
    }
    
    if (!product) {
      return alert('Error: No solar kit selected.');
    }

    setLoading(true);
    try {
      const quoteData = {
        userId: auth.currentUser.uid,
        userName: formData.name.trim(),
        userEmail: formData.email.trim() || auth.currentUser.email,
        productId: product.id,
        productName: product.name,
        basePrice: product.price,
        address: `${formData.address.trim()}, ${formData.city.trim()} - ${formData.pincode.trim()}`,
        phone: formData.phone.trim(),
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await addDoc(collection(db, 'quotes'), quoteData);
      
      alert('Success! Your quote request has been sent. You can track its status in your dashboard.');
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Submission Error:", err);
      if (err.code === 'permission-denied') {
        alert("Permission Denied: Ensure you have published the new Firestore Rules in your console.");
      } else {
        alert(`Failed to request quote: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-10 text-center lg:text-left">Finalize Your Solar Design</h1>
        
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="John Doe" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="+91 XXXXX XXXXX" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="john@example.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Installation Address</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                  <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3} placeholder="Building, Society, Area..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                    <input required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} type="text" placeholder="400001" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" placeholder="Mumbai" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              {product ? (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 text-sm">
                    <span className="text-slate-600">{product.name}</span>
                    <span className="font-bold">₹{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 text-emerald-600 font-bold text-sm">
                    <span>Installation Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-4">
                    <span>Est. Investment</span>
                    <span className="text-emerald-600">₹{product.price.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center gap-2">
                   <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-slate-400 text-xs italic">Syncing system details...</p>
                </div>
              )}
              
              <button 
                disabled={loading || !product} 
                type="submit" 
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-50 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Submitting...' : 'Request Final Quote'}
              </button>
              
              <p className="mt-4 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                No immediate payment required
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;