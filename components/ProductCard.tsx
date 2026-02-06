
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBuyNow: (e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `Lumina | ${product.name}`,
      text: `${product.tagline} - ${product.description}`,
      url: window.location.origin + '?product=' + product.id,
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
    <div 
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 relative mb-4 shadow-sm hover:shadow-lg transition-all duration-500">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-900 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 hover:bg-white z-10"
          title="Share Artifact"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        </button>

        {/* Hover Actions */}
        <div className="absolute inset-x-4 bottom-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full bg-white text-gray-900 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors shadow-sm"
          >
            Personalize
          </button>
          <button 
            onClick={onBuyNow}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors shadow-lg"
          >
            Buy Now
          </button>
        </div>
      </div>
      
      <div className="space-y-1 px-1">
        <h3 className="serif text-xl text-gray-900 font-medium">{product.name}</h3>
        <p className="text-gray-500 text-sm italic">{product.tagline}</p>
        <p className="text-gray-900 font-semibold pt-1">${product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
