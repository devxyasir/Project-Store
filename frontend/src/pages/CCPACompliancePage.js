import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const CCPACompliancePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          CCPA Compliance
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
            This California Consumer Privacy Act (CCPA) Compliance Statement explains how Project Store complies with the CCPA and outlines the rights of California residents regarding their personal information.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Applicability
          </Typography>
          <Typography paragraph>
            The CCPA applies to businesses that collect personal information from California residents and meet certain criteria. Although Project Store may not be directly subject to the CCPA, we respect the privacy rights of all our users, including California residents, and have adopted practices aligned with the CCPA's principles.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Categories of Personal Information We Collect
          </Typography>
          <Typography paragraph>
            In the past 12 months, we have collected the following categories of personal information:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Identifiers:</strong> Name, email address, IP address, account username</li>
            <li><strong>Commercial Information:</strong> Products purchased, transaction history</li>
            <li><strong>Internet Activity:</strong> Browsing history, search history, interactions with our website</li>
            <li><strong>Geolocation Data:</strong> General location based on IP address</li>
            <li><strong>Professional Information:</strong> Professional skills, development expertise (if provided)</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Sources of Personal Information
          </Typography>
          <Typography paragraph>
            We collect personal information from the following sources:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Directly from you when you register an account, make a purchase, or contact us</li>
            <li>Automatically through cookies and similar technologies when you use our website</li>
            <li>Third-party service providers, such as payment processors</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. How We Use Personal Information
          </Typography>
          <Typography paragraph>
            We use the personal information we collect for the following business purposes:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>To provide and maintain our services</li>
            <li>To process and fulfill your purchases</li>
            <li>To personalize your experience and deliver relevant content</li>
            <li>To improve our website and develop new features</li>
            <li>To communicate with you about your account, purchases, and updates</li>
            <li>To detect and prevent fraudulent activities</li>
            <li>To comply with legal obligations</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Disclosure of Personal Information
          </Typography>
          <Typography paragraph>
            In the past 12 months, we have disclosed personal information to the following categories of third parties:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Service Providers:</strong> Payment processors, cloud storage providers, email service providers, analytics providers</li>
            <li><strong>Third Parties for Legal Purposes:</strong> Law enforcement or other parties when required by law or to protect our rights</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            We do not sell personal information as defined under the CCPA.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Your Rights Under CCPA
          </Typography>
          <Typography paragraph>
            If you are a California resident, you have the following rights:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Right to Know:</strong> You have the right to request information about the personal information we collect, use, disclose, and sell.</li>
            <li><strong>Right to Delete:</strong> You have the right to request deletion of personal information we have collected about you, subject to certain exceptions.</li>
            <li><strong>Right to Opt-Out:</strong> You have the right to opt-out of the sale of your personal information (although we do not currently sell personal information).</li>
            <li><strong>Right to Non-Discrimination:</strong> You have the right not to be discriminated against for exercising your CCPA rights.</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            8. How to Exercise Your Rights
          </Typography>
          <Typography paragraph>
            To exercise your rights under the CCPA, you can submit a request by:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Emailing us at privacy@projectstore.com</li>
            <li>Using the "Privacy Request" form in your account settings</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            We will respond to verifiable consumer requests within 45 days. We may request additional information to verify your identity before fulfilling your request.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            9. Contact Information
          </Typography>
          <Typography paragraph>
            If you have any questions or concerns about our CCPA Compliance or privacy practices, please contact us at:
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

export default CCPACompliancePage;
