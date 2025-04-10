import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Search,
  Download,
  Visibility,
  ReceiptLong,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ReceiptsPage = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionIdFromUrl = queryParams.get('transactionId');

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [highlightedReceipt, setHighlightedReceipt] = useState(null);

  // Fetch receipts data
  useEffect(() => {
    if (isAuthenticated) {
      fetchReceipts();
    }
  }, [isAuthenticated]);

  // Filter receipts based on search and highlight receipt from URL
  useEffect(() => {
    if (!receipts.length) {
      setFilteredReceipts([]);
      return;
    }

    // If receipt ID is provided in URL, highlight that receipt
    if (transactionIdFromUrl) {
      setHighlightedReceipt(transactionIdFromUrl);
    }

    if (!search) {
      setFilteredReceipts(receipts);
      return;
    }

    const filtered = receipts.filter(
      (receipt) =>
        receipt.product.title.toLowerCase().includes(search.toLowerCase()) ||
        receipt.transaction.txnId.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredReceipts(filtered);
  }, [search, receipts, transactionIdFromUrl]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/payments/receipts');

      if (response.data.success) {
        setReceipts(response.data.receipts);
        setFilteredReceipts(response.data.receipts);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load receipts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Download receipt
  const handleDownloadReceipt = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  // View receipt
  const handleViewReceipt = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Alert severity="warning">
          You need to be logged in to view your receipts.
        </Alert>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Typography color="text.primary">Receipts</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Receipts
        </Typography>
        <TextField
          placeholder="Search receipts..."
          size="small"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredReceipts.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8 }}>
          <ReceiptLong sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No receipts found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {search
              ? `No receipts matching "${search}" found.`
              : "You don't have any receipts yet."}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/shop"
            sx={{ mt: 2 }}
          >
            Browse Projects
          </Button>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow 
                    key={receipt._id}
                    sx={{ 
                      '&:hover': { bgcolor: theme.palette.action.hover },
                      bgcolor: highlightedReceipt === receipt.transaction._id ? 
                        (theme.palette.mode === 'dark' ? 'rgba(63, 81, 181, 0.15)' : 'rgba(63, 81, 181, 0.08)') : 
                        'inherit',
                    }}
                  >
                    <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                    <TableCell>
                      <Link 
                        component={RouterLink} 
                        to={`/product/${receipt.product._id}`}
                        color="inherit"
                        sx={{ fontWeight: 500 }}
                      >
                        {receipt.product.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                        {receipt.transaction.txnId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        ${receipt.transaction.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>{receipt.transaction.method}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Receipt">
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewReceipt(receipt.pdfUrl)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Receipt">
                        <IconButton 
                          color="secondary"
                          onClick={() => handleDownloadReceipt(receipt.pdfUrl)}
                          size="small"
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default ReceiptsPage;
