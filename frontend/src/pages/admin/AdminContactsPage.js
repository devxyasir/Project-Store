import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Reply as ReplyIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const getStatusColor = (status) => {
  switch (status) {
    case 'unread':
      return 'error';
    case 'read':
      return 'primary';
    case 'responded':
      return 'success';
    default:
      return 'default';
  }
};

const AdminContactsPage = () => {
  const theme = useTheme();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    responded: 0,
    recentContacts: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch contacts on initial load and when filters change
  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [page, rowsPerPage, statusFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      let url = `/api/contact?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      const response = await axios.get(url);
      setContacts(response.data.contacts);
      setTotalContacts(response.data.pagination.totalContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/contact/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setViewDialogOpen(true);
    
    // If the contact is unread, mark it as read
    if (contact.status === 'unread') {
      handleMarkAsRead(contact._id, false);
    }
  };

  const handleReplyContact = (contact) => {
    setSelectedContact(contact);
    setReplyDialogOpen(true);
    // Pre-fill with a greeting
    setReplyText(`Dear ${contact.name},\n\nThank you for contacting us.\n\n`);
  };

  const handleDeleteContact = (contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleMarkAsRead = async (contactId, showToast = true) => {
    try {
      await axios.put(`/api/contact/${contactId}/status`, { status: 'read' });
      if (showToast) {
        toast.success('Marked as read');
      }
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error marking contact as read:', error);
      toast.error('Failed to update contact status');
    }
  };

  const confirmDeleteContact = async () => {
    try {
      await axios.delete(`/api/contact/${selectedContact._id}`);
      toast.success('Contact deleted successfully');
      fetchContacts();
      fetchStats();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply text cannot be empty');
      return;
    }

    setReplying(true);
    try {
      await axios.post(`/api/contact/${selectedContact._id}/respond`, {
        responseText: replyText
      });
      toast.success('Reply sent successfully');
      fetchContacts();
      fetchStats();
      setReplyDialogOpen(false);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      fetchContacts();
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        setStatusFilter('all');
        break;
      case 1:
        setStatusFilter('unread');
        break;
      case 2:
        setStatusFilter('read');
        break;
      case 3:
        setStatusFilter('responded');
        break;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Contact Messages
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Messages', value: stats.total, color: theme.palette.info.main },
          { title: 'Unread', value: stats.unread, color: theme.palette.error.main },
          { title: 'Read', value: stats.read, color: theme.palette.primary.main },
          { title: 'Responded', value: stats.responded, color: theme.palette.success.main },
          { title: 'Last 7 Days', value: stats.recentContacts, color: theme.palette.warning.main },
        ].map((stat, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Card 
              sx={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2,
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                overflow: 'hidden',
              }}
            >
              <Box sx={{ height: 5, bgcolor: stat.color }} />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => {
                      setSearchTerm('');
                      fetchContacts();
                    }}>
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
                startAdornment={
                  <FilterListIcon sx={{ mr: 1, color: 'action.active' }} fontSize="small" />
                }
              >
                <MenuItem value="all">All Messages</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="responded">Responded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPage(0);
                fetchContacts();
                fetchStats();
              }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Messages" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Unread</span>
                {stats.unread > 0 && (
                  <Chip 
                    size="small" 
                    label={stats.unread} 
                    color="error" 
                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Read" />
          <Tab label="Responded" />
        </Tabs>
      </Box>

      {/* Contacts Table */}
      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading contact messages...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1">No contact messages found</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm ? 'Try a different search term' : statusFilter !== 'all' ? 'Try a different filter' : ''}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow 
                    key={contact._id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: contact.status === 'unread' ? `${theme.palette.primary.light}15` : 'inherit'
                    }}
                  >
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontWeight: contact.status === 'unread' ? 'bold' : 'normal'
                      }}
                    >
                      {contact.subject}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {format(new Date(contact.createdAt), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={contact.status.charAt(0).toUpperCase() + contact.status.slice(1)} 
                        color={getStatusColor(contact.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewContact(contact)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {contact.status !== 'responded' && (
                        <Tooltip title="Reply">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleReplyContact(contact)}
                          >
                            <ReplyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {contact.status === 'unread' && (
                        <Tooltip title="Mark as Read">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleMarkAsRead(contact._id)}
                          >
                            <MarkEmailReadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteContact(contact)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalContacts}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* View Contact Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedContact && (
          <>
            <DialogTitle>
              <Typography variant="h6" component="div">
                Contact Message Details
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">From</Typography>
                    <Typography variant="body1">{selectedContact.name}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{selectedContact.email}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedContact.createdAt), 'MMMM dd, yyyy')} at {format(new Date(selectedContact.createdAt), 'h:mm a')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                    <Chip 
                      label={selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)} 
                      color={getStatusColor(selectedContact.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{selectedContact.subject}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Message</Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {selectedContact.message}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
                
                {selectedContact.status === 'responded' && selectedContact.adminResponse && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Response</Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Reply sent on {selectedContact.adminResponse.respondedAt ? 
                          format(new Date(selectedContact.adminResponse.respondedAt), 'MMMM dd, yyyy') + ' at ' + 
                          format(new Date(selectedContact.adminResponse.respondedAt), 'h:mm a') : 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: `${theme.palette.success.main}10`,
                        borderLeft: `4px solid ${theme.palette.success.main}`,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {selectedContact.adminResponse.text}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedContact.status !== 'responded' && (
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    setReplyDialogOpen(true);
                    handleReplyContact(selectedContact);
                  }} 
                  color="primary"
                  startIcon={<ReplyIcon />}
                >
                  Reply
                </Button>
              )}
              <Button onClick={() => setViewDialogOpen(false)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => !replying && setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedContact && (
          <>
            <DialogTitle>
              <Typography variant="h6" component="div">
                Reply to {selectedContact.name}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText paragraph>
                Original message: <strong>{selectedContact.subject}</strong>
              </DialogContentText>
              
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  maxHeight: 150,
                  overflow: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedContact.message}
                </Typography>
              </Paper>
              
              <TextField
                autoFocus
                margin="dense"
                label="Your Response"
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={replying}
              />
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setReplyDialogOpen(false)} 
                variant="outlined"
                disabled={replying}
              >
                Cancel
              </Button>
              <Button 
                onClick={sendReply} 
                variant="contained" 
                color="primary"
                disabled={replying || !replyText.trim()}
                startIcon={replying ? <CircularProgress size={20} /> : <ReplyIcon />}
              >
                {replying ? 'Sending...' : 'Send Reply'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this contact message from {selectedContact?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteContact} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminContactsPage;
