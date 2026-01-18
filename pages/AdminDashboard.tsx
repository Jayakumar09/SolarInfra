
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, deleteDoc, addDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { db } from '../firebase';
import { UserProfile, Product, Quote } from '../types';

interface AdminDashboardProps {
  user: UserProfile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'quotes'>('quotes');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    capacity: '1kW',
    price: 0,
    emi: 0,
    savings: 0,
    image: '',
    description: '',
    features: [],
    stockStatus: 'in_stock'
  });
  const [featureInput, setFeatureInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const uQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      const pQ = query(collection(db, 'products'), orderBy('capacity', 'asc'));
      const qQ = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
      
      const [uSnap, pSnap, qSnap] = await Promise.all([
        getDocs(uQ), 
        getDocs(pQ), 
        getDocs(qQ)
      ]);
      
      setUsers(uSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setQuotes(qSnap.docs.map(d => ({ id: d.id, ...d.data() } as Quote)));
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const toggleStock = async (product: Product) => {
    const newStatus = product.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
    await updateDoc(doc(db, 'products', product.id), { stockStatus: newStatus });
    setProducts(products.map(p => p.id === product.id ? { ...p, stockStatus: newStatus } : p));
  };

  const updatePrice = async (id: string, newPrice: number) => {
    const newEmi = Math.round(newPrice / 30);
    await updateDoc(doc(db, 'products', id), { price: newPrice, emi: newEmi });
    setProducts(products.map(p => p.id === id ? { ...p, price: newPrice, emi: newEmi } : p));
  };

  const handleQuoteRevision = async (quote: Quote, finalPrice: number, status: Quote['status']) => {
    await updateDoc(doc(db, 'quotes', quote.id), { finalPrice, status, updatedAt: Date.now() });
    setQuotes(quotes.map(q => q.id === quote.id ? { ...q, finalPrice, status } : q));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productToSave = {
        ...newProduct,
        features: featureInput.split(',').map(f => f.trim()).filter(f => f !== ''),
        emi: Math.round(newProduct.price / 30),
        savings: Math.round(newProduct.price * 0.025), // Basic estimation logic
        updatedAt: Date.now()
      };
      
      await addDoc(collection(db, 'products'), productToSave);
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        capacity: '1kW',
        price: 0,
        emi: 0,
        savings: 0,
        image: '',
        description: '',
        features: [],
        stockStatus: 'in_stock'
      });
      setFeatureInput('');
      fetchData(); // Refresh list
    } catch (e) {
      alert("Error adding product: " + (e as Error).message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to remove this solar kit?")) {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 relative">
      {/* Product Add Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingProduct(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Add New Solar Kit</h2>
              <button onClick={() => setIsAddingProduct(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Product Name</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Premium Residential 5kW" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Capacity</label>
                  <select value={newProduct.capacity} onChange={e => setNewProduct({...newProduct, capacity: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    <option value="1kW">1kW</option>
                    <option value="3kW">3kW</option>
                    <option value="5kW">5kW</option>
                    <option value="10kW">10kW</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Price (₹)</label>
                  <input required type="number" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value)})} placeholder="e.g. 295000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Image URL</label>
                  <input required type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Description</label>
                  <textarea required rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Tell users about this system..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Features (comma separated)</label>
                  <input required type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="e.g. WiFi Monitoring, 25yr Warranty, Tier-1 Panels" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Stock Status</label>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setNewProduct({...newProduct, stockStatus: 'in_stock'})} className={`flex-1 py-3 rounded-xl font-bold transition ${newProduct.stockStatus === 'in_stock' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>In Stock</button>
                    <button type="button" onClick={() => setNewProduct({...newProduct, stockStatus: 'out_of_stock'})} className={`flex-1 py-3 rounded-xl font-bold transition ${newProduct.stockStatus === 'out_of_stock' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Out of Stock</button>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition">Save Solar Kit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase tracking-widest">Administrator</span>
            <h1 className="text-4xl font-bold text-slate-900 mt-2">Platform Control</h1>
          </div>
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
            {(['quotes', 'products', 'users'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl font-bold capitalize transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'quotes' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Client</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">System</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.length === 0 ? (
                   <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">No quote requests found.</td></tr>
                ) : quotes.map(q => (
                  <tr key={q.id}>
                    <td className="p-4">
                      <div className="font-bold">{q.userName}</div>
                      <div className="text-xs text-slate-500">{q.userEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{q.productName}</div>
                      <div className="text-xs text-emerald-600 font-bold">Base: ₹{q.basePrice.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${q.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button 
                        onClick={() => handleQuoteRevision(q, q.basePrice * 0.95, 'sent')}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition"
                      >
                        Revise & Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg line-clamp-1">{p.name}</h3>
                    <button 
                      onClick={() => toggleStock(p)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${p.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {p.stockStatus.replace('_', ' ')}
                    </button>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                    <div className="relative h-32 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                       <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Base Rate (₹)</label>
                      <input 
                        type="number" 
                        defaultValue={p.price}
                        onBlur={(e) => updatePrice(p.id, parseInt(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition">Edit Details</button>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="border-4 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-8 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition group min-h-[300px]"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="font-bold">Add New Solar Kit</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.uid}>
                    <td className="p-4 font-bold">{u.displayName}</td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
