
import React, { useState, useEffect } from 'react';
import { Product, CustomizationState } from '../types';

interface ProductViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (customization: CustomizationState) => void;
}

const ProductView: React.FC<ProductViewProps> = ({ product, onBack, onAddToCart }) => {
  const [customization, setCustomization] = useState<CustomizationState>({
    text: '',
    color: '#7C9082',
    options: {}
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `Fabrino | ${product.name}`,
      text: `${product.tagline} - ${product.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Back to Artifacts
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-white hover:text-gray-900 hover:border-gray-900 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            Share
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-4">
                {product.category} Artifact
              </div>
              <h1 className="serif text-5xl text-gray-900 mb-4">{product.name}</h1>
              <p className="text-xl text-emerald-800 font-medium">${product.price}</p>
              <p className="text-gray-500 mt-4 leading-relaxed italic">{product.description}</p>
              
              {/* Dynamic Material & Care Section */}
              <div className="mt-12 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in duration-1000">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-800 mb-8 flex items-center gap-3">
                  <span className="w-8 h-px bg-emerald-100"></span>
                  Material & Care
                  <span className="w-8 h-px bg-emerald-100"></span>
                </h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">The Composition</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">
                        {product.materials || "Manifested using bio-sourced photopolymers and mineral-infused resins, curated for their archival longevity and tactile depth."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Studio Process</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">
                        {product.process || "High-Resolution Stereolithography (SLA) defines our forms at a 50-micron layer height, capturing data points invisible to the human eye."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Preservation</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">
                        {product.care || "Clean with a dry microfibre cloth. Avoid chemical solvents, moisture, and intense UV. Handle metal infusions with care to prevent oxidation."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 border-t border-gray-100 pt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Configure Parameters</h3>
              
              <div className="space-y-6">
                {product.customizableFields.map((field) => (
                   <div key={field}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">{field}</label>
                    <input 
                      type="text"
                      maxLength={40}
                      placeholder={`Enter ${field.toLowerCase()}...`}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
                    />
                  </div>
                ))}

                {!product.customizableFields.length && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Personal Data Entry</label>
                    <input 
                      type="text"
                      maxLength={30}
                      placeholder="The input that defines the form..."
                      value={customization.text}
                      onChange={(e) => setCustomization({ ...customization, text: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Material Finish</label>
                  <div className="flex gap-4">
                    {['#7C9082', '#A18F7D', '#2A2A2A', '#D4AF37'].map((c) => (
                      <button 
                        key={c}
                        onClick={() => setCustomization({ ...customization, color: c })}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${customization.color === c ? 'scale-110 border-gray-900' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        title={c === '#D4AF37' ? 'Gold Infused' : 'Matte Resin'}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Process Specifications</h4>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Method:</span>
                      <span className="text-gray-900 font-medium">SLA Stereolithography</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Resolution:</span>
                      <span className="text-gray-900 font-medium">50 Microns</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-gray-500">Production Window:</span>
                    <span className="font-medium text-gray-900 italic">5-8 Days</span>
                  </div>
                </div>

                <button 
                  onClick={() => onAddToCart(customization)}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-xl active:scale-95 transform duration-150 uppercase tracking-widest text-xs"
                >
                  Initiate Print Sequence
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="aspect-[4/5] bg-gray-100 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white">
              <img 
                src={product.image} 
                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                alt={product.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div 
                  className="px-8 py-4 rounded-lg backdrop-blur-md border border-white/30 text-center transition-all duration-700"
                  style={{ borderLeft: `4px solid ${customization.color}` }}
                >
                  <p className="serif text-xl text-white tracking-[0.2em] drop-shadow-lg uppercase font-light">
                    {customization.text || 'ARTIFACT ID: 0042'}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-8 right-8 left-8 flex justify-between items-end">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-[9px] text-white/80 font-mono">
                  RENDER_ENGINE_V2.5<br/>
                  TOPOLOGY_MAPPING: ACTIVE
                </div>
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase text-gray-900">
                  Holographic Preview
                </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50">
              <span className="serif italic text-2xl text-emerald-800 block mb-6">The Emotional Geometry</span>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                {product.story}
              </p>
              <div className="mt-8 pt-8 border-t border-gray-100 grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Computational</h4>
                  <p className="text-xs text-gray-500">Every form is generated by custom algorithms based on your data.</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Archival</h4>
                  <p className="text-xs text-gray-500">UV-stabilized resins ensure your artifact lasts for generations.</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Tactile</h4>
                  <p className="text-xs text-gray-500">Designed to be touched, held, and experienced in 3D space.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
