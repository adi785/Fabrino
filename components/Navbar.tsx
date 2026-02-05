
import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  onNavigate: (view: 'home' | 'product' | 'setup' | 'admin', productId?: string) => void;
  onScrollTo: (id: string) => void;
  cartCount: number;
  onCartToggle: () => void;
  user: User | null;
  onAuthToggle: () => void;
  onSignOut: () => void;
  onEditProfile: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  onScrollTo, 
  cartCount, 
  onCartToggle, 
  user, 
  onAuthToggle, 
  onSignOut,
  onEditProfile,
  searchTerm,
  onSearchChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsMobileSearchOpen(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4 md:gap-8">
        <div 
          onClick={() => {
            onNavigate('home');
            setIsMobileSearchOpen(false);
          }}
          className={`cursor-pointer flex items-center gap-2 shrink-0 ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}
        >
          <span className="serif text-2xl font-bold tracking-tight text-gray-900">Fabrino</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mb-4"></div>
        </div>
        
        {/* Search Bar Container */}
        <div className={`flex-1 max-w-md relative group ${isMobileSearchOpen ? 'flex' : 'hidden sm:flex'}`}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search artifacts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-20 py-2.5 bg-gray-100/50 border border-transparent rounded-full text-xs font-medium focus:outline-none focus:bg-white focus:border-emerald-100 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchTerm && (
              <button 
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-900 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[9px] font-sans text-gray-400 pointer-events-none">
              <span className="text-[10px]">⌘</span>K
            </kbd>
            {isMobileSearchOpen && (
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className={`hidden lg:flex items-center gap-10 shrink-0 ${isMobileSearchOpen ? 'lg:flex' : ''}`}>
          <button 
            onClick={() => onScrollTo('products-section')}
            className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors"
          >
            Artifacts
          </button>
          <button 
            onClick={() => onScrollTo('story-section')}
            className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors"
          >
            Our Story
          </button>
        </div>

        {/* Icons & Actions */}
        <div className={`flex items-center gap-4 md:gap-6 shrink-0 ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
          <button 
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="sm:hidden text-gray-600 hover:text-gray-900 transition-transform active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>

          {user ? (
            <div className="relative flex items-center gap-4" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 text-right group"
              >
                <div className="hidden sm:block">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold group-hover:text-emerald-600 transition-colors">Collector</p>
                  <p className="text-xs text-gray-900 font-medium truncate max-w-[120px]">{user.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        onEditProfile();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Edit Profile
                    </button>
                    
                    <button 
                      onClick={() => {
                        onNavigate('admin');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                      Manage Collection
                    </button>

                    <div className="h-px bg-gray-50 mx-2" />
                    
                    <button 
                      onClick={() => {
                        onSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onAuthToggle}
              className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors"
            >
              Sign In
            </button>
          )}

          <div className="w-px h-4 bg-gray-200" />

          <button 
            onClick={onCartToggle}
            className="relative text-gray-600 hover:text-gray-900 transition-transform active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
