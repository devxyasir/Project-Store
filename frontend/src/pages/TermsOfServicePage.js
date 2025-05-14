import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const TermsOfServicePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing and using Project Store, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to abide by these terms, please do not use this service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Use License
          </Typography>
          <Typography paragraph>
            Upon purchasing a project from Project Store, we grant you a limited, non-exclusive, non-transferable license to use 
            the purchased project for personal or commercial purposes in accordance with the specific license terms provided with each project.
          </Typography>
          <Typography paragraph>
            You may not:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Modify or copy the materials except as specifically allowed in the project license</li>
            <li>Use the materials for any commercial purpose beyond the scope of the provided license</li>
            <li>Attempt to decompile or reverse engineer any software contained in the purchased projects</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or 'mirror' the materials on any other server</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Payment and Billing
          </Typography>
          <Typography paragraph>
            All payments made through our platform are processed securely. By making a purchase, you agree to provide current, complete, 
            and accurate purchase and account information. We reserve the right to refuse or cancel your order if fraud or unauthorized 
            or illegal transaction is suspected.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Refund Policy
          </Typography>
          <Typography paragraph>
            Our refund policy is detailed in our separate Refund Policy document. Please refer to it for complete information 
            on eligibility and the refund process.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. User Accounts
          </Typography>
          <Typography paragraph>
            If you create an account on our website, you are responsible for maintaining the security of your account and you 
            are fully responsible for all activities that occur under the account. You must immediately notify us of any unauthorized 
            uses of your account or any other breaches of security.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Intellectual Property
          </Typography>
          <Typography paragraph>
            The Service and its original content, features, and functionality are and will remain the exclusive property of 
            Project Store and its licensors. The Service is protected by copyright, trademark, and other laws of both the 
            Pakistan and foreign countries.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Termination
          </Typography>
          <Typography paragraph>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
            including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            8. Governing Law
          </Typography>
          <Typography paragraph>
            These Terms shall be governed by the laws of Pakistan without regard to its conflict of law provisions.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            9. Changes to Terms
          </Typography>
          <Typography paragraph>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access 
            or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            10. Contact Us
          </Typography>
          <Typography paragraph>
            If you have any questions about these Terms, please contact us at:
          </Typography>
          <Typography paragraph>
            Email: legal@projectstore.com<br />
            Project Store<br />
            123 Developer Lane<br />
            Tech City, TC 12345
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;
