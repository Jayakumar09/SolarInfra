
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { Product, UserProfile } from '../types';
import { SOLAR_PRODUCTS } from '../constants';

interface ProductListProps {
  user?: UserProfile | null;
}

const ProductList: React.FC<ProductListProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Filter States
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(600000);
  const [maxEmi, setMaxEmi] = useState(20000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('capacity', 'asc'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
    } catch (e) {
      console.error("Firestore Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuickSeed = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      SOLAR_PRODUCTS.forEach((product) => {
        const newDocRef = doc(collection(db, 'products'));
        batch.set(newDocRef, { ...product, updatedAt: Date.now() });
      });
      await batch.commit();
      alert("Store catalog initialized!");
      fetchProducts();
    } catch (e) {
      alert("Seeding failed: " + (e as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCapacity = capacityFilter === 'all' || p.capacity.includes(capacityFilter);
    const matchesPrice = (p.price || 0) <= maxPrice;
    const matchesEmi = (p.emi || 0) <= maxEmi;
    return matchesCapacity && matchesPrice && matchesEmi;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Catalog...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className={`md:w-64 space-y-8 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <button 
                onClick={() => {
                  setCapacityFilter('all');
                  setMaxPrice(600000);
                  setMaxEmi(20000);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Reset
              </button>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Capacity</label>
              <div className="space-y-2">
                {['all', '1kW', '3kW', '5kW', '10kW'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setCapacityFilter(f)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition ${capacityFilter === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {f === 'all' ? 'All Systems' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Price</label>
                <span className="text-xs font-bold text-slate-900">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input type="range" min="50000" max="600000" step="10000" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Solar Rooftop Kits</h1>
              <p className="text-slate-500 text-sm mt-1">{filteredProducts.length} systems available</p>
            </div>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="md:hidden px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm">Filters</button>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Store catalog is empty</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">No products were found in the database. Please initialize the catalog to start selling.</p>
              
              {user?.role === 'admin' && (
                <button 
                  onClick={handleQuickSeed}
                  disabled={isSeeding}
                  className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-50 hover:bg-emerald-700 transition flex items-center gap-3 mx-auto disabled:opacity-50"
                >
                  {isSeeding ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {isSeeding ? 'Initializing Catalog...' : 'Seed Default Catalog Now'}
                </button>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
               <h3 className="text-xl font-bold text-slate-900 mb-2">No matching systems</h3>
               <p className="text-slate-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {product.capacity} System
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.quantity < 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {product.quantity > 0 ? `${product.quantity} Units Left` : 'Notify when back'}
                       </span>
                    </div>
                    
                    <div className="space-y-3 mb-6 mt-auto">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Total Investment</span>
                        <span className="text-xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs py-2 border-y border-slate-50">
                        <span className="text-emerald-600 font-bold uppercase">EMI ₹{product.emi.toLocaleString()}</span>
                        <span className="text-slate-400 font-medium italic">Save ₹{product.savings.toLocaleString()}/mo</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link 
                        to={`/product/${product.id}#calculator`} 
                        className="w-full py-3 bg-emerald-50 text-emerald-700 text-center text-xs font-bold rounded-xl hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        View Calculator
                      </Link>
                      <div className="grid grid-cols-2 gap-3">
                        <Link to={`/product/${product.id}`} className="px-4 py-3 bg-slate-100 text-slate-900 text-center text-xs font-bold rounded-xl hover:bg-slate-200 transition">
                          Specs
                        </Link>
                        <Link to={`/checkout?product=${product.id}`} className="px-4 py-3 bg-emerald-600 text-white text-center text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-50">
                          Get Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
