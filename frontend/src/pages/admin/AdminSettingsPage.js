import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Save,
  AccountBalance,
  Settings as SettingsIcon,
  CreditCard,
  Edit,
} from '@mui/icons-material';
import axios from 'axios';

const AdminSettingsPage = () => {
  const theme = useTheme();

  const [paymentMethods, setPaymentMethods] = useState({
    NayaPay: { enabled: true, name: '', number: '' },
    JazzCash: { enabled: true, name: '', number: '' },
    Easypaisa: { enabled: true, name: '', number: '' },
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMethod, setEditingMethod] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/settings/payment-methods');
      
      if (response.data.success) {
        setPaymentMethods(response.data.paymentMethods);
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Failed to load payment settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMethod = async (method) => {
    try {
      const updatedMethod = {
        ...paymentMethods[method],
        enabled: !paymentMethods[method].enabled,
      };
      
      // Update UI optimistically
      setPaymentMethods({
        ...paymentMethods,
        [method]: updatedMethod,
      });
      
      // Send update to server
      const response = await axios.put('/api/admin/settings/payment-methods', {
        method,
        ...updatedMethod,
      });
      
      if (response.data.success) {
        setSuccess(`${method} has been ${updatedMethod.enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError(err.response?.data?.message || 'Failed to update payment method');
      
      // Revert UI change on error
      fetchPaymentSettings();
    }
  };

  const handleInputChange = (method, field, value) => {
    setPaymentMethods({
      ...paymentMethods,
      [method]: {
        ...paymentMethods[method],
        [field]: value,
      },
    });
    
    // Clear error when field is edited
    if (formErrors[`${method}-${field}`]) {
      setFormErrors({
        ...formErrors,
        [`${method}-${field}`]: '',
      });
    }
  };

  const validateMethodForm = (method) => {
    const errors = {};
    const methodData = paymentMethods[method];
    
    if (!methodData.name.trim()) {
      errors[`${method}-name`] = 'Account name is required';
    }
    
    if (!methodData.number.trim()) {
      errors[`${method}-number`] = 'Account number is required';
    } else if (!/^\d+$/.test(methodData.number)) {
      errors[`${method}-number`] = 'Account number must contain only digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveMethod = async (method) => {
    if (!validateMethodForm(method)) {
      return;
    }
    
    try {
      const methodData = paymentMethods[method];
      
      const response = await axios.put('/api/admin/settings/payment-methods', {
        method,
        ...methodData,
      });
      
      if (response.data.success) {
        setSuccess(`${method} settings updated successfully`);
        setEditingMethod('');
      }
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError(err.response?.data?.message || 'Failed to update payment method');
    }
  };

  const handleCancelEdit = () => {
    setEditingMethod('');
    fetchPaymentSettings();
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>

      {/* Payment Methods Settings */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CreditCard sx={{ mr: 1 }} />
          <Typography variant="h5">Payment Methods</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {Object.keys(paymentMethods).map((method) => (
            <Grid item xs={12} md={4} key={method}>
              <Card 
                variant="outlined"
                sx={{
                  borderColor: paymentMethods[method].enabled 
                    ? theme.palette.primary.main 
                    : theme.palette.divider,
                  opacity: paymentMethods[method].enabled ? 1 : 0.7,
                }}
              >
                <CardHeader
                  avatar={<AccountBalance color={paymentMethods[method].enabled ? "primary" : "disabled"} />}
                  title={method}
                  action={
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentMethods[method].enabled}
                          onChange={() => handleToggleMethod(method)}
                          color="primary"
                        />
                      }
                      label={paymentMethods[method].enabled ? "Enabled" : "Disabled"}
                    />
                  }
                />
                <Divider />
                <CardContent>
                  {editingMethod === method ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Account Name"
                          fullWidth
                          value={paymentMethods[method].name}
                          onChange={(e) => handleInputChange(method, 'name', e.target.value)}
                          error={!!formErrors[`${method}-name`]}
                          helperText={formErrors[`${method}-name`]}
                          margin="normal"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Account Number"
                          fullWidth
                          value={paymentMethods[method].number}
                          onChange={(e) => handleInputChange(method, 'number', e.target.value)}
                          error={!!formErrors[`${method}-number`]}
                          helperText={formErrors[`${method}-number`]}
                          margin="normal"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          onClick={handleCancelEdit} 
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="contained" 
                          startIcon={<Save />}
                          onClick={() => handleSaveMethod(method)}
                        >
                          Save
                        </Button>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Name:
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {paymentMethods[method].name || 'Not set'}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Number:
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {paymentMethods[method].number || 'Not set'}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          startIcon={<Edit />}
                          onClick={() => setEditingMethod(method)}
                          size="small"
                          disabled={!paymentMethods[method].enabled}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            These payment methods will be shown to customers during checkout. Make sure the account details are correct.
          </Alert>
        </Box>
      </Paper>

      {/* Other Settings */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h5">General Settings</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Alert severity="info">
          Additional settings will be added in future updates.
        </Alert>
      </Paper>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"}
          variant="filled"
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSettingsPage;
