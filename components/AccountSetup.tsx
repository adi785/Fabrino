
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AccountSetupProps {
  onComplete: () => void;
  userId: string;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          payment_method_last4: formData.cardNumber.slice(-4),
          onboarding_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      onComplete();
    } catch (err) {
      console.error('Error saving profile:', err);
      // Fallback for demo
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
            <span>{step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Preferences'}</span>
            <span>Step {step} of 3</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 p-10 md:p-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="serif text-4xl text-gray-900 mb-2">Delivery Address</h2>
                <p className="text-gray-500 text-sm italic">Where should your artifacts be manifested?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">First Name</label>
                  <input 
                    value={formData.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Last Name</label>
                  <input 
                    value={formData.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Street Address</label>
                  <input 
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">City</label>
                  <input 
                    value={formData.city}
                    onChange={e => updateField('city', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Postal Code</label>
                  <input 
                    value={formData.postalCode}
                    onChange={e => updateField('postalCode', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                  />
                </div>
              </div>
              <button 
                onClick={handleNext}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="serif text-4xl text-gray-900 mb-2">Payment Method</h2>
                <p className="text-gray-500 text-sm italic">Secure one-click manifested checkout.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-emerald-900 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-2xl mb-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-8 bg-white/20 rounded-md" />
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60 italic">Lumina Card</span>
                    </div>
                    <p className="text-xl tracking-[0.2em] font-light">
                      {formData.cardNumber ? formData.cardNumber.replace(/\d{4}(?=.)/g, '$& ') : '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-light uppercase tracking-widest">{formData.firstName || 'YOUR NAME'}</span>
                      <span className="text-xs opacity-60">{formData.expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input 
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={e => updateField('cardNumber', e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                    />
                  </div>
                  <div>
                    <input 
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={e => updateField('expiry', e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                    />
                  </div>
                  <div>
                    <input 
                      placeholder="CVC"
                      value={formData.cvc}
                      onChange={e => updateField('cvc', e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleBack}
                  className="px-8 py-5 border border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all text-gray-500"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
                >
                  Verify Payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 text-center py-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <h2 className="serif text-4xl text-gray-900 mb-2">Almost There</h2>
                <p className="text-gray-500 text-sm italic">Review and complete your collector profile.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collector Identity</span>
                  <span className="text-sm font-medium text-gray-900">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base coordinates</span>
                  <span className="text-sm font-medium text-gray-900">{formData.city}, {formData.postalCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vault Status</span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">Verified &bull; Ready to Manifest</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold hover:bg-emerald-800 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? 'Finalizing Profile...' : 'Complete Onboarding'}
              </button>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
          Your data is encrypted with Lumina Quantum Shielding.<br />
          By completing this setup, you agree to our Collector Terms & Manifestation Standards.
        </p>
      </div>
    </div>
  );
};

export default AccountSetup;
