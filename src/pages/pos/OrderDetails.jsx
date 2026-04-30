import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, customers, fetchOrdersPage, fetchCustomersPage, fetchOrderLogs, fetchOrderById, updateOrderStatus, processPayment, settings } = usePOS();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const o = await fetchOrderById(id);
        if (!o) setError('Order not found');
        await fetchOrderLogs(id);
        if (customers.length === 0) await fetchCustomersPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, fetchOrderById, fetchOrderLogs, fetchCustomersPage, customers.length]);

  const order = orders.find(o => o.id === id);
  const customer = customers.find(c => c.id === (order?.customer_id || order?.customerId));

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setProcessing(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      await fetchOrderLogs(order.id);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await processPayment(order.id, paymentMethod);
      await fetchOrderById(order.id);
    } catch (err) {
      alert('Error processing payment: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md border border-slate-100">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">search_off</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
          <p className="text-slate-500 mb-6">{error || 'The order you are looking for does not exist or was deleted.'}</p>
          <button onClick={() => navigate('/pos/orders')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all">Back to Orders</button>
        </div>
      </div>
    );
  }

  const statuses = [
    'Order Confirmed', 
    'Picked Up', 
    'In Cleaning', 
    'Final Finishing', 
    'Final Inspection', 
    'Ready for Dispatch', 
    'Out for Delivery', 
    'Completed & Delivered'
  ];
  const currentStatusIndex = statuses.indexOf(order.status);

  const handlePrint = () => {
    const itemsRows = order.items.map((it, idx) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#888">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:700;font-size:13px">${it.service}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555">${it.fabric}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${it.weight}kg</td>
      </tr>
    `).join('');

    const notesSection = order.notes ? `
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #ccc">
        <thead><tr style="background:#f3f4f6"><th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc">Notes / Pickup Info</th></tr></thead>
        <tbody><tr><td style="padding:10px 12px;font-size:13px;color:#555">${order.notes}</td></tr></tbody>
      </table>` : '';

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
          <div class="value">${customer?.name || 'Walk-in'}</div>
          <div class="value" style="font-weight:400;font-size:12px">${customer?.phone || order.customer_phone || ''}</div>
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
          ${order.items.map(it => `
            <tr>
              <td><b>${it.service}</b></td>
              <td>${it.fabric}</td>
              <td style="text-align:center">${it.quantity}</td>
              <td style="text-align:right">${settings.currency}${it.weight ? (it.weight * 50).toFixed(2) : '0.00'}</td>
            </tr>
          `).join('')}
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
        <p>Terms: Please present this receipt for collection. We are not responsible for clothes not collected within 30 days.</p>
      </div>
      <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};}<\/script>
    </body></html>`;

    const pw = window.open('', '_blank', 'width=800,height=700');
    pw.document.write(html);
    pw.document.close();
  };

  return (
    <>
    {/* Printable Receipt Template */}
    <div className="printable-receipt hidden print:block bg-white text-black font-sans" style={{padding:'40px', fontFamily:'Arial, sans-serif'}}>
      
      {/* Header */}
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'24px'}}>
        <tbody>
          <tr>
            <td style={{textAlign:'center', paddingBottom:'16px', borderBottom:'2px solid #000'}}>
              <h1 style={{fontSize:'28px', fontWeight:'900', letterSpacing:'4px', margin:'0', textTransform:'uppercase'}}>Quick Dry Cleaning</h1>
              <p style={{fontSize:'12px', color:'#555', margin:'4px 0 0'}}>Premium Laundry & Dry Cleaning</p>
              <p style={{fontSize:'12px', color:'#555', margin:'2px 0 0'}}>+1 (800) 123-4567 | hello@quickdrycleaning.com</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Order + Customer Info Table */}
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'24px', border:'1px solid #ccc'}}>
        <thead>
          <tr style={{backgroundColor:'#f3f4f6'}}>
            <th colSpan={4} style={{padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc'}}>Order Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'12px', color:'#666', width:'20%', borderBottom:'1px solid #eee'}}>Order No.</td>
            <td style={{padding:'10px 12px', fontWeight:'900', fontSize:'14px', borderBottom:'1px solid #eee', width:'30%'}}>{order.id}</td>
            <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'12px', color:'#666', width:'20%', borderBottom:'1px solid #eee'}}>Customer</td>
            <td style={{padding:'10px 12px', fontWeight:'900', fontSize:'14px', borderBottom:'1px solid #eee', width:'30%'}}>{customer?.name}</td>
          </tr>
          <tr>
            <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'12px', color:'#666', borderBottom:'1px solid #eee'}}>Date</td>
            <td style={{padding:'10px 12px', fontSize:'13px', borderBottom:'1px solid #eee'}}>{new Date(order.created_at || order.date).toLocaleString()}</td>
            <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'12px', color:'#666', borderBottom:'1px solid #eee'}}>Phone</td>
            <td style={{padding:'10px 12px', fontSize:'13px', borderBottom:'1px solid #eee'}}>{customer?.phone}</td>
          </tr>
          <tr>
            <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'12px', color:'#666'}}>Status</td>
            <td style={{padding:'10px 12px', fontSize:'13px', fontWeight:'700'}}>{order.status}</td>
            <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'12px', color:'#666'}}>Payment</td>
            <td style={{padding:'10px 12px', fontSize:'13px', fontWeight:'700', color: order.payment_status === 'Paid' ? 'green' : '#d97706'}}>{order.payment_status}{order.payment_status === 'Paid' ? ` (${order.payment_method})` : ''}</td>
          </tr>
        </tbody>
      </table>

      {/* Garment Items Table */}
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'24px', border:'1px solid #ccc'}}>
        <thead>
          <tr style={{backgroundColor:'#f3f4f6'}}>
            <th style={{padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc', width:'5%'}}>#</th>
            <th style={{padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc', width:'45%'}}>Service / Item</th>
            <th style={{padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc', width:'20%'}}>Fabric</th>
            <th style={{padding:'10px 12px', textAlign:'center', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc', width:'15%'}}>Qty</th>
            <th style={{padding:'10px 12px', textAlign:'center', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc', width:'15%'}}>Weight</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, idx) => (
            <tr key={idx} style={{borderBottom:'1px solid #eee'}}>
              <td style={{padding:'10px 12px', fontSize:'13px', color:'#888'}}>{idx + 1}</td>
              <td style={{padding:'10px 12px', fontWeight:'700', fontSize:'13px'}}>{it.service}</td>
              <td style={{padding:'10px 12px', fontSize:'13px', color:'#555'}}>{it.fabric}</td>
              <td style={{padding:'10px 12px', textAlign:'center', fontSize:'13px'}}>{it.quantity}</td>
              <td style={{padding:'10px 12px', textAlign:'center', fontSize:'13px'}}>{it.weight}kg</td>
            </tr>
          ))}
          {/* Total Row */}
          <tr style={{backgroundColor:'#f9fafb', borderTop:'2px solid #000'}}>
            <td colSpan={4} style={{padding:'12px', textAlign:'right', fontWeight:'700', fontSize:'14px', textTransform:'uppercase', letterSpacing:'1px'}}>TOTAL AMOUNT</td>
            <td style={{padding:'12px', textAlign:'center', fontWeight:'900', fontSize:'18px'}}>{settings.currency}{order.total}</td>
          </tr>
        </tbody>
      </table>

      {/* Notes if any */}
      {order.notes && (
        <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'24px', border:'1px solid #ccc'}}>
          <thead>
            <tr style={{backgroundColor:'#f3f4f6'}}>
              <th style={{padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid #ccc'}}>Notes / Pickup Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding:'10px 12px', fontSize:'13px', color:'#555'}}>{order.notes}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Footer */}
      <table style={{width:'100%', borderCollapse:'collapse', marginTop:'32px'}}>
        <tbody>
          <tr>
            <td style={{textAlign:'center', paddingTop:'16px', borderTop:'1px solid #ccc', fontSize:'11px', color:'#999'}}>
              <p style={{margin:'0 0 4px'}}>Thank you for trusting L'Artisan with your clothes.</p>
              <p style={{margin:'0'}}>Please show this receipt when collecting your order.</p>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    {/* Screen View */}
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up print:hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 print:hidden">
          <span className="material-symbols-outlined">arrow_back</span> Back to Orders
        </button>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">print</span> Print Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">{order.id}</h2>
                <p className="text-slate-500 font-medium">{new Date(order.created_at || order.date).toLocaleString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  order.status === 'Received' ? 'bg-slate-100 text-slate-600' :
                  order.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'Quality Check' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
              }`}>
                {order.status}
              </span>
            </div>

            <h3 className="font-bold text-slate-700 border-b pb-2 mb-4">Garment Items</h3>
            <div className="border rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr><th className="p-4">Service</th><th className="p-4">Fabric</th><th className="p-4 text-center">Qty</th><th className="p-4 text-center">Weight</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <tr key={idx}><td className="p-4 font-bold text-slate-800">{it.service}</td><td className="p-4 text-slate-600">{it.fabric}</td><td className="p-4 text-center">{it.quantity}</td><td className="p-4 text-center">{it.weight}kg</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end text-right">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-4xl font-black text-slate-800">{settings.currency}{order.total}</p>
              </div>
            </div>
          </div>

          {/* Premium Vertical Workflow Tracker */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center border-b pb-4 mb-8">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Service Journey</h3>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Real-time Tracking</span>
            </div>

            <div className="space-y-0">
              {statuses.map((s, i) => {
                const isCompleted = i < currentStatusIndex;
                const isActive = i === currentStatusIndex;
                const log = (order.timeline || []).find(l => l.status === s);
                
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
                  <div key={s} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm z-10 ${
                        isCompleted ? 'bg-blue-600 text-white' :
                        isActive ? 'bg-white border-2 border-blue-600 text-blue-600 animate-pulse-soft' :
                        'bg-slate-50 border-2 border-slate-100 text-slate-300'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">{icons[s] || 'circle'}</span>
                      </div>
                      {i < statuses.length - 1 && (
                        <div className={`w-0.5 h-12 transition-colors duration-500 ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                      )}
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-black text-sm uppercase tracking-tight transition-colors ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {s}
                          </p>
                          {isActive && <p className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">Current Stage</p>}
                        </div>
                        {log && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                            {new Date(log.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status !== 'Completed & Delivered' && (
              <div className="mt-10 pt-6 border-t border-slate-50">
                <button 
                  onClick={() => handleStatusUpdate(statuses[currentStatusIndex + 1])}
                  disabled={processing}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      Advance to {statuses[currentStatusIndex + 1]}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer & Payment & Timeline */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 border-b pb-2 mb-4">Customer Info</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl">
                {customer?.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{customer?.name}</p>
                <p className="text-sm text-slate-500">{customer?.phone}</p>
              </div>
            </div>
            <button onClick={() => navigate(`/pos/customers/${customer?.id}`)} className="w-full text-center text-blue-600 font-bold text-sm hover:underline">View Profile</button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 border-b pb-2 mb-4">Payment</h3>
            {(order.payment_status || order.paymentStatus) === 'Paid' ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2">check_circle</span>
                <p className="font-bold text-emerald-800">Paid in Full</p>
                <p className="text-xs text-emerald-600 font-medium">via {order.payment_method || order.paymentMethod}</p>
              </div>
            ) : (
              <div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 flex justify-between items-center">
                  <span className="font-bold text-amber-800">Pending</span>
                  <span className="font-black text-xl text-amber-900">{settings.currency}{order.total}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['Cash', 'Card', 'UPI'].map(method => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg font-bold text-sm transition-colors border ${
                        paymentMethod === method ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Process Payment
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 border-b pb-2 mb-4">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {(order.timeline || []).slice().reverse().map((t, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800 text-sm mb-1">{t.status}</p>
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>{new Date(t.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span>By {t.by}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!order.timeline || order.timeline.length === 0) && (
                <div className="text-center text-xs text-slate-400 py-4 italic">No timeline events recorded yet.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default OrderDetails;
