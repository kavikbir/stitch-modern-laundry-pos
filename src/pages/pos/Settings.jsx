import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

const Settings = () => {
  const { settings, setSettings, userRole, addNotification, seedTestData } = usePOS();
  
  const [formData, setFormData] = useState(settings);
  const [seeding, setSeeding] = useState(false);

  // Relaxed for developer testing
  // if (userRole !== 'owner') { ... }

  const handleSave = () => {
    setSettings(formData);
    addNotification('Settings Saved', 'System configurations updated successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">System Settings</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
              <input 
                type="text" 
                value={formData.business_name} 
                onChange={e => setFormData({...formData, business_name: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Currency Symbol</label>
              <input 
                type="text" 
                value={formData.currency} 
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-slate-700">Order Ready Notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-slate-700">Payment Completed Notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-slate-700">New Customer Added</span>
              </label>
            </div>
          </div>

          <div className="pt-6 mt-6 flex justify-end border-t border-slate-100">
            <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">Developer Tools</h2>
        <p className="text-slate-500 text-sm mb-6">Use these tools to populate your system with test data. Warning: This will add many entries to your database.</p>
        
        <button 
          onClick={async () => {
            setSeeding(true);
            await seedTestData();
            setSeeding(false);
          }} 
          disabled={seeding}
          className="bg-amber-100 text-amber-800 px-8 py-3 rounded-xl font-bold hover:bg-amber-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {seeding ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
              Generating Data...
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">database</span>
              Seed 30 Test Customers & Orders
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
