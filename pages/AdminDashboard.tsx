
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc, addDoc, writeBatch } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { UserProfile, Product, Quote } from '../types';
import { SOLAR_PRODUCTS } from '../constants';

interface AdminDashboardProps {
  user: UserProfile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'quotes'>('products');
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{connected: boolean, role: string}>({ connected: false, role: 'checking...' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    capacity: '1kW',
    price: 0,
    emi: 0,
    savings: 0,
    image: '',
    description: '',
    features: [],
    quantity: 1,
    stockStatus: 'in_stock'
  });
  const [featureInput, setFeatureInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REAL-TIME SYNC
  useEffect(() => {
    setLoading(true);
    
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      list.sort((a, b) => a.capacity.localeCompare(b.capacity, undefined, { numeric: true }));
      setProducts(list);
      setLoading(false);
      setStatus(prev => ({ ...prev, connected: true, role: user.role }));
    }, (error) => {
      console.error("Products Sync Error:", error);
      setLoading(false);
    });

    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      setQuotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quote)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() })));
    });

    return () => {
      unsubProducts();
      unsubQuotes();
      unsubUsers();
    };
  }, [user.uid]);

  const seedCatalog = async () => {
    if (!confirm("This will restore the default solar systems. Continue?")) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      SOLAR_PRODUCTS.forEach((p) => {
        const docRef = doc(db, 'products', p.id);
        batch.set(docRef, { 
          ...p, 
          updatedAt: Date.now(),
          stockStatus: p.quantity > 0 ? 'in_stock' : 'out_of_stock'
        });
      });
      await batch.commit();
      alert("Database updated!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', capacity: '1kW', price: 0, emi: 0, savings: 0,
      image: '', description: '', features: [], quantity: 1, stockStatus: 'in_stock'
    });
    setFeatureInput('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name, capacity: product.capacity, price: product.price,
      emi: product.emi, savings: product.savings, image: product.image,
      description: product.description, features: product.features,
      quantity: product.quantity || 0, stockStatus: product.stockStatus
    });
    setFeatureInput(product.features.join(', '));
    setIsFormOpen(true);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalData = {
        ...formData,
        stockStatus: formData.quantity > 0 ? 'in_stock' : 'out_of_stock',
        features: featureInput.split(',').map(f => f.trim()).filter(f => f !== ''),
        emi: Math.round(formData.price / 30),
        savings: Math.round(formData.price * 0.025),
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), finalData);
      } else {
        await addDoc(collection(db, 'products'), finalData);
      }
      resetForm();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuantity = async (product: Product, delta: number) => {
    try {
      const newQty = Math.max(0, (product.quantity || 0) + delta);
      await updateDoc(doc(db, 'products', product.id), { 
        quantity: newQty, 
        stockStatus: newQty > 0 ? 'in_stock' : 'out_of_stock' 
      });
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete permanently?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (e: any) {
        alert("Delete failed: " + e.message);
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-200">
                Admin Control Panel
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${status.connected ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-amber-200 text-amber-600 bg-amber-50'}`}>
                {status.connected ? '● Live Connection Active' : '○ Connecting...'}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mt-3 tracking-tight">Solarinfra Management</h1>
          </div>
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
            {(['quotes', 'products', 'users'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm gap-4">
               <div className="text-center sm:text-left">
                 <p className="text-sm font-bold text-slate-900">{products.length} Products Found</p>
                 <p className="text-xs text-slate-400">Database synchronized automatically</p>
               </div>
               <button 
                 onClick={seedCatalog}
                 disabled={isSubmitting}
                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg disabled:opacity-50"
               >
                 {isSubmitting ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 )}
                 Restore Default Catalog
               </button>
            </div>

            {/* Form Section */}
            <div ref={formRef} className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <button 
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingId ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Solar Kit' : 'Add New Solar Kit'}</h2>
                    <p className="text-sm text-slate-500">Update system specifications and inventory quantity</p>
                  </div>
                </div>
                <svg className={`w-6 h-6 text-slate-400 transition-transform ${isFormOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isFormOpen && (
                <form onSubmit={handleSubmit} className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 mt-4">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Product Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium 3kW Mono PERC System" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Capacity</label>
                        <select value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          <option value="1kW">1kW</option>
                          <option value="3kW">3kW</option>
                          <option value="5kW">5kW</option>
                          <option value="10kW">10kW</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Price (₹)</label>
                        <input required type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} placeholder="185000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Stock Quantity (Units)</label>
                        <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="10" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Features (comma separated)</label>
                      <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="545Wp Panels, WiFi Monitoring" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Image URL</label>
                      <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Short Description</label>
                      <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"></textarea>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">Cancel</button>
                      <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-50 disabled:opacity-50 transition">
                        {isSubmitting ? 'Saving...' : editingId ? 'Update Kit' : 'Create Kit'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading && products.length === 0 ? (
                 <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[40px] border border-slate-200">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="font-bold uppercase tracking-widest text-xs">Syncing with Firestore...</p>
                 </div>
              ) : products.length === 0 ? (
                 <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-12">
                   <h3 className="text-lg font-bold text-slate-900 mb-1 italic">No products found.</h3>
                   <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Fill the form above or click Restore Catalog to begin.</p>
                 </div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition group">
                    <div className="relative h-44 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      <div className="absolute top-4 left-4 flex gap-2">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                          p.quantity > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {p.quantity > 0 ? `${p.quantity} Units` : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{p.name}</h3>
                        <span className="text-[10px] font-black text-slate-300 uppercase">{p.capacity}</span>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase mb-2">
                          <span>Inventory Level</span>
                          <span className={p.quantity < 5 ? 'text-rose-500' : 'text-emerald-500'}>{p.quantity} Units</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${p.quantity < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (p.quantity / 20) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2">
                        <button onClick={() => updateQuantity(p, 1)} className="bg-emerald-50 text-emerald-600 py-2 rounded-xl text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition">Add 1</button>
                        <button onClick={() => updateQuantity(p, -1)} className="bg-slate-50 text-slate-600 py-2 rounded-xl text-[10px] font-bold border border-slate-100 hover:bg-slate-100 transition">Remove 1</button>
                        <button onClick={() => handleEditClick(p)} className="col-span-2 bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-slate-800 transition">Edit Details</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="col-span-2 py-2 text-rose-500 text-[10px] font-bold uppercase hover:underline">Delete Permanently</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
           <div className="bg-white rounded-[40px] p-12 text-center text-slate-400 border border-slate-100">
             <p className="font-bold">Customer Quotes list will appear here.</p>
             <p className="text-xs">There are currently {quotes.length} inquiries.</p>
           </div>
        )}

        {activeTab === 'users' && (
           <div className="bg-white rounded-[40px] p-12 text-center text-slate-400 border border-slate-100">
             <p className="font-bold">Registered Users list ({users.length})</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
