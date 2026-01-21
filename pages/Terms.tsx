
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 tracking-tight">Terms & Conditions</h1>
        <p className="text-slate-500 mb-12">Last Updated: October 2023. Governed by the laws of the Republic of India.</p>

        <div className="space-y-12 text-slate-700 leading-relaxed">
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">01</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing SolarInfra.in, you agree to comply with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020. This platform is operated from Mumbai, Maharashtra. Use of the website implies acceptance of these terms and all applicable Indian regulations.
            </p>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">02</span>
              Payment Gateway & Methods
            </h2>
            <p className="mb-4">
              We facilitate payments through authorized Payment Aggregators (PAs) and Payment Gateways (PGs) regulated by the Reserve Bank of India (RBI). Supported methods include:
            </p>
            <ul className="list-disc ml-6 space-y-2 mb-4">
              <li><strong>Unified Payments Interface (UPI):</strong> Real-time payments via VPA, QR codes, or intent flow (GPay, PhonePe, BHIM).</li>
              <li><strong>Credit/Debit Cards:</strong> Support for Visa, Mastercard, RuPay, and American Express. All card data is handled according to PCI DSS (Payment Card Industry Data Security Standard) compliance.</li>
              <li><strong>Netbanking:</strong> Secure direct bank transfers from all major Indian scheduled commercial banks.</li>
              <li><strong>EMI Facilities:</strong> Consumer durable loans and credit card EMI options are provided by third-party financial institutions subject to their approval.</li>
            </ul>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">03</span>
              Security & Data Localization
            </h2>
            <p>
              In accordance with RBI directives on "Storage of Payment System Data," we ensure that all full end-to-end transaction details are stored only in servers located within India. We do not store your CVV or Netbanking passwords. Sensitive card information is stored in an encrypted "Tokenized" format as per the latest RBI Tokenization guidelines to prevent unauthorized access.
            </p>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">04</span>
              Pricing & GST
            </h2>
            <p>
              All prices listed on SolarInfra.in are inclusive of Goods and Services Tax (GST) unless otherwise stated. Solar kits are subject to a specific GST rate of 12% (subject to the 70:30 rule for Goods and Services) as per current Indian Ministry of Finance notifications. Any transaction fees charged by banks or payment providers for EMI conversions are to be borne by the customer.
            </p>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">05</span>
              Solar Subsidies (MNRE)
            </h2>
            <p>
              Subsidies provided under the PM-Surya Ghar: Muft Bijli Yojana or other MNRE schemes are subject to verification of the installation by local DISCOM officials. SolarInfra assists in documentation but does not guarantee the disbursement of government subsidies, as this remains at the discretion of the Ministry.
            </p>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">06</span>
              Cancellation, Refunds & Chargebacks
            </h2>
            <p>
              As solar installations involve custom engineering and site-specific materials:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Cancellation:</strong> Full refund if cancelled within 48 hours of booking.</li>
              <li><strong>Site Survey:</strong> 30% cancellation fee if cancelled after site survey but before material dispatch.</li>
              <li><strong>Refund Processing:</strong> Approved refunds will be credited back to the original payment source within 5-7 working days as per standard banking cycles in India.</li>
              <li><strong>Disputes:</strong> Any payment failures where money is deducted but not reflected in our dashboard will be auto-refunded by your bank within 24-48 hours.</li>
            </ul>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">07</span>
              Governing Law & Jurisdiction
            </h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>
          </section>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-sm shadow-inner mt-12">
            <p className="font-bold text-slate-900 mb-2 font-sans not-italic uppercase tracking-widest text-[10px]">Grievance Redressal</p>
            For any legal inquiries, payment disputes, or grievances, please contact our Nodal Officer at <span className="text-emerald-600 font-bold">legal@solarinfra.in</span>. We aim to resolve all payment-related queries within 48 business hours.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
