import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, Divider, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, GitHub } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Project Store
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Providing high-quality programming projects for developers.
              Access cutting-edge solutions and enhance your portfolio.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="facebook" color="primary">
                <Facebook />
              </IconButton>
              <IconButton aria-label="twitter" color="primary">
                <Twitter />
              </IconButton>
              <IconButton aria-label="instagram" color="primary">
                <Instagram />
              </IconButton>
              <IconButton aria-label="linkedin" color="primary">
                <LinkedIn />
              </IconButton>
              <IconButton aria-label="github" color="primary">
                <GitHub />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/shop" color="inherit" display="block" sx={{ mb: 1 }}>
              Shop
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block" sx={{ mb: 1 }}>
              Login
            </Link>
            <Link component={RouterLink} to="/register" color="inherit" display="block" sx={{ mb: 1 }}>
              Register
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Categories
            </Typography>
            <Link component={RouterLink} to="/shop?category=web-development" color="inherit" display="block" sx={{ mb: 1 }}>
              Web Development
            </Link>
            <Link component={RouterLink} to="/shop?category=mobile-apps" color="inherit" display="block" sx={{ mb: 1 }}>
              Mobile Apps
            </Link>
            <Link component={RouterLink} to="/shop?category=machine-learning" color="inherit" display="block" sx={{ mb: 1 }}>
              Machine Learning
            </Link>
            <Link component={RouterLink} to="/shop?category=data-science" color="inherit" display="block" sx={{ mb: 1 }}>
              Data Science
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Contact Us
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              FAQ
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} Project Store. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
