import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Snackbar,
  Fade,
  IconButton,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  GitHub,
  LinkedIn,
  Twitter,
  Facebook,
} from '@mui/icons-material';
import axios from 'axios';

const ContactPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/contact', formData);
      
      setSuccess(true);
      setSnackbarOpen(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Something went wrong. Please try again.';
      setError(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box textAlign="center" mb={6}>
            <Typography
              variant="overline"
              component="p"
              color="primary"
              sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 1.5 }}
            >
              GET IN TOUCH
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.2rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Contact Us
            </Typography>
            <Typography 
              variant="h6" 
              color="textSecondary" 
              paragraph
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                mb: 6 
              }}
            >
              Have a question or feedback about our projects? We'd love to hear from you.
              Our team is always ready to help and respond to your inquiries.
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Paper
                elevation={4}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 3,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  Send Us a Message
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Fill out the form below and we'll get back to you as soon as possible.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        multiline
                        rows={6}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: 8,
                          fontWeight: 600,
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 12px 25px rgba(0,0,0,0.2)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Fade>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={3} direction="column" height="100%">
              <Grid item>
                <Fade in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />

                    <Box sx={{ mt: 3 }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <Email sx={{ mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>Email</Typography>
                          <Typography variant="body1">info@projectstore.com</Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={3}>
                        <Phone sx={{ mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>Phone</Typography>
                          <Typography variant="body1">+1 (123) 456-7890</Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>Address</Typography>
                          <Typography variant="body1">123 Developer Street, Tech City, 10101</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item flexGrow={1}>
                <Fade in={true} timeout={1000} style={{ transitionDelay: '600ms' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Connect With Us
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Follow us on social media for updates on new projects and promotions.
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-around',
                        mt: 'auto', 
                        pt: 3 
                      }}
                    >
                      {[
                        { icon: <GitHub />, label: 'GitHub' },
                        { icon: <LinkedIn />, label: 'LinkedIn' },
                        { icon: <Twitter />, label: 'Twitter' },
                        { icon: <Facebook />, label: 'Facebook' },
                      ].map((social, index) => (
                        <IconButton
                          key={index}
                          color="primary"
                          aria-label={social.label}
                          sx={{
                            width: 50,
                            height: 50,
                            bgcolor: `${theme.palette.primary.main}15`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              bgcolor: `${theme.palette.primary.main}25`,
                            },
                          }}
                        >
                          {social.icon}
                        </IconButton>
                      ))}
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Map Section */}
        <Fade in={true} timeout={1000} style={{ transitionDelay: '800ms' }}>
          <Paper
            elevation={4}
            sx={{
              mt: 6,
              p: 0,
              borderRadius: 3,
              overflow: 'hidden',
              height: 400,
              position: 'relative',
            }}
          >
            <Box
              component="iframe"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423283.43556031643!2d-118.69192993092697!3d34.02073050801508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1625844763143!5m2!1sen!2s"
              style={{
                border: 0,
                width: '100%',
                height: '100%',
              }}
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
            />
          </Paper>
        </Fade>
      </Container>
      
      {/* Success/Error Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {success 
            ? "Your message has been sent successfully. We'll get back to you soon!" 
            : error
          }
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
