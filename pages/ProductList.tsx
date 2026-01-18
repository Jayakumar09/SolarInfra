
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { Product } from '../types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(600000);
  const [maxEmi, setMaxEmi] = useState(20000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCapacity = capacityFilter === 'all' || p.capacity.includes(capacityFilter);
    const matchesPrice = p.price <= maxPrice;
    const matchesEmi = p.emi <= maxEmi;
    return matchesCapacity && matchesPrice && matchesEmi;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters (Desktop) / Dropdown (Mobile) */}
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
                Reset All
              </button>
            </div>

            {/* Capacity Filter */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Capacity</label>
              <div className="space-y-2">
                {['all', '1kW', '3kW', '5kW', '10kW'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setCapacityFilter(f)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition ${capacityFilter === f ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                  >
                    {f === 'all' ? 'All Capacities' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Max Price</label>
                <span className="text-xs font-bold text-slate-500">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="600000" 
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* EMI Filter */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Max EMI</label>
                <span className="text-xs font-bold text-slate-500">₹{maxEmi.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="2000" 
                max="20000" 
                step="500"
                value={maxEmi}
                onChange={(e) => setMaxEmi(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Solar Rooftop Kits</h1>
              <p className="text-slate-500 text-sm mt-1">{filteredProducts.length} systems found</p>
            </div>
            
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No matching systems</h3>
              <p className="text-slate-500">Try adjusting your filters to find more options.</p>
              <button 
                onClick={() => {
                  setCapacityFilter('all');
                  setMaxPrice(600000);
                  setMaxEmi(20000);
                }}
                className="mt-6 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {product.capacity} System
                    </div>
                    {product.stockStatus === 'out_of_stock' && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="text-white font-bold uppercase tracking-widest text-xs">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{product.name}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 text-xs">Full Price</span>
                        <span className="text-xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs py-2 border-y border-slate-50">
                        <span className="text-emerald-600 font-bold uppercase">Monthly EMI</span>
                        <span className="text-slate-700 font-semibold">₹{product.emi.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link to={`/product/${product.id}`} className="px-4 py-3 bg-slate-100 text-slate-900 text-center text-sm font-bold rounded-xl hover:bg-slate-200 transition">
                        Details
                      </Link>
                      {product.stockStatus === 'in_stock' ? (
                        <Link to={`/checkout?product=${product.id}`} className="px-4 py-3 bg-emerald-600 text-white text-center text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-50">
                          Add to Quote
                        </Link>
                      ) : (
                        <button disabled className="px-4 py-3 bg-slate-200 text-slate-400 text-center text-sm font-bold rounded-xl cursor-not-allowed">
                          Sold Out
                        </button>
                      )}
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
