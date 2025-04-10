import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import useAuthPersistence from './hooks/useAuthPersistence';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import PurchasesPage from './pages/PurchasesPage';
import ReceiptsPage from './pages/ReceiptsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminAddProductPage from './pages/admin/AdminAddProductPage';
import AdminEditProductPage from './pages/admin/AdminEditProductPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPaymentSettingsPage from './pages/AdminPaymentSettingsPage';

// Protected Route Component with enhanced persistence
const ProtectedRoute = ({ children, admin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // If still loading authentication state, show nothing to prevent flashes
  if (loading) {
    // You can replace this with a loading spinner if desired
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      Loading...
    </div>;
  }
  
  // Only redirect if authentication has finished loading and user is not authenticated
  if (!loading && !isAuthenticated) {
    // Save the current URL to redirect back after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      localStorage.setItem('redirectAfterLogin', currentPath);
    }
    return <Navigate to="/login" />;
  }
  
  // Check admin permission after confirming authentication
  if (!loading && isAuthenticated && admin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Use our custom authentication persistence hook
  useAuthPersistence();
  
  // Log authentication status on load/refresh
  useEffect(() => {
    console.log('App rendered, authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  }, [isAuthenticated]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected User Routes */}
          <Route path="cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="purchases" element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          } />
          <Route path="receipts" element={
            <ProtectedRoute>
              <ReceiptsPage />
            </ProtectedRoute>
          } />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute admin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/add" element={<AdminAddProductPage />} />
          <Route path="products/edit/:id" element={<AdminEditProductPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="payment-settings" element={<AdminPaymentSettingsPage />} />
        </Route>
      </Routes>
    </MuiThemeProvider>
  );
}

export default App;
