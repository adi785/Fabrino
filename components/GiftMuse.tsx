
import React, { useState } from 'react';
import { getGiftMuseSuggestions } from '../services/geminiService';

const GiftMuse: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const result = await getGiftMuseSuggestions(prompt);
    setSuggestions(result || []);
    setLoading(false);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-24">
      <div className="bg-slate-900 rounded-[2.5rem] p-12 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        
        <div className="relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            The Artifact Muse
          </div>
          
          <h2 className="serif text-4xl">Conceptualize your artifact</h2>
          <p className="text-gray-400 max-w-lg mx-auto italic font-light">Share a memory or a feeling, and our generative AI will suggest a 3D structural concept to represent it.</p>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the moment or the person..."
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm text-white placeholder:text-gray-500"
            />
            <button 
              onClick={handleConsult}
              disabled={loading}
              className="bg-white text-slate-900 px-8 py-4 rounded-full hover:bg-gray-200 transition-colors text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Consult Muse'}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {suggestions.map((s, idx) => (
                <div key={idx} className="bg-white/5 p-6 rounded-2xl text-left border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2 block">{s.sentiment}</span>
                  <h4 className="serif text-lg text-white mb-2">{s.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GiftMuse;
