import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

// Components
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Banners from './pages/Banners';
import Services from './pages/Services';
import FAQs from './pages/FAQs';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import PaymentConfig from './pages/PaymentConfig';
import ReceiptVerification from './pages/ReceiptVerification';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ReservationPlans from './pages/ReservationPlans';
import ReservationPlanDetail from './pages/ReservationPlanDetail';
import CreateReservationPlan from './pages/CreateReservationPlan';

// Styles
import './styles/global.css';
import './App.css';

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="reservation-plans" element={<ReservationPlans />} />
          <Route path="reservation-plans/new" element={<CreateReservationPlan />} />
          <Route path="reservation-plans/:id" element={<ReservationPlanDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="services" element={<Services />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="messages" element={<Messages />} />
          <Route path="payment-config" element={<PaymentConfig />} />
          <Route path="receipt-verification" element={<ReceiptVerification />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
