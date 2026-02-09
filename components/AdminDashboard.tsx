
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Product, IntentType } from '../types';
import { INTENTS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface AdminDashboardProps {
  products: Product[];
  onRefresh: () => void;
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onRefresh, onBack }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState: Partial<Product> = {
    name: '',
    tagline: '',
    description: '',
    price: 0,
    image: '',
    category: 'Birthday' as IntentType,
    story: '',
    customizableFields: [],
    materials: '',
    process: '',
    care: ''
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File | Blob): Promise<string | null> => {
    try {
      let extension = 'jpg';
      if (file instanceof File) {
        const parts = file.name.split('.');
        if (parts.length > 1) {
          extension = parts.pop()?.toLowerCase() || 'jpg';
        }
      } else {
        extension = file.type.split('/')[1] || 'jpg';
      }

      const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${extension}`;
      const filePath = `product-images/${fileName}`;

      setUploadProgress(10);

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) {
        console.error('Supabase Storage Error Details:', uploadError);
        let errorMessage = uploadError.message;

        if (errorMessage.toLowerCase().includes('bucket not found')) {
          errorMessage = 'The storage bucket "products" was not found.';
        } else if (errorMessage.toLowerCase().includes('policy')) {
          errorMessage = 'Upload blocked by security policies.';
          setShowConfigGuide(true); // Show the help guide
        }

        throw new Error(errorMessage);
      }

      setUploadProgress(100);

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('uploadImage error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('Initiating manifestation sequence...');
    try {
      let finalImageUrl = formData.image;

      if (selectedFile) {
        setStatusMessage('Uploading local artifact visual...');
        const uploadedUrl = await uploadImage(selectedFile);
        if (!uploadedUrl) throw new Error("Upload failed to return a URL.");
        finalImageUrl = uploadedUrl;
      } else if (!finalImageUrl) {
        // Fallback or generation logic could go here
        finalImageUrl = 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800';
      }

      const payload = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        price: Number(formData.price),
        image: finalImageUrl,
        category: formData.category,
        story: formData.story,
        materials: formData.materials,
        process: formData.process,
        care: formData.care,
        customizable_fields: formData.customizableFields
      };

      setStatusMessage('Syncing with Fabino Core...');
      let error;
      if (editingProduct?.id) {
        ({ error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id));
      } else {
        ({ error } = await supabase
          .from('products')
          .insert([payload]));
      }

      if (error) throw error;

      closeForm();
      onRefresh();
    } catch (err: any) {
      console.error('Manifestation Error:', err);
      // Already handled policy guide state in uploadImage
    } finally {
      setLoading(false);
      setUploadProgress(null);
      setStatusMessage('');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setPreviewUrl(product.image);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadProgress(null);
    setStatusMessage('');
    setShowConfigGuide(false);
  };

  const addCustomField = () => {
    if (newFieldName.trim() && !formData.customizableFields?.includes(newFieldName.trim())) {
      setFormData({
        ...formData,
        customizableFields: [...(formData.customizableFields || []), newFieldName.trim()]
      });
      setNewFieldName('');
    }
  };

  const removeCustomField = (fieldName: string) => {
    setFormData({
      ...formData,
      customizableFields: (formData.customizableFields || []).filter(f => f !== fieldName)
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this artifact from the collection?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-4 flex items-center gap-2 hover:gap-3 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Return to Studio
            </button>
            <h1 className="serif text-5xl text-gray-900 font-bold tracking-tight">Collection Manager</h1>
            <p className="text-gray-500 italic mt-2">Curate and manifest the Fabino catalogue.</p>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData(initialFormState);
              setIsFormOpen(true);
            }}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-3 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Manifest New Artifact
          </button>
        </div>

        {/* Configuration Guide Modal Overlay (if policy error) */}
        {showConfigGuide && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xl" />
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 overflow-y-auto max-h-[85vh]">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-2 block">Security Alert</span>
                    <h2 className="serif text-3xl text-gray-900 leading-tight">Storage Policy Required</h2>
                  </div>
                  <button onClick={() => setShowConfigGuide(false)} className="text-gray-400 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                    Your Supabase storage bucket "products" exists, but it hasn't been granted permission to accept public uploads yet.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Resolution Steps:</h3>
                  <ol className="space-y-6 text-sm text-gray-600 list-decimal pl-4">
                    <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">Supabase Dashboard</a>.</li>
                    <li>Navigate to <strong>Storage</strong> → <strong>Buckets</strong>.</li>
                    <li>Ensure a bucket named <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">products</code> is created and set to <strong>Public</strong>.</li>
                    <li>Go to the <strong>SQL Editor</strong> in the left sidebar.</li>
                    <li>Paste the following SQL to grant upload permissions and click <strong>Run</strong>:</li>
                  </ol>

                  <div className="relative group">
                    <pre className="bg-gray-900 text-emerald-400 p-6 rounded-2xl text-[11px] font-mono overflow-x-auto">
                      {`CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');`}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'products');`);
                        alert('SQL copied to vault.');
                      }}
                      className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      Copy SQL
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfigGuide(false)}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  I've Applied the Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={!loading ? closeForm : undefined} />
            <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-300 scrollbar-hide">
              <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
                <div className="flex justify-between items-center">
                  <h2 className="serif text-3xl text-gray-900 font-bold">
                    {editingProduct ? 'Update Manifestation' : 'New Artifact Details'}
                  </h2>
                  <button type="button" onClick={closeForm} disabled={loading} className="text-gray-400 hover:text-gray-900 disabled:opacity-20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Visual Identity</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative group h-64 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                          {!loading && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-white text-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl"
                              >
                                Replace Image
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">Drag artifact visual here</p>
                            <p className="text-xs text-gray-400 mt-1">or click to browse local files</p>
                          </div>
                          {!loading && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          )}
                        </>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {(uploadProgress !== null || loading) && (
                        <div className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 transition-all duration-300" style={{ width: uploadProgress !== null ? `${uploadProgress}%` : '50%' }} />
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Artifact Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      disabled={loading}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Price (USD)</label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      disabled={loading}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Tagline / Subtitle</label>
                    <input
                      required
                      value={formData.tagline}
                      onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                      disabled={loading}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm italic disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as IntentType })}
                      disabled={loading}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm appearance-none disabled:opacity-50"
                    >
                      {INTENTS.map(intent => (
                        <option key={intent} value={intent}>{intent}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Customizable Parameters</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.customizableFields?.map(field => (
                        <span key={field} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100">
                          {field}
                          <button type="button" onClick={() => removeCustomField(field)} disabled={loading} className="hover:text-red-500 transition-colors disabled:opacity-20">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFieldName}
                        onChange={e => setNewFieldName(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomField())}
                        disabled={loading}
                        placeholder="Add parameter (e.g. Resin Finish)"
                        className="flex-1 p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={addCustomField}
                        disabled={loading}
                        className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Emotional Narrative</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.story}
                      onChange={e => setFormData({ ...formData, story: e.target.value })}
                      disabled={loading}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm resize-none leading-relaxed disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Materials</label>
                      <textarea
                        rows={3}
                        value={formData.materials}
                        onChange={e => setFormData({ ...formData, materials: e.target.value })}
                        disabled={loading}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs resize-none disabled:opacity-50"
                        placeholder="Resins, infusions..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Process</label>
                      <textarea
                        rows={3}
                        value={formData.process}
                        onChange={e => setFormData({ ...formData, process: e.target.value })}
                        disabled={loading}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs resize-none disabled:opacity-50"
                        placeholder="Printing method..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Care</label>
                      <textarea
                        rows={3}
                        value={formData.care}
                        onChange={e => setFormData({ ...formData, care: e.target.value })}
                        disabled={loading}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs resize-none disabled:opacity-50"
                        placeholder="Cleaning, UV info..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <div className="mb-4 text-center">
                    <p className="text-xs text-emerald-800 font-medium italic animate-pulse">{statusMessage}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-900 text-white py-5 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-2xl disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Manifesting Artifact...
                      </>
                    ) : editingProduct ? 'Synchronize Manifestation' : 'Create Artifact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Artifact Identity</th>
                <th className="px-8 py-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Sphere</th>
                <th className="px-8 py-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Value</th>
                <th className="px-8 py-8 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                        <img src={product.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400 italic mt-1">{product.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-bold px-4 py-1.5 bg-gray-100 rounded-full text-gray-500 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-medium text-gray-900 text-sm">
                    ${product.price}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-3 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <p className="text-gray-400 italic serif text-xl">The vault is currently awaiting its first manifest.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
