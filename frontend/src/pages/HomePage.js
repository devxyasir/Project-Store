import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Container,
  Paper,
  useTheme,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  Slide,
  Fade,
  Zoom,
  useMediaQuery,
  Avatar,
  Rating,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { 
  ShoppingCart, 
  Code, 
  Search, 
  Devices, 
  KeyboardArrowDown,
  Security,
  Speed,
  MobileFriendly,
  CheckCircle,
  ArrowForward,
  Download,
  FormatQuote,
  Star,
  Lock,
  GitHub,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get('/api/products?featured=true&limit=4');
        if (res.data.success) {
          setFeaturedProducts(res.data.products);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          color: 'white',
          mb: 4,
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          pt: { xs: 8, md: 10 },
          pb: { xs: 12, md: 16 },
        }}
      >
        {/* Animated Shapes */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.1,
          zIndex: 1,
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: '10%', 
            left: '5%', 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#fff',
            borderRadius: '50%',
            animation: 'pulse 8s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.7 },
              '50%': { transform: 'scale(1.5)', opacity: 0.4 },
              '100%': { transform: 'scale(1)', opacity: 0.7 },
            }
          }} />
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '20%', 
            width: '35px', 
            height: '35px', 
            backgroundColor: '#fff',
            borderRadius: '50%',
            animation: 'pulse 12s infinite',
            animationDelay: '2s'
          }} />
          <Box sx={{ 
            position: 'absolute', 
            top: '20%', 
            right: '15%', 
            width: '25px', 
            height: '25px', 
            backgroundColor: '#fff',
            borderRadius: '50%',
            animation: 'pulse 10s infinite',
            animationDelay: '1s'
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: '20%', 
            right: '30%', 
            width: '15px', 
            height: '15px', 
            backgroundColor: '#fff',
            borderRadius: '50%',
            animation: 'pulse 6s infinite',
            animationDelay: '3s'
          }} />
          
          {/* Connecting lines */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
            transform: 'rotate(20deg) scale(2)',
            opacity: 0.4
          }} />
        </Box>

        {/* Wave effect at bottom */}
        <Box sx={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          width: '100%',
          height: '120px',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'1\' d=\'M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 2
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={animate} timeout={800}>
                <Box>
                  <Chip 
                    label="INTRODUCING DEVSECURE" 
                    color="secondary" 
                    size="small" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 'bold',
                      '& .MuiChip-label': { px: 2 }
                    }} 
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' },
                      fontWeight: 800,
                      mb: 2,
                      background: 'linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.5px',
                      lineHeight: 1.1,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: 0,
                        width: 100,
                        height: 4,
                        background: theme.palette.secondary.main,
                        borderRadius: 2
                      }
                    }}
                  >
                    Supercharge Your Development Projects
                  </Typography>

                  <Fade in={animate} timeout={1200} style={{ transitionDelay: animate ? '400ms' : '0ms' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 4,
                        maxWidth: 550,
                        lineHeight: 1.6
                      }}
                    >
                      Access a curated collection of premium-quality code projects built by expert developers using cutting-edge technologies. Launch your next big idea faster than ever before.
                    </Typography>
                  </Fade>

                  <Fade in={animate} timeout={1200} style={{ transitionDelay: animate ? '600ms' : '0ms' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                      <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/shop"
                        sx={{ 
                          py: 1.5,
                          px: 3.5,
                          borderRadius: '50px',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #f12711, #f5af19)',
                          boxShadow: '0 4px 15px rgba(241, 39, 17, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 25px rgba(241, 39, 17, 0.4)',
                          }
                        }}
                        endIcon={<Search />}
                      >
                        Explore Projects
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        sx={{ 
                          py: 1.5,
                          px: 3.5,
                          borderRadius: '50px',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          borderWidth: 2,
                          color: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-3px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                        endIcon={<ArrowForward />}
                      >
                        {isAuthenticated ? 'My Dashboard' : 'Get Started'}
                      </Button>
                    </Stack>
                  </Fade>

                  <Fade in={animate} timeout={1200} style={{ transitionDelay: animate ? '800ms' : '0ms' }}>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Stack direction="row" spacing={-1}>
                        {[1, 2, 3, 4].map((item) => (
                          <Avatar 
                            key={item}
                            src={`https://i.pravatar.cc/150?img=${item+20}`} 
                            sx={{ 
                              border: '2px solid white',
                              width: 32, 
                              height: 32,
                            }} 
                          />
                        ))}
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        <strong>1,000+ developers</strong> use our projects
                      </Typography>
                      
                      <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mx: 2 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          <strong>4.9/5</strong> average rating
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                </Box>
              </Slide>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Zoom in={animate} style={{ transitionDelay: animate ? '200ms' : '0ms' }}>
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 300, md: 400 },
                  display: { xs: 'none', md: 'block' },
                }}>
                  {/* Code window mockup */}
                  <Paper sx={{
                    position: 'absolute',
                    width: '80%',
                    height: '70%',
                    top: '15%',
                    left: '10%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#212121',
                    zIndex: 2,
                  }}>
                    <Box sx={{ 
                      height: '30px', 
                      bgcolor: '#212121', 
                      borderBottom: '1px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                      px: 2
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1 
                      }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          ml: 2, 
                          fontSize: '0.7rem' 
                        }}
                      >
                        project-store-dashboard.js
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.8rem', color: '#e0e0e0' }}>
                      <Box component="span" sx={{ color: '#c792ea' }}>import</Box>
                      <Box component="span" sx={{ color: '#ffffff' }}> React </Box>
                      <Box component="span" sx={{ color: '#c792ea' }}>from</Box>
                      <Box component="span" sx={{ color: '#c3e88d' }}> 'react'</Box>
                      <Box component="span" sx={{ color: '#ffffff' }}>;</Box>
                      <br/>
                      
                      <Box component="span" sx={{ color: '#c792ea' }}>const</Box>
                      <Box component="span" sx={{ color: '#82aaff' }}> Dashboard </Box>
                      <Box component="span" sx={{ color: '#89ddff' }}>=</Box>
                      <Box component="span" sx={{ color: '#c792ea' }}> () </Box>
                      <Box component="span" sx={{ color: '#89ddff' }}>=</Box>
                      <Box component="span" sx={{ color: '#ffffff' }}>{'{'}</Box>
                      <br/>
                      
                      <Box component="span" sx={{ ml: 2, color: '#c792ea' }}>return</Box>
                      <Box component="span" sx={{ color: '#ffffff' }}> </Box>
                      <br/>
                      
                      <Box component="span" sx={{ ml: 4, color: '#89ddff' }}>{'<'}</Box>
                      <Box component="span" sx={{ color: '#f07178' }}>div</Box>
                      <Box component="span" sx={{ color: '#89ddff' }}>{' className="dashboard">'}</Box>
                      <br/>
                      
                      <Box component="span" sx={{ ml: 6, color: '#89ddff' }}>{'<'}</Box>
                      <Box component="span" sx={{ color: '#f07178' }}>h1</Box>
                      <Box component="span" sx={{ color: '#89ddff' }}>{'>'}</Box>
                      <Box component="span" sx={{ color: '#ffffff' }}>Project Store Dashboard</Box>
                      <Box component="span" sx={{ color: '#89ddff' }}>{'</h1>'}</Box>
                      <br/>
                    </Box>
                  </Paper>
                  
                  {/* Decorative elements */}
                  <Paper sx={{
                    position: 'absolute',
                    width: '40%',
                    height: '40%',
                    top: 0,
                    right: 0,
                    borderRadius: 2,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    background: theme.palette.primary.main,
                    transform: 'rotate(15deg)',
                    zIndex: 1,
                    opacity: 0.8
                  }} />
                  
                  <Paper sx={{
                    position: 'absolute',
                    width: '30%',
                    height: '30%',
                    bottom: 0,
                    left: 0,
                    borderRadius: 2,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    background: theme.palette.secondary.main,
                    transform: 'rotate(-10deg)',
                    zIndex: 1,
                    opacity: 0.8
                  }} />
                </Box>
              </Zoom>
            </Grid>
          </Grid>
          
          {/* Trust factors */}
          <Fade in={animate} timeout={1000} style={{ transitionDelay: animate ? '1000ms' : '0ms' }}>
            <Box sx={{ 
              mt: { xs: 0, md: 8 }, 
              mb: 4, 
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 3, md: 5 },
              position: 'relative',
              zIndex: 5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: theme.palette.secondary.light }} />
                <Typography variant="body2" color="white">Premium Quality</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ color: theme.palette.secondary.light }} />
                <Typography variant="body2" color="white">Secure Code</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ color: theme.palette.secondary.light }} />
                <Typography variant="body2" color="white">High Performance</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MobileFriendly sx={{ color: theme.palette.secondary.light }} />
                <Typography variant="body2" color="white">Responsive Design</Typography>
              </Box>
            </Box>
          </Fade>
          
          {/* Scroll down indicator */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            position: 'relative', 
            zIndex: 5,
            mt: { xs: 0, md: 4 },
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
              '40%': { transform: 'translateY(-20px)' },
              '60%': { transform: 'translateY(-10px)' }
            },
            opacity: 0.7,
          }}>
            <IconButton sx={{ color: 'white' }}>
              <KeyboardArrowDown />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        position: 'relative',
        borderBottom: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}>
        {/* Decorative shapes */}
        <Box component="span" sx={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light}22 0%, transparent 70%)`,
          zIndex: 0,
        }} />
        <Box component="span" sx={{
          position: 'absolute',
          bottom: 60,
          right: 60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.light}22 0%, transparent 70%)`,
          zIndex: 0,
        }} />

        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={animate} timeout={1000}>
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Typography
                variant="overline"
                component="p"
                color="primary"
                sx={{ 
                  mb: 2, 
                  fontWeight: 'bold', 
                  letterSpacing: 1.5,
                  display: 'inline-block', 
                }}
              >
                WHY DEVELOPERS TRUST US
              </Typography>
              <Typography
                component="h2"
                variant="h2"
                align="center"
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.text.secondary} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.2rem', md: '3rem' }
                }}
              >
                Why Choose Project Store?
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                paragraph
                sx={{ 
                  mb: 6, 
                  maxWidth: '800px', 
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                We offer a curated collection of high-quality programming projects
                built by experienced developers using the latest technologies.
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {[
              {
                icon: <Code />,
                title: "Quality Code",
                description: "Well-documented, clean, and maintainable code that follows best practices and industry standards.",
                color: theme.palette.primary.main,
                delay: 200
              },
              {
                icon: <Security />,
                title: "Secure Implementation",
                description: "All projects follow security best practices with secure payment verification and data protection.",
                color: theme.palette.secondary.main,
                delay: 400
              },
              {
                icon: <Devices />,
                title: "Modern Technologies",
                description: "Projects built with the latest frameworks and libraries, thoroughly tested and ready for production.",
                color: theme.palette.info.main,
                delay: 600
              },
              {
                icon: <ShoppingCart />,
                title: "Instant Access",
                description: "Purchase and download instantly with our secure payment verification system. Get started right away.",
                color: theme.palette.success.main,
                delay: 800
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in={animate} style={{ transitionDelay: animate ? `${feature.delay}ms` : '0ms' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderRadius: 4,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: feature.color,
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${feature.color}15`,
                        color: feature.color,
                        width: 70,
                        height: 70,
                        mb: 3,
                        boxShadow: `0 5px 15px ${feature.color}30`,
                      }}
                    >
                      {React.cloneElement(feature.icon, { fontSize: 'large' })}
                    </Avatar>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="textSecondary" sx={{ flex: 1 }}>
                      {feature.description}
                    </Typography>
                    <Button 
                      variant="text" 
                      sx={{ 
                        mt: 2, 
                        color: feature.color,
                        '&:hover': { backgroundColor: `${feature.color}10` } 
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Learn more
                    </Button>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'white' }}>
        <Container>
          <Fade in={animate} timeout={1000}>
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Typography
                variant="overline"
                component="p"
                color="secondary"
                sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 1.5 }}
              >
                SIMPLE PROCESS
              </Typography>
              <Typography
                component="h2"
                variant="h2"
                align="center"
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  fontSize: { xs: '2.2rem', md: '3rem' }
                }}
              >
                How It Works
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                paragraph
                sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
              >
                Get up and running with high-quality projects in just minutes
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={animate} timeout={1000}>
                <Box>
                  <Timeline position="alternate" sx={{ 
                    [`& .MuiTimelineItem-root:before`]: {
                      flex: 0,
                      padding: 0,
                    }
                  }}>
                    {[
                      { 
                        title: "Browse Projects", 
                        description: "Explore our curated collection of high-quality projects",
                        icon: <Search />,
                        color: theme.palette.primary.main
                      },
                      { 
                        title: "Purchase Securely", 
                        description: "Use our secure payment verification system",
                        icon: <ShoppingCart />,
                        color: theme.palette.secondary.main
                      },
                      { 
                        title: "Verify Payment", 
                        description: "Automated verification of your transaction",
                        icon: <CheckCircle />,
                        color: theme.palette.success.main
                      },
                      { 
                        title: "Download & Use", 
                        description: "Get instant access to your project files",
                        icon: <Download />,
                        color: theme.palette.info.main
                      }
                    ].map((step, index) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot sx={{ bgcolor: step.color }}>
                            {step.icon}
                          </TimelineDot>
                          {index < 3 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Paper elevation={2} sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            borderLeft: `4px solid ${step.color}`,
                            mb: 2,
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-4px)' }
                          }}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                              {step.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {step.description}
                            </Typography>
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Box>
              </Slide>
            </Grid>

            <Grid item xs={12} md={6}>
              <Zoom in={animate} timeout={1000} style={{ transitionDelay: animate ? '300ms' : '0ms' }}>
                <Box sx={{ 
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 20px 80px rgba(0, 0, 0, 0.12)',
                }}>
                  <Box
                    component="img"
                    src="https://media.istockphoto.com/id/1466262366/photo/software-development-branching-strategy-process-workflow-with-flowchart-diagram-showing.jpg?s=612x612&w=0&k=20&c=U3BQoK-xdLwhPKLdt8XxTfmTejJvcuGUzfDdACYiJN8="
                    alt="Development process"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: 4,
                    }}
                  />
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    borderRadius: '0 0 16px 16px',
                  }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      Start Building Today
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      sx={{ 
                        mt: 2,
                        borderRadius: 8,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(233, 30, 99, 0.4)',
                      }}
                      endIcon={<ArrowForward />}
                      component={RouterLink}
                      to="/shop"
                    >
                      Browse Projects
                    </Button>
                  </Box>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        background: `linear-gradient(180deg, #ffffff 0%, ${theme.palette.grey[50]} 100%)`,
        position: 'relative',
      }}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(63, 81, 181, 0.05) 0%, rgba(63, 81, 181, 0) 70%)',
          zIndex: 1,
        }} />

        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in={animate} timeout={1000}>
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Typography
                variant="overline"
                component="p"
                color="primary"
                sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 1.5 }}
              >
                HANDPICKED FOR YOU
              </Typography>
              <Typography
                component="h2"
                variant="h2"
                align="center"
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  fontSize: { xs: '2.2rem', md: '3rem' }
                }}
              >
                Featured Projects
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                paragraph
                sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
              >
                Check out our most popular programming projects complete with secure payment verification
              </Typography>
            </Box>
          </Fade>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="body1" color="textSecondary" sx={{ mt: 3 }}>
                Loading featured projects...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <Grid item key={product._id} xs={12} sm={6} md={3}>
                    <Zoom in={animate} style={{ transitionDelay: animate ? `${300 + (index * 150)}ms` : '0ms' }}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                          },
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            image={product.images?.[0] || 'https://source.unsplash.com/random?code'}
                            alt={product.title}
                            sx={{
                              height: 220,
                              objectFit: 'cover',
                            }}
                          />
                          <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 2,
                          }}>
                            <Chip 
                              label="Featured" 
                              color="secondary" 
                              size="small" 
                              sx={{ 
                                fontWeight: 'bold', 
                                boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                              }} 
                            />
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                            {product.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph sx={{ mb: 3 }}>
                            {product.shortDescription}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1, 
                            mb: 1,
                            mt: 2
                          }}>
                            {product.technologies?.slice(0, 3).map((tech, index) => (
                              <Chip
                                key={index}
                                label={tech}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  borderRadius: '50px',
                                }}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                            {product.technologies?.length > 3 && (
                              <Chip
                                label={`+${product.technologies.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: '50px' }}
                              />
                            )}
                          </Box>
                        </CardContent>
                        
                        <Divider />
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 2, 
                          bgcolor: theme.palette.grey[50]
                        }}>
                          <Button
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to={`/product/${product.slug}`}
                            sx={{ 
                              borderRadius: 8, 
                              px: 2,
                              fontWeight: 600,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                            endIcon={<ArrowForward />}
                          >
                            View Details
                          </Button>
                          <Typography
                            variant="h5"
                            sx={{ 
                              fontWeight: 800,
                              color: theme.palette.text.primary,
                            }}
                          >
                            ${product.price}
                          </Typography>
                        </Box>
                      </Card>
                    </Zoom>
                  </Grid>
                ))
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  width: '100%', 
                  py: 8,
                  px: 4,
                  bgcolor: 'rgba(0,0,0,0.03)',
                  borderRadius: 2, 
                }}>
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
                    No featured projects available at the moment.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to="/shop"
                    endIcon={<ArrowForward />}
                  >
                    Browse All Projects
                  </Button>
                </Box>
              )}
            </Grid>
          )}

          {featuredProducts.length > 0 && (
            <Fade in={animate} timeout={1000} style={{ transitionDelay: animate ? '500ms' : '0ms' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to="/shop"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '50px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  endIcon={<ArrowForward />}
                >
                  View All Projects
                </Button>
              </Box>
            </Fade>
          )}
        </Container>
      </Box>
      
      {/* Call to Action Section */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          backgroundColor: 'rgba(25, 35, 67, 0.95)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://source.unsplash.com/random?dark,code,tech)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 1,
          },
        }}
      >
        {/* Decorative elements */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(79, 79, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
          zIndex: 2,
        }} />
        
        <Container sx={{ position: 'relative', zIndex: 3 }}>
          <Slide direction="up" in={animate} timeout={1000}>
            <Grid 
              container 
              spacing={6} 
              alignItems="center"
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.4)', 
                p: { xs: 3, md: 6 }, 
                borderRadius: 4,
                boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)' 
              }}
            >
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    background: 'linear-gradient(90deg, #ffffff, #e0e0e0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                  }}
                >
                  Ready to Start Building?
                </Typography>
                <Typography 
                  variant="h6" 
                  paragraph 
                  sx={{ 
                    mb: 4, 
                    opacity: 0.9,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                  }}
                >
                  Explore our collection of verified projects with secure payment processing and get instant access to premium code that will accelerate your next big idea.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '50px',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #ff512f, #f09819)',
                      boxShadow: '0 10px 30px rgba(255, 81, 47, 0.3)',
                      '&:hover': {
                        boxShadow: '0 15px 40px rgba(255, 81, 47, 0.4)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    component={RouterLink}
                    to="/shop"
                    endIcon={<ArrowForward />}
                  >
                    Explore Projects
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '50px',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      borderWidth: 2,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    component={RouterLink}
                    to="/register"
                  >
                    Sign Up Free
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 5 }}>
                  <CheckCircle sx={{ color: theme.palette.success.main, mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>Secure payment verification</Typography>
                  
                  <CheckCircle sx={{ color: theme.palette.success.main, ml: 3, mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>Instant access</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHTU02EgTazSRILHSLFH5a1iyVNlmvygQN5w&s"
                    alt="Developer workspace"
                    sx={{
                      width: '100%',
                      borderRadius: 3,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                      transition: 'all 0.5s ease',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                      },
                    }}
                  />
                  <Box sx={{ 
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    padding: '8px 16px',
                    borderRadius: '50px',
                    bgcolor: theme.palette.secondary.main,
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    zIndex: 1,
                    display: { xs: 'none', md: 'block' },
                  }}>
                    <Typography variant="body2" fontWeight="bold">Premium Quality</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Slide>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.background.default }}>
        <Container>
          <Fade in={animate} timeout={1000}>
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Typography
                variant="overline"
                component="p"
                color="primary"
                sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 1.5 }}
              >
                TRUSTED BY DEVELOPERS
              </Typography>
              <Typography
                component="h2"
                variant="h2"
                align="center"
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  fontSize: { xs: '2.2rem', md: '3rem' }
                }}
              >
                What Our Customers Say
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={4}>
            {[
              {
                name: "Sarah Johnson",
                role: "Frontend Developer",
                avatar: "https://i.pravatar.cc/150?img=5",
                quote: "The payment verification system works flawlessly. I was able to purchase and download my project in minutes!",
                delay: 200
              },
              {
                name: "Michael Chen",
                role: "Full Stack Developer",
                avatar: "https://i.pravatar.cc/150?img=8",
                quote: "I saved weeks of development time by using a project from this store. The code quality is exceptional.",
                delay: 400
              },
              {
                name: "Emily Rodriguez",
                role: "UI/UX Designer",
                avatar: "https://i.pravatar.cc/150?img=9",
                quote: "The transaction verification was quick and secure. I've been recommending Project Store to all my colleagues.",
                delay: 600
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={animate} style={{ transitionDelay: animate ? `${testimonial.delay}ms` : '0ms' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-8px)' },
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <FormatQuote sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      fontSize: 60,
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' 
                    }} />
                    
                    <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', zIndex: 1 }}>
                      "{testimonial.quote}"
                    </Typography>
                    
                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                      <Avatar src={testimonial.avatar} sx={{ width: 50, height: 50, mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Rating value={5} readOnly size="small" />
                      </Box>
                    </Box>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
