import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const { customers, fetchCustomersPage, settings } = usePOS();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    fetchCustomersPage(1);
  }, [fetchCustomersPage]);

  const filteredCustomers = (customers || []).filter(c => 
    (c?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c?.phone || '').includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by Customer Name or Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button onClick={() => navigate('/pos/new-order')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">person_add</span> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">No customers found.</div>
        ) : (
          filteredCustomers.map(customer => (
            <div 
              key={customer.id} 
              onClick={() => navigate(`/pos/customers/${customer.id}`)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xl text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {customer.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{customer.name || 'Unknown'}</h3>
                    <p className="text-sm text-slate-500">{customer.phone || 'No phone'}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                  <p className="font-black text-slate-800">{settings.currency}{customer.total_spent || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                  <p className="font-bold text-slate-700 text-right">{customer.orders?.length || 0}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Customers;
