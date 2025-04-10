import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Switch,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  FormControlLabel,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Payment as PaymentIcon,
  CreditCard
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminPaymentSettingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [settings, setSettings] = useState({
    paymentMethods: {
      NayaPay: {
        enabled: true,
        accountDetails: { name: '', number: '' }
      },
      JazzCash: {
        enabled: true,
        accountDetails: { name: '', number: '' }
      },
      Easypaisa: {
        enabled: true,
        accountDetails: { name: '', number: '' }
      },
      JazzCashToNayaPay: {
        enabled: true,
        accountDetails: { name: '', number: '' }
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user is admin and fetch settings on component mount
  useEffect(() => {
    if (isAuthenticated) {
      if (user.role !== 'admin') {
        navigate('/'); // Redirect non-admin users
        return;
      }
      
      fetchSettings();
    } else {
      navigate('/login'); // Redirect if not authenticated
    }
  }, [isAuthenticated, user, navigate]);
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/settings/payment-methods');
      if (response.data.success) {
        setSettings({
          paymentMethods: response.data.paymentMethods
        });
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleMethod = (method) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      paymentMethods: {
        ...prevSettings.paymentMethods,
        [method]: {
          ...prevSettings.paymentMethods[method],
          enabled: !prevSettings.paymentMethods[method].enabled
        }
      }
    }));
  };
  
  const handleAccountDetailChange = (method, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      paymentMethods: {
        ...prevSettings.paymentMethods,
        [method]: {
          ...prevSettings.paymentMethods[method],
          accountDetails: {
            ...prevSettings.paymentMethods[method].accountDetails,
            [field]: value
          }
        }
      }
    }));
  };
  
  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.put('/api/settings/payment-methods', {
        paymentMethods: settings.paymentMethods
      });
      
      if (response.data.success) {
        setSuccess('Payment settings saved successfully');
      }
    } catch (err) {
      console.error('Error saving payment settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/admin">
            Dashboard
          </Link>
          <Typography color="textPrimary">Payment Settings</Typography>
        </Breadcrumbs>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h1">
            Payment Method Settings
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configure which payment methods are available to customers and update account details.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {Object.entries(settings.paymentMethods).map(([method, config]) => (
            <Grid item xs={12} md={6} key={method}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">{method}</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={() => handleToggleMethod(method)}
                          color="primary"
                        />
                      }
                      label={config.enabled ? 'Enabled' : 'Disabled'}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Account Details
                  </Typography>
                  
                  <TextField
                    label="Account Name"
                    fullWidth
                    margin="normal"
                    value={config.accountDetails.name}
                    onChange={(e) => handleAccountDetailChange(method, 'name', e.target.value)}
                    disabled={!config.enabled}
                  />
                  
                  <TextField
                    label="Account Number"
                    fullWidth
                    margin="normal"
                    value={config.accountDetails.number}
                    onChange={(e) => handleAccountDetailChange(method, 'number', e.target.value)}
                    disabled={!config.enabled}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminPaymentSettingsPage;
