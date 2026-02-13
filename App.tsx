
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductView from './components/ProductView';
import GiftMuse from './components/GiftMuse';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AccountSetup from './components/AccountSetup';
import ProfileEditModal from './components/ProfileEditModal';
import AdminDashboard from './components/AdminDashboard';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Product, IntentType, CartItem, CustomizationState } from './types';
import { INTENTS, PRODUCTS as LOCAL_PRODUCTS } from './constants';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'product' | 'setup' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeIntent, setActiveIntent] = useState<IntentType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkOnboardingStatus(currentUser.id);
      }
    }).catch(err => console.error("Session check failed:", err));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === 'SIGNED_IN' && currentUser) {
        checkOnboardingStatus(currentUser.id);
      } else if (event === 'SIGNED_OUT') {
        setView('home');
        setIsProfileEditOpen(false);
      }
    });

    if (isSupabaseConfigured()) {
      fetchProducts();
    }

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data || !data.onboarding_complete) {
        setView('setup');
      }
    } catch (err) {
      console.error('Error checking onboarding:', err);
    }
  };

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const mappedProducts = data.map((item: any) => {
          if (!item) return null;
          return {
            ...item,
            customizableFields: Array.isArray(item.customizable_fields) 
              ? item.customizable_fields 
              : (item.customizableFields || [])
          };
        }).filter(Boolean) as Product[];
        
        if (mappedProducts.length > 0) {
          setProducts(mappedProducts);
          setDbConnected(true);
        }
      }
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const scrollToSection = (id: string) => {
    if (view !== 'home') {
      setView('home');
      setSelectedProduct(null);
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (newView: 'home' | 'product' | 'setup' | 'admin', productId?: string) => {
    if (newView === 'home') {
      setView('home');
      setSelectedProduct(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (newView === 'product' && productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setView('product');
      }
    } else if (newView === 'admin') {
      setView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (customization: CustomizationState) => {
    if (!selectedProduct) return;
    
    const newItem: CartItem = {
      ...customization,
      cartId: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      quantity: 1
    };

    setCart(prev => [...prev, newItem]);
    showToast('Artifact added to your cart');
  };

  const handleBuyNow = (product: Product) => {
    const newItem: CartItem = {
      text: 'Standard Edition',
      color: '#7C9082',
      options: {},
      cartId: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };

    setCart(prev => [...prev, newItem]);
    setIsCheckoutOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const matchesIntent = activeIntent === 'All' || p.category === activeIntent;
    const matchesSearch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         (p.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (p.tagline?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesIntent && matchesSearch;
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="min-h-screen text-gray-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white border border-emerald-100 shadow-xl shadow-emerald-900/5 px-6 py-3 rounded-full flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-900">{toastMessage}</span>
          </div>
        </div>
      )}

      {view !== 'setup' && (
        <Navbar 
          onNavigate={handleNavigate} 
          onScrollTo={scrollToSection} 
          cartCount={cart.length}
          onCartToggle={() => setIsCartOpen(true)}
          user={user}
          onAuthToggle={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
          onEditProfile={() => setIsProfileEditOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            if (view !== 'home') setView('home');
          }}
        />
      )}
      
      {view === 'setup' && user && (
        <AccountSetup 
          userId={user.id} 
          onComplete={() => {
            setView('home');
            showToast('Welcome to Fabino Studio');
          }} 
        />
      )}

      {view === 'admin' && (
        <AdminDashboard 
          products={products} 
          onRefresh={fetchProducts} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'home' && (
        <main>
          <div id="hero-section">
            <Hero 
              onPersonalize={() => scrollToSection('products-section')} 
              onExplore={() => scrollToSection('muse-section')} 
            />
          </div>
          
          <section id="products-section" className="max-w-7xl mx-auto px-6 mb-32 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div className="flex items-center gap-4">
                <h2 className="serif text-3xl text-gray-900">Curated Artifacts</h2>
                {dbConnected && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Live Collection</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                <button 
                  onClick={() => setActiveIntent('All')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeIntent === 'All' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                >
                  All
                </button>
                {INTENTS.map((intent) => (
                  <button 
                    key={intent}
                    onClick={() => setActiveIntent(intent)}
                    className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeIntent === intent ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                  >
                    {intent}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
                    <div className="h-4 bg-gray-200 w-3/4 rounded" />
                    <div className="h-4 bg-gray-200 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => handleNavigate('product', product.id)}
                    onBuyNow={(e) => {
                      e.stopPropagation();
                      handleBuyNow(product);
                    }}
                  />
                ))}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 serif italic text-xl">
                  {searchTerm ? `No artifacts found matching "${searchTerm}"` : 'The collection is currently evolving. Check back soon.'}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-emerald-700 font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>

          <div id="muse-section" className="scroll-mt-24">
            <GiftMuse />
          </div>

          <section id="story-section" className="bg-[#1A1A1A] py-32 text-center overflow-hidden relative scroll-mt-24">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[120px]" />
             </div>
             <div className="relative z-10 max-w-3xl mx-auto px-6">
                <blockquote className="serif text-4xl md:text-5xl text-white leading-tight italic font-light mb-12">
                  "The things that matter most aren't things. They're the feelings we attach to them."
                </blockquote>
                <div className="h-px w-20 bg-emerald-500/50 mx-auto mb-8" />
                <p className="text-gray-400 tracking-[0.3em] uppercase text-xs font-bold">fabino Studio &bull; Est. 2024</p>
             </div>
          </section>
        </main>
      )}

      {view === 'product' && selectedProduct && (
        <ProductView 
          product={selectedProduct} 
          onBack={() => handleNavigate('home')} 
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={subtotal}
        cartItems={cart}
        userId={user?.id || null}
        onSuccess={() => {
          clearCart();
        }}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      {user && (
        <ProfileEditModal 
          isOpen={isProfileEditOpen} 
          onClose={(updated) => {
            setIsProfileEditOpen(false);
            if (updated) showToast('Vault Profile Updated');
          }}
          userId={user.id}
        />
      )}

      <footer className="bg-[#FAF9F6] border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
          <div className="col-span-2">
            <h4 className="serif text-2xl font-bold mb-6">Fabino</h4>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Design-led personalization for the meaningful milestones in your life. Crafted with care, driven by emotion.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest mb-6">Explore</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><button onClick={() => scrollToSection('products-section')} className="hover:text-emerald-700 transition-colors">Occasions</button></li>
              <li><button onClick={() => scrollToSection('muse-section')} className="hover:text-emerald-700 transition-colors">Artifact Muse</button></li>
              <li><button onClick={() => scrollToSection('products-section')} className="hover:text-emerald-700 transition-colors">Best Sellers</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest mb-6">Support</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-700 transition-colors">Tracking</a></li>
              <li><a href="#" className="hover:text-emerald-700 transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-emerald-700 transition-colors">Returns</a></li>
            </ul>
          </div>
          <div className="col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-widest mb-6">Newsletter</h5>
            <p className="text-sm text-gray-500 mb-4">Join for early access to new collections.</p>
            <div className="flex border-b border-gray-200 focus-within:border-emerald-700 transition-colors py-2">
              <input type="email" placeholder="email@address.com" className="bg-transparent flex-1 text-sm outline-none" />
              <button className="text-emerald-700 font-bold text-xs uppercase tracking-widest">Sign Up</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-6">
           <p className="text-[10px] text-gray-400 uppercase tracking-widest">&copy; 2026 JU Makerspace Objects Inc. All rights reserved.</p>
           <div className="flex gap-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Accessibility</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
