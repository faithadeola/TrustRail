import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrustRules from './pages/TrustRules';
import PaymentLink from './pages/PaymentLink';
import Transactions from './pages/Transactions';
import Customers from './pages/Customers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CustomerPayment from './pages/CustomerPayment';
import PaymentTypeSelection from './pages/PaymentTypeSelection';
import PaymentResult from './pages/PaymentResult';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
           <Route path="/pay/:businessSlug" element={<PaymentTypeSelection />} /> 
          <Route path="/pay/:businessSlug/apply" element={<CustomerPayment />} /> 
          <Route path="/pay/:businessSlug/result/:applicationId" element={<PaymentResult />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/rules"
            element={
              <ProtectedRoute>
                <TrustRules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/payment-link"
            element={
              <ProtectedRoute>
                <PaymentLink />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
