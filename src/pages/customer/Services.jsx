import React from 'react';

const Services = () => {
  return (
    <div className="pt-32 pb-24 px-8 md:px-16 min-h-screen bg-[#fafafc]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-6 text-neutral-900">Our Services</h1>
          <p className="text-xl text-neutral-500 font-light">Complete clothing care that fits your daily life. We mix modern machines with careful hand washing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Dry Cleaning', price: 'from ₹350/item', desc: 'High-quality dry cleaning and hand-ironing for your expensive and special clothes.', icon: 'checkroom', image: '/dry.png' },
            { title: 'Wash & Fold', price: '₹120/kg', desc: 'Daily laundry washed with top-quality detergents, folded, and ready for your closet.', icon: 'local_laundry_service', image: '/wash.png' },
            { title: 'Tailoring & Repairs', price: 'Custom Pricing', desc: 'Expert stitching, fitting, and minor repairs to keep your clothes looking great.', icon: 'content_cut', image: '/hero.png' },
            { title: 'Leather & Suede', price: 'from ₹1200/item', desc: 'Special cleaning to make your leather jackets and bags look new again.', icon: 'work', image: '/shoes.png' },
            { title: 'Blankets & Bedsheets', price: 'from ₹500/item', desc: 'Deep washing and cleaning for your blankets, quilts, and bedsheets.', icon: 'bed', image: '/wash.png' },
            { title: 'Shoe Cleaning', price: 'from ₹800/pair', desc: 'Proper washing, polishing, and repair for your formal shoes and expensive sneakers.', icon: 'steps', image: '/shoes.png' }
          ].map((service, i) => (
            <div key={i} className="bg-white rounded-3xl border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up group overflow-hidden" style={{animationDelay: `${i * 0.1}s`}}>
              {/* Image Section */}
              <div className="h-48 w-full relative overflow-hidden bg-neutral-100">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                  </div>
                  <span className="bg-white/90 backdrop-blur text-neutral-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">{service.price}</span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-neutral-900">{service.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
