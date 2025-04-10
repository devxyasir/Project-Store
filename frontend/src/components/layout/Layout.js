import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Toolbar } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import CartIndicator from '../cart/CartIndicator';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Toolbar /> {/* Spacing to account for fixed header */}
        <Container maxWidth="lg" className="page-transition">
          <Outlet />
        </Container>
      </Box>
      <Footer />
      <CartIndicator />
    </Box>
  );
};

export default Layout;
