import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  Tooltip,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
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
  Policy,
  KeyboardArrowDown,
  GavelRounded,
  SecurityRounded,
  Email,
  HomeRounded,
  ChevronLeft,
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
  const location = useLocation();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [policyMenuOpen, setPolicyMenuOpen] = useState(false);
  const [policyAnchorEl, setPolicyAnchorEl] = useState(null);
  const cartCount = getCartCount();
  
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
  
  // Policy menu handlers
  const handlePolicyMenuToggle = (event) => {
    setPolicyAnchorEl(event.currentTarget);
    setPolicyMenuOpen((prevOpen) => !prevOpen);
  };

  const handlePolicyMenuClose = () => {
    setPolicyMenuOpen(false);
  };
  
  const handlePolicyNavigation = (path) => {
    navigate(path);
    handlePolicyMenuClose();
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
      sx={{ 
        width: 280,
        height: '100%',
        background: mode === 'dark' 
          ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
        overflowY: 'auto',
      }}
      role="presentation"
    >
      {/* Header of the drawer */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        mb: 1,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          Project Store
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <ChevronLeft />
        </IconButton>
      </Box>

      {/* User info section if authenticated */}
      {isAuthenticated && (
        <Box sx={{ p: 2, textAlign: 'center', mb: 1 }}>
          <Avatar 
            sx={{ 
              width: 70, 
              height: 70, 
              mx: 'auto',
              mb: 1,
              bgcolor: theme.palette.secondary.main,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            {displayName || '?'}
          </Avatar>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.email || ''}
          </Typography>
        </Box>
      )}
      
      {/* Main navigation */}
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" color="textSecondary" sx={{ mx: 2, mb: 1, fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1 }}>
          MAIN NAVIGATION
        </Typography>
        
        {[
          { text: 'Home', icon: <HomeRounded color="primary" />, path: '/' },
          { text: 'Shop', icon: <ShoppingBag color="primary" />, path: '/shop' },
          { text: 'Contact Us', icon: <Email color="primary" />, path: '/contact' },
        ].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem 
              key={item.text}
              component={RouterLink} 
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive ? `${theme.palette.primary.main}15` : 'transparent',
                color: isActive ? theme.palette.primary.main : 'inherit',
                fontWeight: isActive ? 600 : 400,
                '.MuiListItemText-root': {
                  fontWeight: isActive ? 600 : 400,
                },
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}10`,
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'inherit', minWidth: 45 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </Box>
      
      <Divider sx={{ my: 1.5 }} />
      
      {/* Legal & Policies in mobile menu */}
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" color="textSecondary" sx={{ mx: 2, mb: 1, fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1 }}>
          LEGAL & POLICIES
        </Typography>
        
        {[
          { text: 'Privacy Policy', icon: <Policy color="primary" />, path: '/privacy-policy' },
          { text: 'Terms of Service', icon: <GavelRounded color="primary" />, path: '/terms-of-service' },
          { text: 'Shipping Policy', icon: <Policy color="primary" />, path: '/shipping-policy' },
          { text: 'Refund Policy', icon: <Policy color="primary" />, path: '/refund-policy' },
          { text: 'Cookie Policy', icon: <Policy color="primary" />, path: '/cookie-policy' },
          { text: 'GDPR Compliance', icon: <SecurityRounded color="primary" />, path: '/gdpr-compliance' },
          { text: 'CCPA Compliance', icon: <SecurityRounded color="primary" />, path: '/ccpa-compliance' },
          { text: 'Accessibility', icon: <Policy color="primary" />, path: '/accessibility' },
          { text: 'Disclaimer', icon: <Policy color="primary" />, path: '/disclaimer' },
        ].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem 
              key={item.text}
              component={RouterLink} 
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive ? `${theme.palette.primary.main}15` : 'transparent',
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}10`,
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'inherit', minWidth: 45 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400, 
                  } 
                }} 
              />
            </ListItem>
          );
        })}
      </Box>
      
      <Divider sx={{ my: 1.5 }} />
      
      {/* User account links */}
      <List>
        <ListItem button component={RouterLink} to="/accessibility">
          <ListItemIcon><Policy /></ListItemIcon>
          <ListItemText primary="Accessibility" />
        </ListItem>
        <ListItem button component={RouterLink} to="/disclaimer">
          <ListItemIcon><Policy /></ListItemIcon>
          <ListItemText primary="Disclaimer" />
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
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{
          background: mode === 'dark' 
            ? `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease-in-out',
          '& .MuiToolbar-root': {
            minHeight: { xs: '64px', md: '72px' },
            padding: { xs: '0 16px', md: '0 24px' },
            transition: 'all 0.3s ease',
          },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 800,
              letterSpacing: 0.5,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'white',
                transform: 'translateX(-100%)',
                transition: 'transform 0.3s ease',
              },
              '&:hover': {
                textDecoration: 'none',
                '&::before': {
                  transform: 'translateX(0)',
                },
              },
            }}
          >
            <Box component="span" sx={{ 
              background: 'linear-gradient(45deg, #fff, #f0f0f0)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 1,
              fontSize: { xs: '1.3rem', md: '1.5rem' },
            }}>
              Project Store
            </Box>
            <Box 
              component="span" 
              sx={{ 
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                opacity: 0.7, 
                mt: '4px',
                ml: '2px',
                display: { xs: 'none', md: 'block' },
                fontWeight: 'normal',
                letterSpacing: 0,
              }}
            >
              v2.0
            </Box>
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 4 }}>
              {[
                { text: 'Home', path: '/' },
                { text: 'Shop', path: '/shop' },
                { text: 'Contact Us', path: '/contact' },
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      mx: 0.5,
                      px: 2,
                      color: 'white',
                      position: 'relative',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '0.5px',
                      fontSize: '0.95rem',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 5,
                        left: '50%',
                        width: isActive ? '30px' : '0px',
                        height: '3px',
                        backgroundColor: 'white',
                        borderRadius: '3px',
                        transform: 'translateX(-50%)',
                        transition: 'all 0.3s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        '&::after': {
                          width: '20px',
                        }
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
              
              {/* Legal & Policies Dropdown */}
              <Button
                aria-owns={policyMenuOpen ? 'policy-menu' : undefined}
                aria-haspopup="true"
                onClick={handlePolicyMenuToggle}
                endIcon={<KeyboardArrowDown sx={{ 
                  transition: 'transform 0.3s ease',
                  transform: policyMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                }} />}
                sx={{
                  mx: 0.5,
                  px: 2,
                  color: 'white',
                  position: 'relative',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  fontSize: '0.95rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Policies
              </Button>
              <Popper
                open={policyMenuOpen}
                anchorEl={policyAnchorEl}
                role={undefined}
                transition
                disablePortal
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
              >
                {({ TransitionProps }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: 'center top',
                    }}
                  >
                    <Paper 
                      elevation={6}
                      sx={{ 
                        mt: 1.5, 
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: mode === 'dark' 
                          ? 'linear-gradient(45deg, rgba(30,30,30,0.95), rgba(50,50,50,0.95))' 
                          : 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(240,240,240,0.95))',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      }}
                    >
                      <ClickAwayListener onClickAway={handlePolicyMenuClose}>
                        <MenuList 
                          autoFocusItem={policyMenuOpen} 
                          id="policy-menu"
                          sx={{ 
                            p: 1,
                            maxHeight: '65vh',
                            overflowY: 'auto',
                          }}
                        >
                          {[
                            { title: 'Privacy Policy', icon: <Policy fontSize="small" />, path: '/privacy-policy' },
                            { title: 'Terms of Service', icon: <GavelRounded fontSize="small" />, path: '/terms-of-service' },
                            { title: 'Shipping Policy', icon: <Policy fontSize="small" />, path: '/shipping-policy' },
                            { title: 'Refund Policy', icon: <Policy fontSize="small" />, path: '/refund-policy' },
                            { title: 'Cookie Policy', icon: <Policy fontSize="small" />, path: '/cookie-policy' },
                            { title: 'GDPR Compliance', icon: <SecurityRounded fontSize="small" />, path: '/gdpr-compliance' },
                            { title: 'CCPA Compliance', icon: <SecurityRounded fontSize="small" />, path: '/ccpa-compliance' },
                            { title: 'Accessibility', icon: <Policy fontSize="small" />, path: '/accessibility' },
                            { title: 'Disclaimer', icon: <Policy fontSize="small" />, path: '/disclaimer' },
                          ].map((item, index) => (
                            <MenuItem 
                              key={item.path} 
                              onClick={() => handlePolicyNavigation(item.path)}
                              sx={{
                                borderRadius: 1.5,
                                my: 0.5,
                                px: 1.5,
                                py: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                  transform: 'translateX(5px)',
                                }
                              }}
                            >
                              <ListItemIcon 
                                sx={{ 
                                  minWidth: 36,
                                  color: theme.palette.primary.main
                                }}
                              >
                                {item.icon}
                              </ListItemIcon>
                              <Typography variant="body2">{item.title}</Typography>
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Right side actions */}
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={toggleTheme}
                aria-label="toggle theme"
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  width: 40,
                  height: 40,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'rotate(30deg)',
                  },
                }}
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            
            {!isMobile && isAuthenticated && (
              <Tooltip title="Shopping Cart">
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  aria-label="shopping cart"
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    width: 40,
                    height: 40,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    ...(cartCount > 0 && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.error.main,
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)' },
                          '70%': { boxShadow: '0 0 0 6px rgba(255, 0, 0, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' },
                        },
                      }
                    })
                  }}
                >
                  <Badge 
                    badgeContent={cartCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontWeight: 'bold',
                        fontSize: '0.65rem',
                        minWidth: '18px',
                        height: '18px',
                        p: '0 4px',
                      }
                    }}
                  >
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            {!isMobile && (
              isAuthenticated ? (
                <Tooltip title="Account Settings">
                  <IconButton
                    edge="end"
                    aria-label="account of current user"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    sx={{
                      ml: 1,
                      p: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: theme.palette.secondary.main,
                        border: '2px solid rgba(255, 255, 255, 0.7)',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      {displayName || '?'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  startIcon={<Person />}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50px',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Login
                </Button>
              )
            )}
          </Box>
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
