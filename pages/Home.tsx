
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit, orderBy } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { Product } from '../types';
import SavingsCalculator from '../components/SavingsCalculator';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('capacity', 'asc'), limit(3));
        const snap = await getDocs(q);
        setFeaturedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      } catch (e) {
        console.error("Error fetching home products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-emerald-50 rounded-bl-[120px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Official SolarInfra Online Store
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1]">
                Own the Sun. <br />
                <span className="text-emerald-600">Free your Bill.</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed mx-auto lg:mx-0">
                Premium rooftop solar kits starting from ₹65,000. Verified components, zero-EMI options, and 25-year peace of mind.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link to="/products" className="px-10 py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition transform hover:-translate-y-1">
                  Start Saving Today
                </Link>
                <Link to="/products" className="px-10 py-5 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition">
                  Browse Catalog
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-6">
                <div><p className="text-2xl font-bold text-slate-900">5k+</p><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Installed</p></div>
                <div className="w-px h-10 bg-slate-200" />
                <div><p className="text-2xl font-bold text-slate-900">20yr</p><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Warranty</p></div>
                <div className="w-px h-10 bg-slate-200" />
                <div><p className="text-2xl font-bold text-slate-900">Easy</p><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">EMI</p></div>
              </div>
            </div>

            <div className="lg:w-1/2">
               <SavingsCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4 text-center md:text-left">
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Featured Solar Plans</h2>
              <p className="text-slate-500 mt-2 text-lg">In-stock and ready for immediate deployment</p>
            </div>
            <Link to="/products" className="px-6 py-3 bg-white text-emerald-600 border border-emerald-100 font-bold rounded-xl hover:bg-emerald-50 transition flex items-center gap-2">
              View All Systems
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="bg-white h-[450px] rounded-[40px] animate-pulse border border-slate-100" />)
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-3 py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Store Empty</p>
                <Link to="/admin" className="text-emerald-600 font-bold hover:underline">Setup Catalog in Admin Console →</Link>
              </div>
            ) : (
              featuredProducts.map(p => (
                <div key={p.id} className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="h-56 overflow-hidden relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {p.capacity} System
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{p.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.quantity < 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {p.quantity > 0 ? `${p.quantity} Units In Stock` : 'Sold Out'}
                       </span>
                    </div>
                    <div className="flex justify-between items-center mb-8 mt-auto">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Price</p>
                        <p className="text-2xl font-bold text-slate-900">₹{p.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest">Monthly EMI</p>
                        <p className="text-lg font-bold text-emerald-600">₹{p.emi.toLocaleString()}</p>
                      </div>
                    </div>
                    <Link to={`/product/${p.id}`} className="block w-full text-center py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition">
                      Explore Specifications
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges Section remains same */}
    </div>
  );
};

export default Home;
