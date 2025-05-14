import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const RefundPolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Refund Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Refund Eligibility
          </Typography>
          <Typography paragraph>
            We understand that issues may arise, and we are committed to resolving them fairly. Refunds may be considered under the following circumstances:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>The digital product is significantly different from its description</li>
            <li>The product contains critical technical issues that prevent its proper functioning</li>
            <li>You have not downloaded or accessed the digital content</li>
            <li>You have not received the product after payment verification</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            Refund requests must be submitted within 7 days of purchase to be considered.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Non-Refundable Scenarios
          </Typography>
          <Typography paragraph>
            Refunds will generally not be issued in the following situations:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>The project does not meet your specific requirements, but functions as described</li>
            <li>You have already downloaded or extensively accessed the digital content</li>
            <li>You no longer need the product after purchasing it</li>
            <li>You purchased the product by mistake</li>
            <li>You are unable to implement the project due to lack of technical skills</li>
            <li>Your refund request is submitted after the 7-day period</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Refund Process
          </Typography>
          <Typography paragraph>
            To request a refund, please follow these steps:
          </Typography>
          <Typography component="ol" sx={{ pl: 4 }}>
            <li>Log into your Project Store account</li>
            <li>Navigate to "Purchases" in your dashboard</li>
            <li>Locate the specific product and click "Request Refund"</li>
            <li>Complete the refund request form, providing detailed reasons for your request</li>
            <li>Submit your request and await our response</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            Our team will review your request within 3 business days. If approved, the refund will be processed through your original payment method within 5-10 business days.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Partial Refunds
          </Typography>
          <Typography paragraph>
            In some cases, we may offer partial refunds if the issues with the product are minor or if you have already derived value from part of the product.
            The partial refund amount will be determined based on the specific circumstances of each case.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Technical Support Before Refund
          </Typography>
          <Typography paragraph>
            Before requesting a refund for technical issues, we encourage you to contact our support team for assistance.
            Many technical problems can be resolved with proper guidance, eliminating the need for a refund.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Contact Information
          </Typography>
          <Typography paragraph>
            If you have any questions about our refund policy, please contact us at:
          </Typography>
          <Typography paragraph>
            Email: refunds@projectstore.com<br />
            Project Store<br />
            123 Developer Lane<br />
            Tech City, TC 12345
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RefundPolicyPage;
