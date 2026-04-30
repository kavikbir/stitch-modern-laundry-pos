import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { useNavigate } from 'react-router-dom';

const NewOrder = () => {
  const { customers, addCustomer, createOrder, settings } = usePOS();
  const navigate = useNavigate();

  // Workflow states
  const [step, setStep] = useState(1);
  
  // Customer Data
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  // Items Data
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ service: 'Wash & Fold', fabric: 'Cotton', quantity: 1, weight: 1 });

  // Pricing Logic
  const [manualOverride, setManualOverride] = useState(false);
  const [overridePrice, setOverridePrice] = useState(0);

  const basePrices = {
    'Wash & Fold': 120,
    'Dry Clean': 350,
    'Ironing': 50
  };

  const calculateAIPrice = () => {
    return items.reduce((acc, item) => {
      const base = basePrices[item.service] || 100;
      const weightFactor = item.service === 'Wash & Fold' ? item.weight : 1;
      return acc + (base * item.quantity * weightFactor);
    }, 0);
  };

  const calculatedTotal = calculateAIPrice();
  const finalTotal = manualOverride ? overridePrice : calculatedTotal;

  // Handlers
  const handleCustomerSearch = () => {
    const found = customers.find(c => c.phone === phoneSearch);
    if (found) {
      setSelectedCustomer(found);
      setStep(2);
    } else {
      setSelectedCustomer(null);
      setNewCustomer({ ...newCustomer, phone: phoneSearch });
    }
  };

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.phone) {
      try {
        const added = await addCustomer(newCustomer);
        setSelectedCustomer(added);
        setStep(2);
      } catch (err) {
        alert('Error adding customer: ' + err.message);
      }
    }
  };

  const handleAddItem = () => {
    setItems([...items, currentItem]);
    setCurrentItem({ service: 'Wash & Fold', fabric: 'Cotton', quantity: 1, weight: 1 });
  };

  const handleSaveOrder = async () => {
    try {
      const orderData = {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        items,
        total: finalTotal
      };
      const savedOrder = await createOrder(orderData);
      navigate(`/pos/orders/${savedOrder.id}`);
    } catch (err) {
      alert('Error saving order: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
      {/* Workflow Header */}
      <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
        <div>
          <h2 className="text-xl font-bold">Create New Order</h2>
          <p className="text-slate-400 text-sm">Follow the workflow to process a customer.</p>
        </div>
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 4 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
        </div>
      </div>

      <div className="p-8">
        {/* STEP 1: Customer Lookup */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Step 1: Customer Identification</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <div className="flex relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">phone</span>
                  <input 
                    type="text" 
                    value={phoneSearch}
                    onChange={e => setPhoneSearch(e.target.value)}
                    placeholder="Enter customer phone" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleCustomerSearch}
                className="self-end bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Lookup
              </button>
            </div>

            {selectedCustomer === null && phoneSearch && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl animate-fade-in-up">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">person_add</span> 
                  Customer Not Found. Add New.
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                    <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email (Optional)</label>
                    <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" />
                  </div>
                </div>
                <button onClick={handleAddCustomer} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm w-full">Save & Continue</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Add Items */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex justify-between">
              <span>Step 2: Add Garments</span>
              <span className="text-blue-600">{selectedCustomer.name}</span>
            </h3>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Service Type</label>
                <select value={currentItem.service} onChange={e => setCurrentItem({...currentItem, service: e.target.value})} className="w-full p-2 border rounded-lg outline-none">
                  <option>Wash & Fold</option>
                  <option>Dry Clean</option>
                  <option>Ironing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fabric</label>
                <select value={currentItem.fabric} onChange={e => setCurrentItem({...currentItem, fabric: e.target.value})} className="w-full p-2 border rounded-lg outline-none">
                  <option>Cotton</option>
                  <option>Wool</option>
                  <option>Silk</option>
                  <option>Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Qty / Weight (kg)</label>
                <div className="flex gap-2">
                  <input type="number" min="1" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})} className="w-1/2 p-2 border rounded-lg outline-none" title="Quantity" />
                  <input type="number" min="0.5" step="0.5" value={currentItem.weight} onChange={e => setCurrentItem({...currentItem, weight: parseFloat(e.target.value)})} className="w-1/2 p-2 border rounded-lg outline-none" title="Weight in kg" />
                </div>
              </div>
              <button onClick={handleAddItem} className="bg-slate-900 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 transition-colors w-full flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span> Add
              </button>
            </div>

            {items.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr><th className="p-3">Service</th><th className="p-3">Fabric</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Weight</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((it, idx) => (
                      <tr key={idx}><td className="p-3">{it.service}</td><td className="p-3">{it.fabric}</td><td className="p-3 text-right">{it.quantity}</td><td className="p-3 text-right">{it.weight}kg</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-slate-500 font-bold hover:text-slate-800">Back</button>
              <button onClick={() => setStep(3)} disabled={items.length === 0} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50">Proceed to Pricing</button>
            </div>
          </div>
        )}

        {/* STEP 3: Pricing */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Step 3: Pricing Verification</h3>
            
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center">
              <span className="material-symbols-outlined text-emerald-500 text-4xl mb-2">smart_toy</span>
              <p className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-2">AI Price Suggestion</p>
              <h2 className="text-4xl font-black text-emerald-900">{settings.currency}{calculatedTotal}</h2>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input type="checkbox" checked={manualOverride} onChange={e => { setManualOverride(e.target.checked); setOverridePrice(calculatedTotal); }} className="w-5 h-5 rounded text-blue-600" />
                Manual Price Override
              </label>
              {manualOverride && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{settings.currency}</span>
                  <input type="number" value={overridePrice} onChange={e => setOverridePrice(parseFloat(e.target.value))} className="w-32 p-2 border rounded-lg outline-none font-bold" />
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="text-slate-500 font-bold hover:text-slate-800">Back</button>
              <button onClick={() => setStep(4)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Review Order</button>
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Step 4: Final Review</h3>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</p>
                <p className="font-bold text-lg text-slate-800">{selectedCustomer.name}</p>
                <p className="text-sm text-slate-500">{selectedCustomer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</p>
                <p className="font-black text-3xl text-blue-600">{settings.currency}{finalTotal}</p>
              </div>
            </div>

            <div className="border rounded-xl p-6">
              <h4 className="font-bold mb-4 text-slate-700">Order Items ({items.length})</h4>
              <ul className="space-y-3">
                {items.map((it, idx) => (
                  <li key={idx} className="flex justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                    <span><span className="font-bold">{it.quantity}x</span> {it.service} ({it.fabric})</span>
                    <span className="text-slate-500">{it.weight}kg</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(3)} className="text-slate-500 font-bold hover:text-slate-800">Back</button>
              <button onClick={handleSaveOrder} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">save</span> Save Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOrder;
