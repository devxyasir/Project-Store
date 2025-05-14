import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const CookiePolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Cookie Policy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. What Are Cookies
          </Typography>
          <Typography paragraph>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work more efficiently and provide information to the website owners.
          </Typography>
          <Typography paragraph>
            We use cookies to enhance your browsing experience, analyze site traffic, personalize content, and serve targeted advertisements.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Types of Cookies We Use
          </Typography>
          <Typography paragraph>
            Our website uses the following types of cookies:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access.</li>
            <li><strong>Performance Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website.</li>
            <li><strong>Functionality Cookies:</strong> These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
            <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Managing Cookies
          </Typography>
          <Typography paragraph>
            Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may impact your overall user experience. Below are links to instructions for managing cookies in common web browsers:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Google Chrome: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Manage cookies</a></li>
            <li>Mozilla Firefox: <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Enable and disable cookies</a></li>
            <li>Safari: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Manage cookies</a></li>
            <li>Microsoft Edge: <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">View and delete cookies</a></li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Third-Party Cookies
          </Typography>
          <Typography paragraph>
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so on. These cookies may include:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Analytics cookies (Google Analytics)</li>
            <li>Social media cookies (Facebook, Twitter, LinkedIn)</li>
            <li>Payment processor cookies</li>
            <li>Marketing and advertising cookies</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Your Consent
          </Typography>
          <Typography paragraph>
            When you first visit our website, you will be presented with a cookie banner requesting your consent to set cookies. By clicking "Accept All Cookies," you consent to our use of cookies as described in this policy. 
          </Typography>
          <Typography paragraph>
            You can change your cookie preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Contact Us
          </Typography>
          <Typography paragraph>
            If you have any questions about our Cookie Policy, please contact us at:
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

export default CookiePolicyPage;
