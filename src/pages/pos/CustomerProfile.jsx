import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { useParams, useNavigate, Link } from 'react-router-dom';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, orders, fetchCustomersPage, fetchOrdersPage, updateCustomer, settings } = usePOS();
  
  const customer = customers.find(c => c.id === id);
  const customerOrders = (orders || []).filter(o => (o.customer_id || o.customerId) === id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  React.useEffect(() => {
    if (!customer) fetchCustomersPage(1);
    if (orders.length === 0) fetchOrdersPage(1);
  }, [customer, orders.length, fetchCustomersPage, fetchOrdersPage]);

  React.useEffect(() => {
    if (customer) {
      setFormData({ name: customer.name, phone: customer.phone, email: customer.email || '' });
    }
  }, [customer]);

  if (!customer) return <div className="p-8 text-center text-slate-500">Customer not found.</div>;

  const handleSave = () => {
    updateCustomer(id, formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2">
        <span className="material-symbols-outlined">arrow_back</span> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center relative">
            <button onClick={() => setIsEditing(!isEditing)} className="absolute top-4 right-4 text-slate-400 hover:text-blue-600">
              <span className="material-symbols-outlined">{isEditing ? 'close' : 'edit'}</span>
            </button>
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center font-black text-4xl text-slate-600 mb-4">
              {customer.name?.charAt(0) || '?'}
            </div>
            
            {isEditing ? (
              <div className="space-y-4 text-left mt-6">
                <div>
                  <label className="text-xs font-bold text-slate-500">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded outline-none" />
                </div>
                <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save Changes</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-slate-800">{customer.name || 'Unknown'}</h2>
                <p className="text-slate-500 mb-6">{customer.id}</p>
                <div className="flex justify-center gap-4 border-t border-slate-100 pt-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Orders</p>
                    <p className="text-xl font-bold text-slate-800">{customerOrders.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Spent</p>
                    <p className="text-xl font-bold text-slate-800">{settings.currency}{customer.total_spent || 0}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">New Order</h3>
              <p className="text-slate-400 text-sm mb-6">Create a new transaction for {customer.name}.</p>
              <Link to="/pos/new-order" className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-500 transition-colors w-full text-center">
                Start Process
              </Link>
            </div>
            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-8xl text-white/5 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">receipt_long</span>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Order History</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {customerOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No previous orders.</div>
              ) : (
                customerOrders.map(order => (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                        order.status === 'Collected' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <span className="material-symbols-outlined">{order.status === 'Collected' ? 'check' : 'pending'}</span>
                      </div>
                      <div>
                        <Link to={`/pos/orders/${order.id}`} className="font-bold text-lg text-slate-800 hover:text-blue-600 transition-colors block">{order.id}</Link>
                        <span className="text-sm text-slate-500">{new Date(order.created_at || order.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-slate-800">{settings.currency}{order.total}</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;
