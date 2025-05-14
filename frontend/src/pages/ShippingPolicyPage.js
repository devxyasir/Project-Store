import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const ShippingPolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Shipping Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Digital Products Delivery
          </Typography>
          <Typography paragraph>
            As Project Store primarily offers digital products, the majority of our deliveries occur through electronic means.
            Upon successful payment verification, you will receive immediate access to download your purchased digital products
            from your account dashboard.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Delivery Timeline
          </Typography>
          <Typography paragraph>
            For digital products:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Instant access is provided following successful payment verification</li>
            <li>In case of payment verification delays, delivery may take up to 24 hours</li>
            <li>You will receive an email notification with access instructions upon successful delivery</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            For any physical merchandise or supplementary materials (if applicable):
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Domestic shipping: 3-5 business days</li>
            <li>International shipping: 7-14 business days</li>
            <li>Expedited shipping options may be available at checkout for an additional fee</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Download Access
          </Typography>
          <Typography paragraph>
            All purchased digital products remain available in your account for download for a period of at least 12 months from the date of purchase.
            We recommend downloading and backing up your purchases promptly.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Technical Support
          </Typography>
          <Typography paragraph>
            If you encounter any issues accessing or downloading your purchased products, our technical support team is available
            to assist you via email at support@projectstore.com. We strive to respond to all support requests within 24 hours.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. International Customers
          </Typography>
          <Typography paragraph>
            For international customers downloading digital products, please be aware that download speeds may vary based on your 
            internet connection and local network conditions. We optimize our delivery servers for global access, but some regional 
            variations in download performance may occur.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Contact Information
          </Typography>
          <Typography paragraph>
            For any shipping or delivery related inquiries, please contact us at:
          </Typography>
          <Typography paragraph>
            Email: support@projectstore.com<br />
            Project Store<br />
            123 Developer Lane<br />
            Tech City, TC 12345
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShippingPolicyPage;
