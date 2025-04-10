import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Search,
  CloudDownload,
  Receipt,
  ShoppingBag,
  Download,
  OpenInNew,
  Visibility,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const PurchasesPage = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  
  // Receipt dialog state variables
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Fetch purchases data
  useEffect(() => {
    if (isAuthenticated) {
      fetchPurchases();
    }
  }, [isAuthenticated]);

  // Filter purchases based on search
  useEffect(() => {
    if (!purchases.length) {
      setFilteredPurchases([]);
      return;
    }

    if (!search) {
      setFilteredPurchases(purchases);
      setTotalPages(Math.ceil(purchases.length / 6));
      return;
    }

    const filtered = purchases.filter(
      (purchase) =>
        purchase.product.title.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredPurchases(filtered);
    setTotalPages(Math.ceil(filtered.length / 6));
    setCurrentPage(1); // Reset to first page when search changes
  }, [search, purchases]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/payments/purchases');

      if (response.data.success) {
        setPurchases(response.data.purchases);
        setFilteredPurchases(response.data.purchases);
        setTotalPages(Math.ceil(response.data.purchases.length / 6));
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (productId) => {
    try {
      const purchaseItem = purchases.find((p) => p.product._id === productId);
      if (!purchaseItem) {
        setError('No purchase information found. Please try again.');
        return;
      }

      setLoading(true);
      console.log('Attempting to download product:', productId);
      
      // DIRECT APPROACH: If the product has a direct download link, use it immediately
      if (purchaseItem.product && purchaseItem.product.downloadLink) {
        // This is an external URL - open it directly in a new tab
        console.log('Opening product download link (direct):', purchaseItem.product.downloadLink);
        const newWindow = window.open(purchaseItem.product.downloadLink, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      }
      // SECURE URL APPROACH: Use the transaction's secure download URL
      else if (purchaseItem.downloadUrl) {
        // If it's already an external URL
        if (purchaseItem.downloadUrl.startsWith('http')) {
          console.log('Opening external transaction URL:', purchaseItem.downloadUrl);
          const newWindow = window.open(purchaseItem.downloadUrl, '_blank', 'noopener,noreferrer');
          if (newWindow) newWindow.opener = null;
        } 
        // It's our API endpoint - we need to fetch the actual external URL
        else {
          console.log('Fetching external URL from API...');
          // Extract the secure token from the URL
          const cleanPath = purchaseItem.downloadUrl.replace(/^\/+/, '');
          const secureToken = cleanPath.startsWith('api/payments/download/') 
            ? cleanPath.replace('api/payments/download/', '') 
            : cleanPath.split('/').pop();
          
          // Call our API to get the actual external download URL
          const response = await axios.get(`/api/payments/download/${secureToken}`);
          
          if (response.data && response.data.success && response.data.downloadUrl) {
            console.log('Got external URL from API:', response.data.downloadUrl);
            // Open the external URL in a new tab
            const newWindow = window.open(response.data.downloadUrl, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
          } else {
            throw new Error('Invalid response from download API');
          }
        }
      } 
      // NO DOWNLOAD LINK AVAILABLE
      else {
        setError('Download link not available. Please contact support.');
        console.error('No download URL found for product ID:', productId);
      }
    } catch (err) {
      console.error('Error handling download:', err.message, err.stack);
      setError('Failed to access download. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDownloadDialog(false);
    setSelectedProduct(null);
    setDownloadLink('');
  };
  
  // Download receipt
  const handleDownloadReceipt = (purchaseId) => {
    if (!purchaseId) {
      setError('Receipt information is missing');
      return;
    }
    
    try {
      console.log('Downloading receipt for purchase:', purchaseId);
      // Set loading state
      setLoading(true);
      
      // Direct download approach - skips the HEAD check which may be failing
      const receiptUrl = `/api/payments/receipt/receipt-${purchaseId}.pdf`;
      console.log('Attempting direct download from:', receiptUrl);
      
      // Use axios to download the file directly as a blob
      axios.get(receiptUrl, { 
        responseType: 'blob',
        // Add timeout to prevent hanging
        timeout: 10000,
        // Handle progress
        onDownloadProgress: (progressEvent) => {
          console.log('Download progress:', progressEvent.loaded);
        }
      })
      .then(response => {
        console.log('Receipt download successful, content type:', response.headers['content-type']);
        // Check if we got a PDF
        if (response.headers['content-type'] === 'application/pdf' || 
            response.data.type === 'application/pdf' || 
            response.data.size > 0) {
          
          // Create a blob from the response data
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          
          console.log('Created blob URL for downloaded PDF');
          // Create a link element and trigger download
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `receipt-${purchaseId}.pdf`);
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log('Download completed successfully');
          setError('');
        } else {
          console.error('Response was not a valid PDF');
          setError('The receipt file appears to be invalid. Please try again or contact support.');
        }
      })
      .catch(err => {
        console.error('Failed to download receipt:', err);
        
        // Fall back to alternative method - open in new tab
        console.log('Trying alternative download method (open in new tab)');
        const newWindow = window.open(receiptUrl, '_blank');
        if (!newWindow) {
          setError('Failed to download or open receipt. Please allow pop-ups and try again.');
        } else {
          setError('');
        }
      })
      .finally(() => {
        setLoading(false);
      });
    } catch (error) {
      console.error('Error handling receipt download:', error);
      setError('Failed to download receipt. Please try again later.');
      setLoading(false);
    }
  };
  
  // Helper function to download a file
  const downloadReceiptFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setError('');
  };
  
  // View receipt in a styled dialog instead of opening PDF
  const handleViewReceipt = (purchase) => {
    if (!purchase || !purchase._id) {
      setError('Receipt information is missing');
      return;
    }
    
    try {
      console.log('Viewing receipt for purchase:', purchase._id);
      setLoadingReceipt(true);
      
      // Find the transaction ID (should be in the transaction field)
      let transactionId = purchase._id;
      
      // If the purchase has a transaction field, use that ID instead
      if (purchase.transaction && purchase.transaction._id) {
        transactionId = purchase.transaction._id;
        console.log('Using transaction ID from purchase:', transactionId);
      }
      
      // Fetch receipt data from our new API endpoint
      axios.get(`/api/payments/receipt-data/${transactionId}`)
        .then(response => {
          if (response.data.success) {
            setReceiptData(response.data.receiptData);
            setReceiptDialogOpen(true);
            setError(''); // Clear any previous errors
          } else {
            setError('Receipt data could not be retrieved');
          }
        })
        .catch(err => {
          console.error('Error fetching receipt data:', err);
          setError('Failed to retrieve receipt information. Please try again later.');
        })
        .finally(() => {
          setLoadingReceipt(false);
        });
    } catch (error) {
      console.error('Error handling view receipt:', error);
      setError('Failed to view receipt. Please try again later.');
      setLoadingReceipt(false);
    }
  };
  
  // Close receipt dialog
  const handleCloseReceiptDialog = () => {
    setReceiptDialogOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const itemsPerPage = 6;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Alert severity="warning">
          You need to be logged in to view your purchases.
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
        <Typography color="text.primary">My Purchases</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Purchases
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and download your purchased projects
        </Typography>
      </Box>

      {/* Search Box */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search purchases..."
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredPurchases.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingBag sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No purchases found
          </Typography>
          {search ? (
            <Typography variant="body1">
              No results match your search. Try different keywords.
            </Typography>
          ) : (
            <Typography variant="body1">
              You haven't made any purchases yet.
            </Typography>
          )}
          <Button
            variant="contained"
            component={RouterLink}
            to="/shop"
            sx={{ mt: 2 }}
          >
            Browse Projects
          </Button>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {getCurrentPageItems().map((purchase) => (
              <Grid item xs={12} sm={6} md={4} key={purchase._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={purchase.product.images?.[0] || 'https://source.unsplash.com/random?code'}
                    alt={purchase.product.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {purchase.product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {purchase.product.shortDescription}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`Purchased on ${formatDate(purchase.createdAt)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment: {purchase.method}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        ${purchase.amount}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Download />}
                      sx={{ mr: 1 }}
                      onClick={() => handleDownload(purchase.product._id)}
                    >
                      Download
                    </Button>
                    <Button
                      startIcon={<Visibility />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewReceipt(purchase)}
                      sx={{ mr: 1 }}
                    >
                      View Receipt
                    </Button>
                    <Button
                      startIcon={<Receipt />}
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        // If purchase has transaction, use that ID instead
                        const receiptId = purchase.transaction && purchase.transaction._id 
                          ? purchase.transaction._id 
                          : purchase._id;
                        handleDownloadReceipt(receiptId);
                      }}
                    >
                      Download Receipt
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Download Link Dialog */}
      <Dialog
        open={downloadDialog}
        onClose={handleCloseDialog}
        aria-labelledby="download-dialog-title"
        aria-describedby="download-dialog-description"
      >
        <DialogTitle id="download-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudDownload sx={{ mr: 1 }} />
            Download Project
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="download-dialog-description">
            {selectedProduct && (
              <>
                <Typography variant="body1" gutterBottom>
                  You have purchased <strong>{selectedProduct.product.title}</strong> and now have access to download it.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Click the button below to access your download. This link is only accessible to you as a verified purchaser.
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  If you encounter any issues with the download, please contact our support team.
                </Alert>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={() => {
              if (downloadLink) {
                // Open in a new tab with security attributes
                const newWindow = window.open(downloadLink, '_blank', 'noopener,noreferrer');
                if (newWindow) newWindow.opener = null;
              }
              handleCloseDialog();
            }}
            autoFocus
          >
            Download Project
          </Button>

        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            backgroundColor: theme.palette.primary.main, 
            color: 'white',
            textAlign: 'center',
            py: 2
          }}
        >
          Receipt Details
        </DialogTitle>
        <DialogContent sx={{ my: 2, p: 3 }}>
          {loadingReceipt ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : receiptData ? (
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              p: 3,
              backgroundColor: '#f9f9f9' 
            }}>
              <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
                PROJECT STORE
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                Payment Receipt
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {receiptData.transactionId || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(receiptData.purchaseDate).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Product
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {receiptData.product}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    ${receiptData.amount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {receiptData.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {receiptData.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {receiptData.customerEmail}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="body2" align="center" sx={{ mt: 3, fontStyle: 'italic' }}>
                Thank you for your purchase!
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" align="center" color="error">
              Receipt information could not be loaded.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseReceiptDialog} 
            variant="outlined"
            startIcon={<OpenInNew />}
          >
            Close
          </Button>
          {receiptData && (
            <Button
              onClick={() => handleDownloadReceipt(receiptData.receiptId || receiptData.transactionId)}
              variant="contained"
              color="secondary"
              startIcon={<Receipt />}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PurchasesPage;