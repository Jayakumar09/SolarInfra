
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, writeBatch, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js';
import { GoogleGenAI } from "@google/genai";
import { db, storage } from '../firebase';
import { UserProfile, Product, Quote, DesignLead } from '../types';
import { SOLAR_PRODUCTS, ADMIN_EMAIL } from '../constants';

interface AdminDashboardProps {
  user: UserProfile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'quotes' | 'leads'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [leads, setLeads] = useState<DesignLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ connected: false, isAdmin: false });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [visualMode, setVisualMode] = useState<'manual' | 'ai'>('manual');
  
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    name: '',
    capacity: '1kW',
    price: 0,
    emi: 0,
    savings: 0,
    image: '',
    description: '',
    features: [],
    quantity: 1,
    stockStatus: 'in_stock' as const
  };

  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormState);
  const [featureInput, setFeatureInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [quoteUpdating, setQuoteUpdating] = useState<string | null>(null);

  useEffect(() => {
    const isOwner = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    setStatus(prev => ({ ...prev, isAdmin: isOwner }));

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      list.sort((a, b) => a.capacity.localeCompare(b.capacity, undefined, { numeric: true }));
      setProducts(list);
      setLoading(false);
      setStatus(prev => ({ ...prev, connected: true }));
    }, (err) => {
      console.error("Firestore Products error:", err);
      setLoading(false);
    });

    const unsubQuotes = onSnapshot(query(collection(db, 'quotes'), orderBy('createdAt', 'desc')), (snapshot) => {
      setQuotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quote)));
    }, (err) => {
      console.error("Firestore Quotes error:", err);
    });

    const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snapshot) => {
      setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DesignLead)));
    }, (err) => {
      console.error("Firestore Leads error:", err);
    });

    return () => {
      unsubProducts();
      unsubQuotes();
      unsubLeads();
    };
  }, [user.uid]);

  const resetForm = (keepOpen = false) => {
    setFormData({ ...initialFormState });
    setFeatureInput('');
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setAiPrompt('');
    setVisualMode('manual');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!keepOpen) setIsFormOpen(false);
  };

  const handleRestoreDefaults = async () => {
    if (!confirm("Caution: This will delete ALL current products and restore the original 4 kits. Are you sure?")) return;
    setIsSubmitting(true);
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
      SOLAR_PRODUCTS.forEach(product => {
        const newDocRef = doc(db, 'products', product.id);
        batch.set(newDocRef, { ...product, updatedAt: Date.now() });
      });
      await batch.commit();
    } catch (error: any) {
      alert("Restore failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuote = async (id: string, updates: Partial<Quote>) => {
    setQuoteUpdating(id);
    try {
      await updateDoc(doc(db, 'quotes', id), { ...updates, updatedAt: Date.now() });
      // Success will be reflected via real-time listener
    } catch (e: any) {
      alert("Update failed: " + e.message);
    } finally {
      setTimeout(() => setQuoteUpdating(null), 1000);
    }
  };

  const handleUpdateLead = async (id: string, status: DesignLead['status']) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status });
    } catch (e: any) {
      alert("Failed to update lead status: " + e.message);
    }
  };

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return alert("Please describe the scene for the AI generator.");
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const refinedPrompt = `A high-end, photorealistic 4k promotional image for a ${formData.capacity} residential solar rooftop system. Subject: ${aiPrompt}. Style: Clean architectural photography.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: refinedPrompt }] },
        config: { imageConfig: { aspectRatio: "4:3" } }
      });
      const base64Data = response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data;
      if (base64Data) setImagePreview(`data:image/png;base64,${base64Data}`);
    } catch (error: any) {
      alert("AI Generation failed: " + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, fileInputRef.current?.files?.[0] as File);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      } else if (imagePreview?.startsWith('data:image')) {
        const storageRef = ref(storage, `products/ai_${Date.now()}.png`);
        await uploadString(storageRef, imagePreview.split(',')[1], 'base64', { contentType: 'image/png' });
        finalImageUrl = await getDownloadURL(storageRef);
      }
      const priceVal = Number(formData.price) || 0;
      const finalData = {
        ...formData,
        image: finalImageUrl,
        price: priceVal,
        emi: Math.round(priceVal / 30),
        savings: Math.round(priceVal * 0.025),
        features: featureInput.split(',').map(f => f.trim()).filter(f => f),
        updatedAt: Date.now()
      };
      if (editingId) await updateDoc(doc(db, 'products', editingId), finalData);
      else await addDoc(collection(db, 'products'), finalData);
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); resetForm(); }, 1500);
    } catch (error: any) {
      alert("Save failed: " + error.message);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Tabs */}
        <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-200">Admin Console</span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-200 text-emerald-600 bg-emerald-50">● Connected</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mt-3 tracking-tight">Store Management</h1>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            {(['products', 'quotes', 'leads'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
               <div>
                 <p className="text-sm font-bold text-slate-900">{products.length} Units Online</p>
               </div>
               <button onClick={handleRestoreDefaults} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg text-xs">Restore Defaults</button>
            </div>

            <div ref={formRef} className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <button onClick={() => setIsFormOpen(!isFormOpen)} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                    {saveSuccess ? <svg className="w-6 h-6 animate-in zoom-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Update System' : 'Create New Solar Kit'}</h2>
                    <p className="text-sm text-slate-500">Configure specifications and inventory levels</p>
                  </div>
                </div>
                <svg className={`w-6 h-6 transition-transform ${isFormOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isFormOpen && (
                <form onSubmit={handleSubmit} className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 mt-4">
                  <div className="space-y-6">
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Model Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <select value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <option>1kW</option><option>3kW</option><option>5kW</option><option>10kW</option>
                      </select>
                      <input required type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} placeholder="Price ₹" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                    </div>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none" />
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl">
                       <div className="flex items-center gap-4">
                          <div className="w-24 h-24 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                          </div>
                          <div className="flex-1">
                            {visualMode === 'manual' ? <input type="file" ref={fileInputRef} onChange={e => { const f = e.target.files?.[0]; if(f){ setImageFile(f); setImagePreview(URL.createObjectURL(f)); }}} /> : 
                            <button type="button" onClick={generateAIImage} disabled={isGeneratingAI} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Generate with SolarAI</button>}
                          </div>
                       </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-50">Publish System</button>
                  </div>
                </form>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm p-4">
                  <img src={p.image} className="w-full h-32 object-cover rounded-2xl mb-4" />
                  <h3 className="font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{p.capacity} System • ₹{p.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(p.id); setFormData(p); setFeatureInput(p.features.join(', ')); setImagePreview(p.image); setIsFormOpen(true); }} className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold">Edit</button>
                    <button onClick={() => { if(confirm("Delete?")) deleteDoc(doc(db, 'products', p.id)) }} className="px-4 py-2 text-rose-500 text-[10px] font-bold uppercase">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            {quotes.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No incoming quotes</p>
              </div>
            ) : quotes.map(q => (
              <div key={q.id} className={`bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-8 transition-all ${quoteUpdating === q.id ? 'opacity-50' : ''}`}>
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      q.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      q.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                      q.status === 'paid' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {q.status}
                    </span>
                    <span className="text-xs text-slate-400">Received {new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{q.userName} - {q.productName}</h3>
                  <p className="text-sm text-slate-500">{q.address} • {q.phone}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Price: ₹{q.basePrice.toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-slate-400 uppercase block">Refine Quote Price</label>
                   <input 
                    type="number" 
                    defaultValue={q.finalPrice || q.basePrice} 
                    onBlur={(e) => handleUpdateQuote(q.id, { finalPrice: parseInt(e.target.value) || q.basePrice })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold focus:outline-none"
                   />
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <button 
                    onClick={() => handleUpdateQuote(q.id, { status: 'approved' })} 
                    disabled={q.status === 'approved' || q.status === 'paid' || quoteUpdating === q.id}
                    className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-50 disabled:opacity-50 disabled:bg-emerald-100 disabled:text-emerald-500"
                  >
                    {quoteUpdating === q.id ? 'Syncing...' : q.status === 'approved' ? 'Approved ✓' : 'Approve & Finalize'}
                  </button>
                  <button 
                    onClick={() => handleUpdateQuote(q.id, { status: 'rejected' })} 
                    disabled={q.status === 'paid' || quoteUpdating === q.id}
                    className="w-full py-3 bg-white text-rose-500 border border-rose-100 rounded-2xl font-bold text-xs hover:bg-rose-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="animate-in fade-in duration-500 space-y-6">
             {leads.length === 0 ? (
               <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No design leads yet</p>
               </div>
             ) : (
               <div className="bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <tr>
                         <th className="px-8 py-6">Date</th>
                         <th className="px-8 py-6">User/Lead</th>
                         <th className="px-8 py-6">Monthly Bill</th>
                         <th className="px-8 py-6">Est. Savings</th>
                         <th className="px-8 py-6">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {leads.map(lead => (
                         <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-8 py-6 text-xs text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                            <td className="px-8 py-6 font-bold text-slate-900">{lead.userEmail}</td>
                            <td className="px-8 py-6 font-bold text-slate-900">₹{lead.monthlyBill.toLocaleString()}</td>
                            <td className="px-8 py-6 text-emerald-600 font-bold">₹{lead.estimatedSavings.toLocaleString()}/yr</td>
                            <td className="px-8 py-6">
                               <select 
                                 value={lead.status || 'interested'}
                                 onChange={(e) => handleUpdateLead(lead.id, e.target.value as any)}
                                 className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border-2 focus:outline-none transition-colors ${
                                   lead.status === 'converted' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                   lead.status === 'contacted' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                   lead.status === 'lost' ? 'bg-slate-100 border-slate-200 text-slate-500' :
                                   'bg-blue-50 border-blue-200 text-blue-600'
                                 }`}
                               >
                                 <option value="interested">Interested</option>
                                 <option value="contacted">Contacted</option>
                                 <option value="converted">Converted</option>
                                 <option value="lost">Lost</option>
                               </select>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
