import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  Chip,
  Tooltip,
  Badge,
  Zoom,
  Fade,
  LinearProgress,
  Stack,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ShoppingBag,
  Receipt,
  Settings,
  ArrowForward,
  Person,
  Dashboard as DashboardIcon,
  Download,
  Notifications,
  Favorite,
  LocalOffer,
  Verified,
  TrendingUp,
  ShowChart,
  AttachMoney,
  Autorenew,
  CalendarToday,
  Star,
  Laptop,
  Code,
  GitHub,
  BarChart,
  Menu as MenuIcon,
  AccessTime,
  Security,
  EventNote,
  InfoOutlined,
  FormatQuote,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Animation effect on mount with sequence to stagger animations
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Fake stats for UI demonstration
  const stats = {
    projectsCompleted: 12,
    totalDownloads: 873,
    satisfaction: 98,
    activeProjects: 3
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentPurchases();
    }
  }, [isAuthenticated]);

  const fetchRecentPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/payments/purchases?limit=3');
      
      if (response.data.success) {
        setRecentPurchases(response.data.purchases);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load recent purchases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Alert severity="warning">
          You need to be logged in to view your dashboard.
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

  // Toggle mobile drawer
  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Activity timeline data
  const activityTimeline = [
    { 
      id: 1, 
      title: 'Purchased React Dashboard Kit', 
      date: '2 days ago', 
      icon: <Code />, 
      color: 'primary.main' 
    },
    { 
      id: 2, 
      title: 'Downloaded Node.js Starter Kit', 
      date: '5 days ago', 
      icon: <Download />, 
      color: 'success.main' 
    },
    { 
      id: 3, 
      title: 'Added project to favorites', 
      date: '1 week ago',
      icon: <Favorite />, 
      color: 'error.main' 
    },
    { 
      id: 4, 
      title: 'Account created', 
      date: '2 weeks ago', 
      icon: <Person />, 
      color: 'info.main' 
    }
  ];
  
  return (
    <Box sx={{ 
      background: theme.palette.mode === 'dark' 
      ? `linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.grey[900]})` 
      : `linear-gradient(to bottom, ${theme.palette.grey[50]}, #ffffff)`,
      minHeight: '100vh',
      pt: 2, 
      pb: 6
    }}>
      <Container maxWidth="lg">
        {/* Mobile menu button - only on small screens */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton 
              onClick={toggleDrawer(true)} 
              sx={{ 
                bgcolor: theme.palette.background.paper,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: theme.palette.background.paper }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        
        {/* Mobile navigation drawer */}
        <SwipeableDrawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          sx={{ 
            '& .MuiDrawer-paper': { 
              width: 280,
              borderRadius: '16px 0 0 16px',
              boxShadow: '-5px 0 25px rgba(0,0,0,0.1)'
            } 
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 50,
                  height: 50,
                  mr: 2,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{user?.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItemButton>
                <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon><ShoppingBag color="primary" /></ListItemIcon>
                <ListItemText primary="My Purchases" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon><Receipt color="primary" /></ListItemIcon>
                <ListItemText primary="Receipts" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon><Settings color="primary" /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </List>
          </Box>
        </SwipeableDrawer>

        <Fade in={animate} timeout={800}>
          <Box sx={{ 
            mb: 4, 
            mt: 3,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                Welcome Back, {user?.name?.split(' ')[0]}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: { xs: 2, sm: 0 } }}>
                Here's what's happening with your projects today
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton sx={{ 
                  bgcolor: theme.palette.background.paper, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: theme.palette.background.paper, transform: 'translateY(-3px)' },
                  transition: 'transform 0.2s ease'
                }}>
                  <Badge badgeContent={2} color="error">
                    <Notifications color="primary" />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Account Settings">
                <IconButton sx={{ 
                  bgcolor: theme.palette.background.paper, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: theme.palette.background.paper, transform: 'translateY(-3px)' },
                  transition: 'transform 0.2s ease'
                }}>
                  <Settings color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Fade>
        
        {/* Quick Stats Row */}
        <Fade in={animate} timeout={1000} style={{ transitionDelay: animate ? '200ms' : '0ms' }}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>              
              <Grid item xs={6} md={3}>
                <Paper sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(0, 150, 136, 0.1)', 
                    color: 'success.main',
                    width: 56, 
                    height: 56,
                    mb: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)'
                  }}>
                    <Code />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.projectsCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Projects Completed
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Paper sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(63, 81, 181, 0.1)', 
                    color: 'primary.main',
                    width: 56, 
                    height: 56,
                    mb: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)'
                  }}>
                    <Download />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalDownloads}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Downloads
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Paper sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(233, 30, 99, 0.1)', 
                    color: 'error.main',
                    width: 56, 
                    height: 56,
                    mb: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)'
                  }}>
                    <Star />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.satisfaction}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Satisfaction Rate
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Paper sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 152, 0, 0.1)', 
                    color: 'warning.main',
                    width: 56, 
                    height: 56,
                    mb: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)'
                  }}>
                    <Autorenew />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.activeProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Active Projects
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>

      <Grid container spacing={4}>
        {/* User Profile Summary */}
        <Grid item xs={12} md={4} lg={3}>
          <Zoom in={animate} style={{ transitionDelay: animate ? '200ms' : '0ms' }}>
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              height: '100%',
              background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                transform: 'translateY(-5px)'
              },
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                mb: 3,
                position: 'relative',
                pb: 2
              }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 80,
                    height: 80,
                    mb: 2,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    border: `4px solid ${theme.palette.background.paper}`,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {user?.email}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    icon={<Verified sx={{ fontSize: 16 }} />} 
                    label={user?.role === 'admin' ? 'Admin' : 'Verified User'} 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<LocalOffer sx={{ fontSize: 16 }} />} 
                    label="Premium" 
                    color="secondary" 
                    size="small"
                    variant="outlined" 
                  />
                </Box>
              </Box>
              
              <Divider sx={{ 
                my: 2, 
                '&::before, &::after': {
                  borderColor: theme.palette.primary.light,
                }
              }} />
              
              <List component="nav" disablePadding sx={{ 
                '& .MuiListItemButton-root': {
                  borderRadius: 2,
                  mb: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    transform: 'translateX(5px)'
                  }
                }
              }}>
              <ListItemButton component={RouterLink} to="/dashboard">
                <ListItemIcon>
                  <DashboardIcon color="primary" sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                </ListItemIcon>
                <ListItemText primary="Dashboard" secondary="Overview" />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/purchases">
                <ListItemIcon>
                  <ShoppingBag color="primary" sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                </ListItemIcon>
                <ListItemText primary="My Purchases" secondary={`${recentPurchases.length} projects`} />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/receipts">
                <ListItemIcon>
                  <Receipt color="primary" sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                </ListItemIcon>
                <ListItemText primary="Receipts" secondary="View history" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <Settings color="primary" sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                </ListItemIcon>
                <ListItemText primary="Account Settings" secondary="Manage profile" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <Favorite color="primary" sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                </ListItemIcon>
                <ListItemText primary="Wishlist" secondary="Saved items" />
              </ListItemButton>
            </List>
          </Paper>
        </Zoom>
        </Grid>

        {/* Dashboard Content */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Zoom in={animate} style={{ transitionDelay: animate ? '300ms' : '0ms' }}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    height: '100%',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
                      opacity: 0.6,
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 70,
                        height: 70,
                        mb: 2,
                        mx: 'auto',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }}
                    >
                      <ShoppingBag sx={{ fontSize: 40, color: 'white' }} />
                    </Avatar>
                    
                    <Typography variant="h5" fontWeight="500" gutterBottom>
                      My Projects
                    </Typography>
                    
                    <Typography variant="h2" fontWeight="bold" sx={{ my: 1 }}>
                      {loading ? 
                        <CircularProgress size={40} color="inherit" /> : 
                        <Fade in={!loading} timeout={500}>
                          <Box>{recentPurchases.length}</Box>
                        </Fade>
                      }
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                      {loading ? 'Loading...' : 'Projects in your collection'}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/purchases"
                      size="medium"
                      sx={{
                        mt: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: theme.palette.primary.dark,
                        fontWeight: 'bold',
                        px: 3,
                        py: 1,
                        borderRadius: 8,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                        },
                      }}
                      endIcon={<ArrowForward />}
                    >
                      View All Projects
                    </Button>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Zoom in={animate} style={{ transitionDelay: animate ? '400ms' : '0ms' }}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    height: '100%',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    color: 'white',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
                      opacity: 0.6,
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 70,
                        height: 70,
                        mb: 2,
                        mx: 'auto',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }}
                    >
                      <Person sx={{ fontSize: 40, color: 'white' }} />
                    </Avatar>
                    
                    <Typography variant="h5" fontWeight="500" gutterBottom>
                      Account Status
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
                      <Chip 
                        label={user?.role === 'admin' ? 'Administrator' : 'Standard Account'} 
                        sx={{ 
                          fontWeight: 'bold', 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          px: 1
                        }} 
                      />
                      <Chip 
                        icon={<Verified sx={{ fontSize: 16, color: 'white' }} />}
                        label="Verified" 
                        sx={{ 
                          fontWeight: 'bold', 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }} 
                      />
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                      {user?.role === 'admin' ? 'Full access to all features' : 'Access to standard features'}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="medium"
                      sx={{
                        mt: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: theme.palette.secondary.dark,
                        fontWeight: 'bold',
                        px: 3,
                        py: 1,
                        borderRadius: 8,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                        },
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Manage Profile
                    </Button>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Recent Purchases */}
          <Zoom in={animate} style={{ transitionDelay: animate ? '500ms' : '0ms' }}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: theme.palette.background.paper,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                pb: 1,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Recent Purchases
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your latest project acquisitions
                  </Typography>
                </Box>
                {recentPurchases.length > 0 && !loading && !error && (
                  <Chip 
                    label={`${recentPurchases.length} items`} 
                    color="primary" 
                    variant="outlined" 
                    size="small" 
                  />
                )}
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6, flexDirection: 'column' }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading your purchases...
                  </Typography>
                </Box>
              ) : error ? (
                <Alert 
                  severity="error" 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    border: '1px solid rgba(211, 47, 47, 0.2)'
                  }}
                >
                  {error}
                </Alert>
              ) : recentPurchases.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {recentPurchases.map((purchase, index) => (
                      <Grid item xs={12} key={purchase._id}>
                        <Fade in={animate} style={{ transitionDelay: animate ? `${600 + (index * 100)}ms` : '0ms' }}>
                          <Card sx={{ 
                            display: 'flex', 
                            height: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                            }
                          }}>
                            <CardActionArea
                              component={RouterLink}
                              to={`/product/${purchase.product.slug}`}
                              sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}
                            >
                              <CardMedia
                                component="img"
                                sx={{ 
                                  width: 120,
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRight: `1px solid ${theme.palette.divider}`
                                }}
                                image={purchase.product.images?.[0] || 'https://source.unsplash.com/random?code'}
                                alt={purchase.product.title}
                              />
                              <CardContent sx={{ flex: 1, p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                                      {purchase.product.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      Purchased on: {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric'
                                      })}
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label={`$${purchase.amount}`} 
                                    color="primary" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      ml: 2,
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }} 
                                  />
                                </Box>
                                
                                <Box sx={{ display: 'flex', mt: 2, gap: 1, alignItems: 'center' }}>
                                  <Chip 
                                    icon={<Download fontSize="small" />} 
                                    label="Download" 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                  />
                                  <Chip 
                                    label="View Receipt" 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      component={RouterLink}
                      to="/purchases"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ 
                        px: 4, 
                        py: 1, 
                        borderRadius: 8,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      View All Purchases
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  px: 3,
                  background: `linear-gradient(45deg, ${theme.palette.grey[50]}, ${theme.palette.background.paper})`,
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`
                }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 3,
                    bgcolor: theme.palette.grey[100],
                    color: theme.palette.text.secondary
                  }}>
                    <ShoppingBag sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    No Purchases Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    You haven't made any purchases yet. Browse our collection of projects and tools to enhance your development workflow.
                  </Typography>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/shop"
                    color="primary"
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: 8,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Browse Projects
                  </Button>
                </Box>
              )}
            </Paper>
          </Zoom>
        </Grid>
        
        {/* Activity Timeline Section */}
        <Grid item xs={12} md={6} lg={4}>
          <Zoom in={animate} style={{ transitionDelay: animate ? '600ms' : '0ms' }}>
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: theme.palette.background.paper
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              <Timeline sx={{ 
                p: 0, 
                m: 0,
                [`& .MuiTimelineItem-root:before`]: {
                  flex: 0,
                  padding: 0,
                }
              }}>
                {activityTimeline.map((item) => (
                  <TimelineItem key={item.id}>
                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: item.color }}>
                        {item.icon}
                      </TimelineDot>
                      {item.id !== activityTimeline.length && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.date}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  sx={{ 
                    borderRadius: 8, 
                    px: 2,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.05)' }
                  }}
                >
                  View All Activity
                </Button>
              </Box>
            </Paper>
          </Zoom>
        </Grid>
        
        {/* Featured Project */}
        <Grid item xs={12} md={6} lg={5}>
          <Zoom in={animate} style={{ transitionDelay: animate ? '700ms' : '0ms' }}>
            <Paper elevation={3} sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              height: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <Box sx={{ 
                height: 160, 
                bgcolor: 'primary.main', 
                position: 'relative',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%',
                  opacity: 0.1,
                  background: 'url(https://source.unsplash.com/random?tech,code) center/cover no-repeat'
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  width: '100%', 
                  p: 3, 
                  color: 'white',
                  zIndex: 2
                }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>
                    FEATURED PROJECT
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    React Admin Dashboard Pro
                  </Typography>
                </Box>
                <Chip 
                  label="Premium" 
                  color="secondary" 
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    fontWeight: 'bold',
                    zIndex: 2
                  }} 
                />
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  A complete solution for building beautiful, responsive admin dashboards with advanced features.
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completion
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">75%</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                  <Chip label="React" size="small" />
                  <Chip label="TypeScript" size="small" />
                  <Chip label="MUI" size="small" />
                </Stack>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ 
                      borderRadius: 8, 
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    View Project
                  </Button>
                  
                  <IconButton color="primary">
                    <Favorite />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Grid>
        
        {/* Quote of the Day */}
        <Grid item xs={12} md={12} lg={3}>
          <Zoom in={animate} style={{ transitionDelay: animate ? '800ms' : '0ms' }}>
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: theme.palette.background.paper,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <FormatQuote sx={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                fontSize: 40, 
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
              }} />
              
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, mt: 2, fontStyle: 'italic', textAlign: 'center' }}>
                "The best way to predict the future is to create it."
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                — Peter Drucker
              </Typography>
              
              <Box sx={{ 
                mt: 3, 
                textAlign: 'center', 
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Button 
                  variant="text" 
                  color="primary" 
                  endIcon={<Autorenew />}
                  sx={{ textTransform: 'none' }}
                >
                  New Quote
                </Button>
              </Box>
            </Paper>
          </Zoom>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
