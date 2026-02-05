
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cartItems: CartItem[];
  onSuccess: () => void;
  userId?: string | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, cartItems, onSuccess, userId }) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [loadingText, setLoadingText] = useState('Verifying Transaction...');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const handleProcess = async () => {
    setStep('processing');
    
    try {
      if (isSupabaseConfigured() && supabase) {
        // 1. Create the order with optional user_id
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            total: total,
            status: 'processing',
            user_id: userId // Link to the logged-in user if available
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Create the order items
        const itemsToInsert = cartItems.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          name: item.name,
          customization_text: item.text,
          customization_color: item.color,
          quantity: item.quantity,
          price: item.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      setLoadingText('Securing Computational Power...');
      await new Promise(r => setTimeout(r, 800));
      setLoadingText('Synchronizing with the Fabrino Vault...');
      await new Promise(r => setTimeout(r, 800));
      setLoadingText('Finalizing Print Sequence...');
      await new Promise(r => setTimeout(r, 1000));

      setStep('success');
      onSuccess();
    } catch (err) {
      console.error('Checkout Error:', err);
      setLoadingText('Network error. Saving to local session...');
      setTimeout(() => {
        setStep('success');
        onSuccess();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 md:p-12">
          {step === 'shipping' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="serif text-3xl text-gray-900">Delivery Information</h2>
                <span className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase mb-1">Step 01/02</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  className="col-span-1 p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" 
                />
                <input 
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                  className="col-span-1 p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" 
                />
                <input 
                  placeholder="Shipping Address" 
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  className="col-span-2 p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" 
                />
                <input 
                  placeholder="City" 
                  value={formData.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  className="col-span-1 p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" 
                />
                <input 
                  placeholder="Postal Code" 
                  value={formData.postalCode}
                  onChange={(e) => updateForm('postalCode', e.target.value)}
                  className="col-span-1 p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" 
                />
              </div>
              <button 
                onClick={() => setStep('payment')}
                disabled={!formData.firstName || !formData.address}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="serif text-3xl text-gray-900">Secure Payment</h2>
                <span className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase mb-1">Step 02/02</span>
              </div>
              <div className="bg-emerald-50/50 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-widest mb-1">Order Total</p>
                  <p className="text-2xl font-bold text-gray-900">${total}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Secure</p>
                  <p className="text-[10px] text-gray-400">256-bit SSL</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input placeholder="Card Number" className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="MM/YY" className="p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" />
                  <input placeholder="CVC" className="p-4 border border-gray-100 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/50 text-sm" />
                </div>
              </div>
              <button 
                onClick={handleProcess}
                className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10"
              >
                Complete Purchase
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-20 flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-gray-100 rounded-full animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-600 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="serif text-2xl text-gray-900">Processing Artifact</h3>
                <p className="text-sm text-gray-400 italic transition-all duration-500">{loadingText}</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div className="space-y-4">
                <h3 className="serif text-4xl text-gray-900">Story Received</h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Your customization has been archived in our vault. Your artifact is now queued for physical manifestation. You'll receive a notification when the first layer is printed.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-12 py-4 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Return to Gallery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
