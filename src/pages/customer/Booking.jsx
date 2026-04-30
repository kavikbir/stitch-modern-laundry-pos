import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';

const Booking = () => {
  const { currentCustomer, loginCustomer, createOrder, settings } = usePOS();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState('');

  const [selectedServices, setSelectedServices] = useState({}); // { serviceId: quantity }
  const [date, setDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  
  const [phone, setPhone] = useState(currentCustomer?.phone || '');
  const [name, setName] = useState(currentCustomer?.name || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(() => {
    if (currentCustomer) {
      setPhone(currentCustomer.phone);
      setName(currentCustomer.name);
    } else {
      navigate('/login');
    }
  }, [currentCustomer, navigate]);

  if (!currentCustomer) return null;

  const handleResendEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: currentCustomer.email,
    });
    if (error) alert('Error: ' + error.message);
    else alert('Verification email resent! Please check your inbox.');
  };

  const isUnverified = !currentCustomer.is_verified;

  const servicePricing = {
    dry: { name: 'Dry Cleaning', price: 350, unit: 'item' },
    wash: { name: 'Wash & Fold', price: 120, unit: 'kg' },
    bed: { name: 'Blankets & Bedsheets', price: 500, unit: 'item' },
    iron: { name: 'Ironing Only', price: 50, unit: 'item' }
  };

  const updateQuantity = (id, delta) => {
    setSelectedServices(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedServices).reduce((acc, [id, qty]) => {
      return acc + (servicePricing[id]?.price || 0) * qty;
    }, 0);
  };

  const handleConfirm = () => {
    const items = Object.entries(selectedServices).map(([id, qty]) => ({
      service: servicePricing[id].name,
      fabric: 'Mixed',
      quantity: qty,
      weight: id === 'wash' ? qty : 0
    }));

    const total = calculateTotal();
    const customerId = currentCustomer.id || currentCustomer.customer_id;

    createOrder({
      customerId: customerId,
      customerName: currentCustomer.name,
      items,
      total,
      notes: `${date} | ${timeWindow} | ${address} | Payment: ${paymentMethod}`
    });

    navigate('/account');
  };

  return (
    <div className="pt-32 pb-24 px-8 md:px-16 min-h-screen bg-[#fafafc]">
      <div className="max-w-4xl mx-auto">
        
        {isUnverified ? (
          <div className="bg-white border-2 border-amber-200 p-12 rounded-3xl text-center shadow-xl animate-fade-in-up">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-amber-600 text-4xl animate-pulse">lock</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Booking is Locked</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Please verify your email address (<span className="font-bold">{currentCustomer.email}</span>) to start booking our services.
            </p>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all"
              >
                Refresh Page
              </button>
              <button 
                onClick={handleResendEmail} 
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                Resend Link
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-neutral-900">Schedule Pickup</h1>
            <p className="text-neutral-500 text-center mb-12">Let us handle the details. Select your preferences below.</p>

            {/* Progress Bar */}
            <div className="flex justify-center items-center mb-16 max-w-lg mx-auto relative z-10">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -translate-y-1/2 z-0"></div>
              <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
              
              <div className="flex items-center justify-between relative z-10 w-full">
                <div className="flex flex-col items-center bg-[#fafafc] px-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-neutral-200 text-neutral-400'}`}>1</div>
                </div>
                <div className="flex flex-col items-center bg-[#fafafc] px-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= 2 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-neutral-200 text-neutral-400'}`}>2</div>
                </div>
                <div className="flex flex-col items-center bg-[#fafafc] px-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= 3 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-neutral-200 text-neutral-400'}`}>3</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-neutral-100">
              {step === 1 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-8">What do you want to wash?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {Object.entries(servicePricing).map(([id, service]) => {
                      const qty = selectedServices[id] || 0;
                      return (
                        <div 
                          key={id} 
                          className={`p-6 border-2 rounded-2xl transition-all group relative ${qty > 0 ? 'border-blue-600 bg-blue-50/50' : 'border-neutral-100 hover:border-blue-400'}`}
                        >
                          <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                          <p className="text-sm text-neutral-500 mb-6">{settings.currency}{service.price}/{service.unit}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(id, -1)} className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-neutral-200 text-neutral-400 disabled:opacity-30" disabled={qty === 0}>-</button>
                            <span className="font-bold">{qty}</span>
                            <button onClick={() => updateQuantity(id, 1)} className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600">+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center bg-neutral-900 p-6 rounded-2xl text-white">
                    <h3 className="text-3xl font-black">{settings.currency}{calculateTotal()}</h3>
                    <button onClick={() => setStep(2)} disabled={calculateTotal() === 0} className="bg-blue-600 px-8 py-3 rounded-full font-bold">Continue</button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-8">When should we arrive?</h2>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 border rounded-xl mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {['Morning', 'Afternoon', 'Evening'].map(tw => (
                      <div key={tw} onClick={() => setTimeWindow(tw)} className={`p-4 border-2 rounded-xl text-center cursor-pointer ${timeWindow === tw ? 'border-blue-600 bg-blue-50' : ''}`}>{tw}</div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-neutral-500 font-bold">Back</button>
                    <button onClick={() => setStep(3)} disabled={!date || !timeWindow} className="bg-neutral-900 text-white px-8 py-3 rounded-full font-bold">Continue</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-8">Contact & Address</h2>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        placeholder="Mobile number for delivery" 
                        className="w-full p-4 border rounded-xl outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pickup Address</label>
                      <textarea 
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        placeholder="Complete address with landmark" 
                        rows="4" 
                        className="w-full p-4 border rounded-xl outline-none focus:border-blue-500"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setStep(2)} className="text-neutral-500 font-bold">Back</button>
                    <button 
                      onClick={async () => {
                        const items = Object.entries(selectedServices).map(([id, qty]) => ({
                          service: servicePricing[id].name,
                          fabric: 'Mixed',
                          quantity: qty,
                          weight: id === 'wash' ? qty : 0
                        }));
                        const total = calculateTotal();
                        try {
                          const order = await createOrder({
                            customer_name: name || currentCustomer.name,
                            customer_phone: phone,
                            items,
                            total,
                            notes: `${date} | ${timeWindow} | ${address} | Payment: ${paymentMethod}`
                          });
                          setOrderId(order.id);
                          setStep(4);
                        } catch (err) {
                          alert('Error creating order: ' + err.message);
                        }
                      }} 
                      disabled={!address || !phone} 
                      className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                    >
                      Confirm Order
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-fade-in-up text-center py-8">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Order Confirmed!</h2>
                  <p className="text-slate-500 mb-8">Your order <span className="font-bold text-slate-800">#{orderId}</span> has been received successfully.</p>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl mb-10 text-left border border-slate-100 max-w-sm mx-auto">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Summary</h4>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Total Amount</span>
                      <span className="font-bold text-slate-800">{settings.currency}{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Expected Pickup</span>
                      <span className="font-bold text-slate-800">{date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 max-w-xs mx-auto">
                    <button 
                      onClick={() => navigate('/account')} 
                      className="bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
                    >
                      Track My Order
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedServices({});
                        setStep(1);
                      }} 
                      className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      Place Another Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;
