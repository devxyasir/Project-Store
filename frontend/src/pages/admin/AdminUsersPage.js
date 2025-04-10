import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Search,
  Edit,
  Check,
  Person,
  AdminPanelSettings,
  Delete,
  Warning,
  ShoppingCart,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsersPage = () => {
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [operationSuccessful, setOperationSuccessful] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [userPurchases, setUserPurchases] = useState([]);
  const [selectedUserForPurchases, setSelectedUserForPurchases] = useState(null);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [deletePurchaseDialogOpen, setDeletePurchaseDialogOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search
    if (!users.length) {
      setFilteredUsers([]);
      return;
    }

    if (!search) {
      setFilteredUsers(users);
      setTotalPages(Math.ceil(users.length / ITEMS_PER_PAGE));
      return;
    }

    const filtered = users.filter(
      (user) => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
    
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when search changes
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users');
      
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setTotalPages(Math.ceil(response.data.users.length / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
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
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Open edit role dialog
  const handleOpenRoleDialog = (user) => {
    setCurrentUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  // Close edit role dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentUser(null);
    setNewRole('');
    
    // Clear success message after dialog closes
    setTimeout(() => {
      setOperationSuccessful(false);
    }, 300);
  };
  
  // Open delete user dialog
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  // Close delete user dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    
    if (operationSuccessful) {
      fetchUsers(); // Refresh users list if operation was successful
    }
    
    setOperationSuccessful(false);
  };
  
  // View user purchases
  const handleViewPurchases = async (user) => {
    setSelectedUserForPurchases(user);
    setLoadingPurchases(true);
    
    try {
      const response = await axios.get(`/api/admin/users/${user._id}`);
      
      if (response.data.success) {
        setUserPurchases(response.data.user.purchases || []);
      } else {
        setError('Failed to load user purchases');
      }
    } catch (err) {
      console.error('Error fetching user purchases:', err);
      setError('Failed to load user purchases. Please try again.');
    } finally {
      setLoadingPurchases(false);
      setPurchaseDialogOpen(true);
    }
  };
  
  // Close purchases dialog
  const handleClosePurchasesDialog = () => {
    setPurchaseDialogOpen(false);
    setSelectedUserForPurchases(null);
    setUserPurchases([]);
  };
  
  // Open delete purchase dialog
  const handleOpenDeletePurchaseDialog = (purchase) => {
    setPurchaseToDelete(purchase);
    setDeletePurchaseDialogOpen(true);
  };
  
  // Close delete purchase dialog
  const handleCloseDeletePurchaseDialog = () => {
    setDeletePurchaseDialogOpen(false);
    setPurchaseToDelete(null);
    setOperationSuccessful(false);
  };

  // Handle role selection change
  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  // Update user role
  const handleUpdateRole = async () => {
    if (!currentUser || newRole === currentUser.role) {
      handleCloseDialog();
      return;
    }
    
    try {
      const response = await axios.put(`/api/admin/users/${currentUser._id}/role`, {
        role: newRole
      });
      
      if (response.data.success) {
        // Update user in state
        const updatedUsers = users.map(user => 
          user._id === currentUser._id ? { ...user, role: newRole } : user
        );
        
        setUsers(updatedUsers);
        setOperationSuccessful(true);
        
        // Close dialog after short delay
        setTimeout(() => {
          handleCloseDialog();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.response?.data?.message || 'Failed to update role. Please try again.');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/users/${userToDelete._id}`);
      
      if (response.data.success) {
        // Remove user from state
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userToDelete._id));
        setOperationSuccessful(true);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete user purchase
  const handleDeletePurchase = async () => {
    if (!purchaseToDelete || !selectedUserForPurchases) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(
        `/api/admin/users/${selectedUserForPurchases._id}/products/${purchaseToDelete.product._id}`
      );
      
      if (response.data.success) {
        // Remove purchase from purchases list
        setUserPurchases(prevPurchases => 
          prevPurchases.filter(p => p._id !== purchaseToDelete._id)
        );
        
        // Update user purchases count in the users list
        setUsers(prevUsers => {
          return prevUsers.map(u => {
            if (u._id === selectedUserForPurchases._id) {
              return { 
                ...u, 
                purchases: u.purchases ? u.purchases.filter(p => p !== purchaseToDelete._id) : [] 
              };
            }
            return u;
          });
        });
        
        setOperationSuccessful(true);
        setDeletePurchaseDialogOpen(false);
      }
    } catch (err) {
      console.error('Error deleting user purchase:', err);
      setError('Failed to delete user purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email..."
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
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No users found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {search ? `No users matching "${search}" found.` : "No users in the system."}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Purchases</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageItems().map((userData) => (
                  <TableRow key={userData._id}>
                    <TableCell>{userData.name}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={userData.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                        label={userData.role === 'admin' ? 'Admin' : 'User'}
                        color={userData.role === 'admin' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(userData.createdAt)}</TableCell>
                    <TableCell>{userData.purchases?.length || 0}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        disabled={userData._id === user?._id}
                        onClick={() => handleOpenRoleDialog(userData)}
                        title="Edit Role"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="info"
                        onClick={() => handleViewPurchases(userData)}
                        title="View Purchases"
                      >
                        <ShoppingCart />
                      </IconButton>
                      <IconButton
                        color="error"
                        disabled={userData._id === user?._id}
                        onClick={() => handleOpenDeleteDialog(userData)}
                        title="Delete User"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          {operationSuccessful ? (
            <Alert
              severity="success"
              icon={<Check fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              Role updated successfully
            </Alert>
          ) : (
            <>
              <DialogContentText>
                Change the role for user: <strong>{currentUser?.name}</strong>
              </DialogContentText>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newRole}
                    onChange={handleRoleChange}
                    label="Role"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {operationSuccessful ? 'Close' : 'Cancel'}
          </Button>
          {!operationSuccessful && (
            <Button
              onClick={handleUpdateRole}
              color="primary"
              variant="contained"
              disabled={!newRole || newRole === currentUser?.role}
            >
              Update Role
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-user-dialog-title"
      >
        <DialogTitle id="delete-user-dialog-title">
          <Box display="flex" alignItems="center">
            <Warning color="error" sx={{ mr: 1 }} />
            Delete User
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This will permanently delete the user account and all associated data, including:
          </DialogContentText>
          <ul>
            <li>All transaction records</li>
            <li>All purchase history</li>
            <li>All receipts</li>
          </ul>
          <Typography variant="body2" color="error" sx={{ fontWeight: 'bold', mt: 2 }}>
            This action cannot be undone.
          </Typography>
          {userToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                User: {userToDelete.name}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Email: {userToDelete.email}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Purchases: {userToDelete.purchases?.length || 0}
              </Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {operationSuccessful && (
            <Alert severity="success" sx={{ mt: 2 }}>
              User deleted successfully
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancel
          </Button>
          {!operationSuccessful && (
            <Button 
              onClick={handleDeleteUser} 
              color="error" 
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
            >
              Delete User
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* User Purchases Dialog */}
      <Dialog
        open={purchaseDialogOpen}
        onClose={handleClosePurchasesDialog}
        aria-labelledby="purchases-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="purchases-dialog-title">
          <Box display="flex" alignItems="center">
            <ShoppingCart sx={{ mr: 1 }} />
            {selectedUserForPurchases ? `Purchases for ${selectedUserForPurchases.name}` : 'User Purchases'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingPurchases ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : userPurchases.length === 0 ? (
            <Typography variant="body1">No purchases found for this user.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Purchase Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userPurchases.map((purchase) => (
                    <TableRow key={purchase._id}>
                      <TableCell>{purchase.product?.title || 'Unknown Product'}</TableCell>
                      <TableCell>{purchase.txnId}</TableCell>
                      <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                      <TableCell>${purchase.amount}</TableCell>
                      <TableCell>
                        <Chip 
                          label={purchase.verified ? 'Verified' : 'Pending'}
                          color={purchase.verified ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeletePurchaseDialog(purchase)}
                          title="Delete Purchase"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePurchasesDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Purchase Dialog */}
      <Dialog
        open={deletePurchaseDialogOpen}
        onClose={handleCloseDeletePurchaseDialog}
        aria-labelledby="delete-purchase-dialog-title"
      >
        <DialogTitle id="delete-purchase-dialog-title">
          <Box display="flex" alignItems="center">
            <Warning color="error" sx={{ mr: 1 }} />
            Delete Purchase
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this purchase? This will permanently remove the product from the user's purchases.
          </DialogContentText>
          {purchaseToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Product: {purchaseToDelete.product?.title || 'Unknown Product'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Transaction ID: {purchaseToDelete.txnId}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Amount: ${purchaseToDelete.amount}
              </Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeletePurchaseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePurchase} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;
