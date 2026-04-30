import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/hero.png" 
            alt="Premium Laundry Service" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto transform translate-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            The best care for <span className="text-blue-400 italic">your clothes.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Get premium laundry and dry cleaning services delivered right to your doorstep. We wash and iron your clothes with great care.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-bold tracking-wide hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              Schedule Pickup
            </Link>
            <Link to="/services" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 px-8 md:px-16 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">How It Works</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-neutral-900">Easy and hassle-free <br/>service.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-neutral-200"></div>
            
            {[
              { step: '01', title: 'Schedule', desc: 'Book a pickup time that works best for you.', icon: 'calendar_month' },
              { step: '02', title: 'We Collect', desc: 'Our team will come to collect your clothes.', icon: 'local_shipping' },
              { step: '03', title: 'Fresh Delivery', desc: 'Your clothes are returned perfectly washed, ironed, and ready to wear.', icon: 'check_circle' }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="w-24 h-24 bg-white rounded-full border border-neutral-200 flex items-center justify-center mb-8 shadow-xl group-hover:border-blue-500 group-hover:scale-110 transition-all duration-500">
                  <span className="material-symbols-outlined text-4xl text-neutral-800 group-hover:text-blue-600 transition-colors duration-500 animate-float">{item.icon}</span>
                </div>
                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                <p className="text-neutral-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="py-24 px-8 md:px-16 bg-[#fafafc]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up">
            <img src="/delivery.png" alt="Premium Delivery" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
          <div className="md:w-1/2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-4xl font-bold mb-6 text-neutral-900">Top quality in every wash.</h2>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              We use safe and high-quality cleaning methods to keep your clothes looking new. From daily wear to party wear, your clothes are in expert hands.
            </p>
            <ul className="space-y-4 mb-10">
              {['Safe washing liquids', 'Hand ironed for perfect finish', 'Free minor stitching repairs', 'High-quality packing'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-700 font-medium hover:translate-x-1 transition-transform">
                  <span className="material-symbols-outlined text-blue-600">check_circle</span> {feature}
                </li>
              ))}
            </ul>
            <Link to="/standards" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all group">
              Learn about our standards <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-blue-600 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-[url('/hero.png')] opacity-10 bg-cover bg-center mix-blend-luminosity animate-gradient-x"></div>
        <div className="relative z-10 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready for fresh and clean clothes?</h2>
          <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">Join thousands of happy customers who trust Quick Dry Cleaning with their clothes.</p>
          <Link to="/book" className="bg-white text-blue-900 px-10 py-5 rounded-full font-bold tracking-wide hover:bg-neutral-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 inline-block">
            Book Your First Pickup
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
