
import React from 'react';
import { Link } from 'react-router-dom';
import SavingsCalculator from '../components/SavingsCalculator';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-emerald-50 rounded-bl-[120px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                #1 Rooftop Solar Store in India
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1]">
                Own the Sun. <br />
                <span className="text-emerald-600">Zero Electric Bills.</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                SolarInfra makes rooftop solar simple, affordable, and smart. Switch today and save up to 90% on electricity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/products" className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition transform hover:-translate-y-1">
                  Get Free Solar Quote
                </Link>
                <Link to="/products" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition">
                  View Solar Plans
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div>
                  <p className="text-2xl font-bold text-slate-900">5k+</p>
                  <p className="text-sm text-slate-500">Happy Homes</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">20yr</p>
                  <p className="text-sm text-slate-500">Panel Warranty</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">Easy</p>
                  <p className="text-sm text-slate-500">EMI Plans</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
               <SavingsCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">25-Year Warranty</h4>
                <p className="text-slate-600">Peace of mind for decades with industry-leading performance guarantees.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Flexible EMI</h4>
                <p className="text-slate-600">Start saving today with 0% downpayment options and low monthly payments.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Certified Installers</h4>
                <p className="text-slate-600">Network of 200+ MNRE certified installers ensuring safety and efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
