import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Dashboard,
  Receipt,
  Logout,
  LightMode,
  DarkMode,
  AdminPanelSettings,
  ShoppingBag,
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { getCartCount } = useCart();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  
  // Update display name when user changes
  useEffect(() => {
    if (user && user.name) {
      setDisplayName(user.name.charAt(0).toUpperCase());
    } else {
      setDisplayName('');
    }
  }, [user]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    // Close menu first to provide immediate visual feedback
    handleMenuClose();
    // Perform logout
    await logout();
    // Navigate after logout is complete
    navigate('/');
    // Force reload to clear any lingering state
    // setTimeout(() => window.location.reload(), 100);
  };

  // Profile menu
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      id="profile-menu"
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        Dashboard
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/purchases'); }}>
        <ListItemIcon>
          <ShoppingBag fontSize="small" />
        </ListItemIcon>
        My Purchases
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/receipts'); }}>
        <ListItemIcon>
          <Receipt fontSize="small" />
        </ListItemIcon>
        Receipts
      </MenuItem>
      {user && user.role === 'admin' && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          Admin Panel
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <List>
        <ListItem component={RouterLink} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={RouterLink} to="/shop">
          <ListItemText primary="Shop" />
        </ListItem>
      </List>
      <Divider />
      {isAuthenticated ? (
        <List>
          <ListItem component={RouterLink} to="/dashboard">
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem component={RouterLink} to="/purchases">
            <ListItemIcon>
              <ShoppingBag />
            </ListItemIcon>
            <ListItemText primary="My Purchases" />
          </ListItem>
          <ListItem component={RouterLink} to="/receipts">
            <ListItemIcon>
              <Receipt />
            </ListItemIcon>
            <ListItemText primary="Receipts" />
          </ListItem>
          <ListItem component={RouterLink} to="/cart">
            <ListItemIcon>
              <Badge badgeContent={getCartCount()} color="error">
                <ShoppingCart />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Cart" />
          </ListItem>
          {user && user.role === 'admin' && (
            <ListItem component={RouterLink} to="/admin">
              <ListItemIcon>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText primary="Admin Panel" />
            </ListItem>
          )}
          <Divider />
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem component={RouterLink} to="/login">
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            <Box component="span" sx={{ mr: 1 }}>🚀</Box>
            Project Store
          </Typography>
          
          {!isMobile && (
            <Box sx={{ ml: 4, display: 'flex' }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
              >
                Home
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/shop"
              >
                Shop
              </Button>
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label="toggle theme"
          >
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          
          {!isMobile && isAuthenticated && (
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/cart"
              aria-label="shopping cart"
            >
              <Badge badgeContent={getCartCount()} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          )}
          
          {!isMobile && (
            isAuthenticated ? (
              <IconButton
                color="inherit"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                  {displayName || '?'}
                </Avatar>
              </IconButton>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<Person />}
              >
                Login
              </Button>
            )
          )}
        </Toolbar>
      </AppBar>
      
      {renderProfileMenu}
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;
