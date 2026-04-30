import React, { useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';

const Account = () => {
  const { currentCustomer, logoutCustomer, orders, settings, fetchCustomerOrders, resendVerificationEmail } = usePOS();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentCustomer) {
      navigate('/login');
    } else {
      fetchCustomerOrders(currentCustomer.id || currentCustomer.customer_id);
    }
  }, [currentCustomer, navigate, fetchCustomerOrders]);

  if (!currentCustomer) return null;

  const customerOrders = orders.filter(o => (o.customer_id || o.customerId) === (currentCustomer.id || currentCustomer.customer_id)).sort((a,b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
  
  const activeOrders = customerOrders.filter(o => o.status !== 'Collected');
  const pastOrders = customerOrders.filter(o => o.status === 'Collected');

  const handleSignOut = () => {
    logoutCustomer();
    navigate('/');
  };

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const renderTimeline = (order) => {
    const steps = [
      'Order Confirmed', 
      'Picked Up', 
      'In Cleaning', 
      'Final Finishing', 
      'Final Inspection', 
      'Ready for Dispatch', 
      'Out for Delivery', 
      'Completed & Delivered'
    ];
    const currentIdx = steps.indexOf(order.status);
    
    const icons = {
      'Order Confirmed': 'check_circle',
      'Picked Up': 'local_shipping',
      'In Cleaning': 'cleaning_services',
      'Final Finishing': 'iron',
      'Final Inspection': 'verified',
      'Ready for Dispatch': 'inventory_2',
      'Out for Delivery': 'delivery_dining',
      'Completed & Delivered': 'celebration'
    };

    return (
      <div className="mt-8 space-y-0 pl-2">
        {steps.map((s, i) => {
          const isCompleted = i < currentIdx;
          const isActive = i === currentIdx;
          
          return (
            <div key={s} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? 'bg-blue-600 text-white shadow-sm' :
                  isActive ? 'bg-white border-2 border-blue-600 text-blue-600 animate-pulse-soft' :
                  'bg-slate-50 border border-slate-100 text-slate-300'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">{icons[s] || 'circle'}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-10 transition-colors duration-500 ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                )}
              </div>
              <div className="pt-1">
                <p className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>
                  {s}
                </p>
                {isActive && <p className="text-[9px] text-blue-400 font-bold uppercase">Live Tracker</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handlePrint = (order) => {
    const html = `<!DOCTYPE html><html><head><title>Invoice - ${order.id}</title><meta charset="utf-8"/><style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; color: #1e293b; line-height: 1.5; }
      .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
      .business-name { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #000; margin: 0; }
      .invoice-title { font-size: 14px; color: #64748b; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
      .info-box { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9; }
      .label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
      .value { font-size: 14px; font-weight: 700; color: #334155; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th { background: #1e293b; color: white; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 700; }
      td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
      .total-row { background: #f1f5f9; font-weight: 900; font-size: 16px; }
      .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    </style></head><body>
      <div class="header">
        <h1 class="business-name">${settings.business_name}</h1>
        <div class="invoice-title">Tax Invoice / Receipt</div>
      </div>
      <div class="grid">
        <div class="info-box">
          <div class="label">Customer Details</div>
          <div class="value">${currentCustomer.name || 'User'}</div>
          <div class="value" style="font-weight:400;font-size:12px">${currentCustomer.phone || ''}</div>
        </div>
        <div class="info-box" style="text-align:right">
          <div class="label">Order Information</div>
          <div class="value">#${order.id}</div>
          <div class="value" style="font-weight:400;font-size:12px">${new Date(order.created_at || order.date).toLocaleDateString()}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Service</th><th>Fabric</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          ${order.items?.map(it => `
            <tr>
              <td><b>${it.service}</b></td>
              <td>${it.fabric}</td>
              <td style="text-align:center">${it.quantity}</td>
              <td style="text-align:right">${settings.currency}${it.weight ? (it.weight * 50).toFixed(2) : (it.price || 0).toFixed(2)}</td>
            </tr>
          `).join('') || ''}
          <tr class="total-row">
            <td colspan="3" style="text-align:right">TOTAL</td>
            <td style="text-align:right">${settings.currency}${order.total}</td>
          </tr>
        </tbody>
      </table>
      <div class="info-box" style="margin-bottom:30px">
        <div class="label">Payment Status</div>
        <div class="value" style="color:${(order.payment_status || order.paymentStatus) === 'Paid' ? '#10b981' : '#f59e0b'}">
          ${(order.payment_status || order.paymentStatus)} ${(order.payment_status || order.paymentStatus) === 'Paid' ? 'via ' + (order.payment_method || order.paymentMethod) : ''}
        </div>
      </div>
      <div class="footer">
        <p>Thank you for choosing ${settings.business_name}.</p>
      </div>
      <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};}<\/script>
    </body></html>`;

    const pw = window.open('', '_blank', 'width=800,height=700');
    pw.document.write(html);
    pw.document.close();
  };

  const isUnverified = !currentCustomer.is_verified;

  return (
    <div className="pt-32 pb-24 px-8 md:px-16 min-h-screen bg-[#fafafc]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-6 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold uppercase">
                {currentCustomer.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="font-bold text-lg">{currentCustomer.name}</h2>
                <p className="text-neutral-500 text-sm">{currentCustomer.phone}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 font-bold rounded-xl"><span className="material-symbols-outlined">receipt_long</span> Orders Overview</div>
            </nav>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <span className="material-symbols-outlined">logout</span> Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          
          {isUnverified ? (
            <div className="bg-white border-2 border-amber-200 p-12 rounded-3xl text-center shadow-xl">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-amber-600 text-4xl animate-pulse">mail</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Verification Required</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                We've sent a verification link to <span className="font-bold text-slate-800">{currentCustomer.email}</span>. 
                Please verify your email to access your account and orders.
              </p>
              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all"
                >
                  I've Verified My Email
                </button>
                <button 
                  onClick={handleResendEmail} 
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Resend Verification Link
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-8">Active Orders</h1>
              
              {activeOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center mb-12">
                  <span className="material-symbols-outlined text-4xl text-neutral-300 mb-4">checkroom</span>
                  <h3 className="text-xl font-bold mb-2">No active orders</h3>
                  <p className="text-neutral-500 mb-6">Need items cleaned? Schedule a pickup today.</p>
                  <button onClick={() => navigate('/book')} className="bg-neutral-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors">Book Pickup</button>
                </div>
              ) : (
                activeOrders.map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                      <div>
                        <span className="text-sm font-bold text-neutral-400 tracking-widest uppercase mb-1 block">Order #{order.id}</span>
                        <h3 className="text-2xl font-bold text-blue-600">{order.status}</h3>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-sm text-neutral-500 mb-1 block">Placed On</span>
                        <p className="font-bold text-lg text-slate-800">{new Date(order.created_at || order.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {renderTimeline(order)}

                    <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-neutral-500 mb-1">Items ({order.items?.length || 0})</p>
                        <p className="font-medium text-sm text-slate-700">
                          {order.items?.map(it => `${it.quantity}x ${it.service}`).join(', ') || 'Processing items...'}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handlePrint(order)}
                          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">print</span>
                          Print Bill
                        </button>
                        <div className="text-right">
                          <p className="text-sm font-bold text-neutral-500 mb-1">Total</p>
                          <p className="font-bold text-lg text-slate-900">{settings.currency}{order.total}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <h1 className="text-3xl font-bold mb-8 mt-12">Order History</h1>
              {pastOrders.length === 0 ? (
                <p className="text-neutral-500">You have no completed orders.</p>
              ) : (
                <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
                  <div className="divide-y divide-neutral-100">
                    {pastOrders.map(order => (
                      <div key={order.id} className="p-6 flex justify-between items-center hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined">check_circle</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900">{order.id}</h4>
                            <p className="text-sm text-neutral-500">{new Date(order.created_at || order.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <button 
                            onClick={() => handlePrint(order)}
                            className="text-neutral-400 hover:text-blue-600 transition-colors"
                            title="Print Invoice"
                          >
                            <span className="material-symbols-outlined">print</span>
                          </button>
                          <div className="text-right">
                            <p className="font-bold text-neutral-900">{settings.currency}{order.total}</p>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{order.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
