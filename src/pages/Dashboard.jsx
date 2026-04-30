import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <>
      {/* Sub-nav Overview Bar */}
      <header className="bg-white/80 backdrop-blur-md flex justify-between items-center w-full px-8 h-16 border-b border-neutral-100 fixed top-12 z-40">
        <div className="flex items-center space-x-4">
          <span className="material-symbols-outlined text-on-surface-variant">grid_view</span>
          <h1 className="font-headline-md text-headline-md uppercase tracking-widest text-on-surface">Operations Overview</h1>
        </div>
        <Link to="/orders/create" className="bg-primary-container text-white px-6 py-2 rounded-full font-label-caps text-label-caps hover:opacity-90 active:scale-95 transition-all">
          Create New Order
        </Link>
      </header>

      {/* Main Content Canvas */}
      <div className="pt-32 px-edge-margin pb-edge-margin max-w-[1440px] mx-auto">
        {/* Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
          {/* Total Orders */}
          <div className="bg-white p-tile-padding rounded-[18px] flex flex-col justify-between h-64 border border-neutral-50">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-stack-sm uppercase">Total Orders Today</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">24</h2>
            </div>
            <div className="flex justify-center items-center">
              <img className="signature-shadow rounded-lg object-contain h-24" alt="stacks of towels" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOqP_4BzAlWNNIUtjVR1cUzCTOWa1B-ttP9iJTkOxvG_JlqdSQMHdhWQILDxnf5rjOvguHce8u4AVhU1tXZudkItUTWB0aXN3hfYRrLcwg3SoDAZl3Y2oNITa_1bGBW5uaEK9icHV97aiXxNM71DEscm91YV5vOQ-trgl9LW0jdH3hJqQabaDATzA8MV_H9zdyUzT1lSMkA9Uhn7_IqUFB7e4i9rsF2btUthmaFvH0VQmh1jHlZJhYNXAw8n7ixg_6naFXmOtsYDpM"/>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-[#272729] p-tile-padding rounded-[18px] flex flex-col justify-between h-64 text-white">
            <div>
              <span className="font-label-caps text-label-caps text-neutral-400 block mb-stack-sm uppercase">Revenue</span>
              <h2 className="font-headline-lg text-headline-lg">₹12,450</h2>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-primary-container font-medium text-body-sm">+12% vs yesterday</span>
              <span className="material-symbols-outlined text-primary-container">trending_up</span>
            </div>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white p-tile-padding rounded-[18px] flex flex-col justify-between h-64 border border-neutral-50">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-stack-sm uppercase">Pending Deliveries</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">8</h2>
            </div>
            <div className="flex justify-center items-center">
              <img className="signature-shadow rounded-lg object-contain h-24" alt="folded shirts" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXoyxtVgJQ-XnJAG7GfU5vJ9TxDzxrPBL8FSyoN67GjKILKMW1B9_0vc1nqKXTIO0VVnAUqfslkr33k9bvOuIkwzS2zHODBW1l8qfwjw3hSL2MICJCJ_DFTrhZYpo6IfZcAwkkBasthjNSkxWX74VKnlYs6Kympke3TojuKOBNG8kqDiBDW43aU7qXc6TKt-FPHd2J7vk3988jnxWTzNyBZEy2Y8Df0fiJMzPAE7JuST4ECPXoIj1g_8EH7N8WKrbNVHWbQUTpb51g"/>
            </div>
          </div>

          {/* In-Processing */}
          <div className="bg-white p-tile-padding rounded-[18px] flex flex-col justify-between h-64 border border-neutral-50">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-stack-sm uppercase">In-Processing</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">15</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold">JD</div>
                <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-white flex items-center justify-center text-[10px] font-bold">AS</div>
                <div className="w-8 h-8 rounded-full bg-primary-container text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">+5</div>
              </div>
              <span className="text-body-sm text-on-surface-variant">Active Staff</span>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Facility Overview */}
          <div className="md:col-span-8 bg-white rounded-[18px] overflow-hidden border border-neutral-50 flex flex-col md:flex-row">
            <div className="md:w-1/2 p-tile-padding flex flex-col justify-center">
              <h3 className="font-headline-lg text-headline-lg mb-stack-md text-on-surface">Operational Efficiency</h3>
              <p className="text-on-surface-variant font-body-lg mb-stack-lg">Our high-end gallery-style processing facility is currently running at 84% capacity. Priority orders are being fast-tracked through Station 4.</p>
              <div className="flex space-x-4">
                <button className="bg-[#f5f5f7] text-[#1d1d1f] px-6 py-2 rounded-lg font-label-caps text-label-caps hover:bg-neutral-200 transition-colors">View Stations</button>
                <button className="text-primary-container font-label-caps text-label-caps py-2 flex items-center">
                  Facility Map <span className="material-symbols-outlined ml-1">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="md:w-1/2 relative min-h-[300px]">
              <img className="absolute inset-0 w-full h-full object-cover" alt="facility interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxKzJrqKCW9KSP8h3jPSc7f0Ws_enge8Ev4ZS_BItaIYcm8P9UyzIZPBciH_pPf3Pjo2UOCnipSpLBdjVloHZbweFiTJ6lb7xGT14OIJoOO_UjYjKioYtVCYdXX6KGgxgqpcxArCRMsX2II2XZvrEEy2dmFZjgih8EA-cA8uQUPix3AN2FB8e4wZVWLviJYmyfMuRxB_Iv3bPjW8dQ6UGzUf9SyK8D0z0MPQCmKbw5Ho-FquKklZeauVpx37rdt6339sWJZt4C8Kc6"/>
            </div>
          </div>

          {/* Side Quick Actions */}
          <div className="md:col-span-4 bg-neutral-50 rounded-[18px] p-6 flex flex-col border border-neutral-200">
            <div className="mb-stack-lg">
              <h4 className="font-headline-md text-headline-md text-on-surface mb-1">Queue Status</h4>
              <p className="text-on-surface-variant font-body-sm">Transaction ID: #8291</p>
            </div>
            <div className="space-y-2 mb-stack-lg">
              <div className="flex items-center p-3 bg-white text-primary-container rounded-lg font-sans text-xs font-semibold signature-shadow">
                <span className="material-symbols-outlined mr-3">shopping_cart</span>
                Current Cart
              </div>
              <div className="flex items-center p-3 text-neutral-500 font-sans text-xs font-semibold hover:bg-neutral-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined mr-3">person</span>
                Customer Details
              </div>
              <div className="flex items-center p-3 text-neutral-500 font-sans text-xs font-semibold hover:bg-neutral-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined mr-3">sell</span>
                Pricing Adjustments
              </div>
              <div className="flex items-center p-3 text-neutral-500 font-sans text-xs font-semibold hover:bg-neutral-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined mr-3">edit_note</span>
                Notes
              </div>
            </div>
            <div className="mt-auto border-t border-neutral-200 pt-6">
              <div className="flex justify-between mb-4">
                <span className="text-on-surface-variant font-body-sm">Total Value</span>
                <span className="text-on-surface font-bold">₹2,450</span>
              </div>
              <button className="w-full bg-primary-container text-white py-4 rounded-full font-label-caps text-label-caps uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity">
                Complete Order
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-stack-lg">
          <h3 className="font-headline-md text-headline-md mb-stack-lg uppercase tracking-widest text-on-surface">Live Feed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-white p-6 rounded-[18px] border border-neutral-50 flex items-center space-x-6">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </div>
              <div>
                <p className="font-headline-md text-body-lg text-on-surface">Order #9021 Delivered</p>
                <p className="text-on-surface-variant text-body-sm">Mr. Kapoor · 4 mins ago</p>
              </div>
            </div>
            <div className="bg-[#272729] p-6 rounded-[18px] flex items-center space-x-6">
              <div className="w-16 h-16 bg-neutral-800 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white">dry_cleaning</span>
              </div>
              <div>
                <p className="font-headline-md text-body-lg text-white">Station 2 In-Processing</p>
                <p className="text-neutral-400 text-body-sm">12 Silk Sarees · Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
