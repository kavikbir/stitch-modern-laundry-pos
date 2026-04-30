import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Customer (Storefront) Imports
import CustomerLayout from './components/CustomerLayout';
import Home from './pages/customer/Home';
import Services from './pages/customer/Services';
import Booking from './pages/customer/Booking';
import Account from './pages/customer/Account';
import Login from './pages/customer/Login';
import { StaticPage } from './pages/customer/StaticPage';

// POS Imports
import { POSProvider } from './context/POSContext';
import POSLayout from './layouts/POSLayout';
import POSLogin from './pages/pos/POSLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/pos/Dashboard';
import NewOrder from './pages/pos/NewOrder';
import OrdersList from './pages/pos/OrdersList';
import OrderDetails from './pages/pos/OrderDetails';
import Customers from './pages/pos/Customers';
import CustomerProfile from './pages/pos/CustomerProfile';
import Reports from './pages/pos/Reports';
import Settings from './pages/pos/Settings';

function App() {
  return (
    <POSProvider>
      <Router>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
          <Route path="/services" element={<CustomerLayout><Services /></CustomerLayout>} />
          <Route path="/book" element={<ProtectedRoute customerOnly><CustomerLayout><Booking /></CustomerLayout></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute customerOnly><CustomerLayout><Account /></CustomerLayout></ProtectedRoute>} />
          <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
          
          <Route path="/about" element={<CustomerLayout><StaticPage /></CustomerLayout>} />
          <Route path="/pricing" element={<CustomerLayout><StaticPage /></CustomerLayout>} />
          <Route path="/sustainability" element={<CustomerLayout><StaticPage /></CustomerLayout>} />
          <Route path="/standards" element={<CustomerLayout><StaticPage /></CustomerLayout>} />
          <Route path="/careers" element={<CustomerLayout><StaticPage /></CustomerLayout>} />

          {/* Quick Dry Cleaning POS Routes */}
          <Route path="/pos/login" element={<POSLogin />} />
          
          {/* Protected POS Routes - Requires 'staff' minimum */}
          <Route path="/pos" element={<ProtectedRoute role="staff"><POSLayout><Dashboard /></POSLayout></ProtectedRoute>} />
          <Route path="/pos/new-order" element={<ProtectedRoute role="staff"><POSLayout><NewOrder /></POSLayout></ProtectedRoute>} />
          <Route path="/pos/orders" element={<ProtectedRoute role="staff"><POSLayout><OrdersList /></POSLayout></ProtectedRoute>} />
          <Route path="/pos/orders/:id" element={<ProtectedRoute role="staff"><POSLayout><OrderDetails /></POSLayout></ProtectedRoute>} />
          
          {/* Manager level routes */}
          <Route path="/pos/customers" element={<ProtectedRoute role="manager"><POSLayout><Customers /></POSLayout></ProtectedRoute>} />
          <Route path="/pos/customers/:id" element={<ProtectedRoute role="manager"><POSLayout><CustomerProfile /></POSLayout></ProtectedRoute>} />
          <Route path="/pos/reports" element={<ProtectedRoute role="manager"><POSLayout><Reports /></POSLayout></ProtectedRoute>} />
          
          {/* Admin level routes */}
          <Route path="/pos/settings" element={<ProtectedRoute role="admin"><POSLayout><Settings /></POSLayout></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </POSProvider>
  );
}

export default App;
