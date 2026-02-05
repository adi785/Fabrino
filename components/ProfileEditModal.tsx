
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: (updated?: boolean) => void;
  userId: string;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, userId }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors if no row exists

      if (error) throw error;
      
      if (data) {
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postal_code || '',
          phone: data.phone || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use upsert to create the row if it doesn't exist (e.g. if the SQL trigger failed)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      onClose(true); // Signal success
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(`Failed to update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => onClose(false)} 
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-400">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="serif text-3xl text-gray-900">Collector Profile</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Manage your vault identity</p>
            </div>
            <button 
              onClick={() => onClose(false)} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {fetching ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Accessing Vault...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">First Name</label>
                  <input 
                    required
                    value={formData.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Last Name</label>
                  <input 
                    required
                    value={formData.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Street Address</label>
                  <input 
                    required
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">City</label>
                  <input 
                    required
                    value={formData.city}
                    onChange={e => updateField('city', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Postal Code</label>
                  <input 
                    required
                    value={formData.postalCode}
                    onChange={e => updateField('postalCode', e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => onClose(false)}
                  className="flex-1 px-4 py-4 border border-gray-100 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-gray-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'Synchronizing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
