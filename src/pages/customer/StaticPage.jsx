import React from 'react';
import { useLocation } from 'react-router-dom';

export const StaticPage = () => {
  const location = useLocation();
  
  // A simple mapping to determine what title/content to show based on URL
  const getPageContent = () => {
    switch (location.pathname) {
      case '/about':
        return { title: 'About Us', content: 'We are L\'Artisan, a premium laundry service committed to changing how you think about clothing care. Our mission is to provide hassle-free, high-quality cleaning for all your garments.' };
      case '/pricing':
        return { title: 'Pricing Guide', content: 'Transparent pricing for premium services. Wash & Fold starts at ₹120/kg. Dry Cleaning starts at ₹350/item. Please use our booking portal for an exact estimate.' };
      case '/sustainability':
        return { title: 'Sustainability', content: 'We care about the planet. Our machines use 40% less water, and our safe washing liquids ensure we leave no toxic footprint.' };
      case '/standards':
        return { 
          title: 'Our Quality Standards', 
          content: 'We promise top-quality care for your clothes. We use safe, eco-friendly washing liquids that are tough on stains but gentle on fabric. Every item is hand-ironed for a perfect finish, and we do free minor stitching repairs before returning your clothes in high-quality packing bags. Your clothes are always in expert hands.' 
        };
      case '/careers':
        return { title: 'Careers', content: 'Join the L\'Artisan team! We are always looking for passionate people to join our concierge and fabric care teams.' };
      default:
        return { title: 'Information', content: 'Page content coming soon.' };
    }
  };

  const { title, content } = getPageContent();

  return (
    <div className="pt-32 pb-24 px-8 md:px-16 min-h-[70vh] bg-[#fafafc] flex flex-col items-center justify-center text-center">
      <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm max-w-2xl w-full animate-fade-in-up">
        <span className="material-symbols-outlined text-5xl text-blue-600 mb-6 block animate-float">info</span>
        <h1 className="text-4xl font-bold mb-6 text-neutral-900">{title}</h1>
        <p className="text-neutral-500 text-lg leading-relaxed">{content}</p>
      </div>
    </div>
  );
};
