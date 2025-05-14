import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Introduction
          </Typography>
          <Typography paragraph>
            Welcome to Project Store. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. The Data We Collect
          </Typography>
          <Typography paragraph>
            We may collect, use, store and transfer different kinds of personal data about you including:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Identity Data: includes first name, last name, username</li>
            <li>Contact Data: includes email address and telephone numbers</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting</li>
            <li>Usage Data: includes information about how you use our website and services</li>
            <li>Transaction Data: includes details about payments to and from you and other details of products you have purchased</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. How We Use Your Data
          </Typography>
          <Typography paragraph>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>To register you as a new customer</li>
            <li>To process and deliver your order</li>
            <li>To manage our relationship with you</li>
            <li>To improve our website, products/services, and customer relationships</li>
            <li>To recommend products that may be of interest to you</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Data Security
          </Typography>
          <Typography paragraph>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, 
            or accessed in an unauthorized way. We limit access to your personal data to those employees, agents, contractors, 
            and other third parties who have a business need to know.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Your Legal Rights
          </Typography>
          <Typography paragraph>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>The right to request access to your personal data</li>
            <li>The right to request correction of your personal data</li>
            <li>The right to request erasure of your personal data</li>
            <li>The right to object to processing of your personal data</li>
            <li>The right to request restriction of processing your personal data</li>
            <li>The right to data portability</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Contact Us
          </Typography>
          <Typography paragraph>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </Typography>
          <Typography paragraph>
            Email: privacy@projectstore.com<br />
            Project Store<br />
            123 Developer Lane<br />
            Tech City, TC 12345
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;
