import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { Home, Search } from '@mui/icons-material';

const NotFoundPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 5,
          mt: 5,
          mb: 5,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          color="primary" 
          sx={{ 
            fontSize: { xs: '100px', md: '150px' },
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '500px', mx: 'auto', mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<Home />}
          >
            Return Home
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={RouterLink}
            to="/shop"
            startIcon={<Search />}
          >
            Browse Projects
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
