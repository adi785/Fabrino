
import React from 'react';

interface HeroProps {
  onPersonalize: () => void;
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPersonalize, onExplore }) => {
  return (
    <section className="pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-emerald-700 font-medium tracking-widest text-xs uppercase mb-6 block">The Future of Gifting</span>
        <h1 className="serif text-5xl md:text-7xl lg:text-8xl text-gray-900 leading-[1.1] mb-8">
          Sculpting memories<br />
          <span className="italic text-gray-400 font-normal">layer by layer.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 mb-12 font-light italic">
          Fabino Studio fuses generative algorithms with additive manufacturing to create one-of-a-kind 3D printed artifacts. We don't just print objects; we solidify emotions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPersonalize}
            className="px-10 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium text-sm shadow-xl shadow-gray-200"
          >
            Personalize a Gift
          </button>
          <button
            onClick={onExplore}
            className="px-10 py-4 bg-white border border-gray-200 text-gray-900 rounded-full hover:border-gray-900 transition-all font-medium text-sm"
          >
            Explore Ideas
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
