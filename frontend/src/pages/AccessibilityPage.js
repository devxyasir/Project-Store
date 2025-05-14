import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const AccessibilityPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Accessibility Statement
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Our Commitment
          </Typography>
          <Typography paragraph>
            Project Store is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards to make our website more accessible and user-friendly for all.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Accessibility Standards
          </Typography>
          <Typography paragraph>
            We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
          </Typography>
          <Typography paragraph>
            The guidelines have three levels of accessibility (A, AA, and AAA). We've chosen Level AA as our target because it strikes a good balance between maximum accessibility and practical implementation.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Accessibility Features
          </Typography>
          <Typography paragraph>
            We have implemented the following accessibility features on our website:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Text Alternatives:</strong> We provide text alternatives for non-text content.</li>
            <li><strong>Keyboard Navigation:</strong> Our website can be navigated using a keyboard.</li>
            <li><strong>Clear Structure:</strong> We use proper headings and landmarks to help users navigate our content.</li>
            <li><strong>Readable Text:</strong> We maintain sufficient color contrast for text and provide options to resize text.</li>
            <li><strong>Predictable Navigation:</strong> We maintain consistent navigation and functionality throughout the website.</li>
            <li><strong>Input Assistance:</strong> We provide clear labels and error messages for forms.</li>
            <li><strong>Compatible Technology:</strong> We ensure our website is compatible with current assistive technologies.</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Assistive Technologies
          </Typography>
          <Typography paragraph>
            Our website is designed to be compatible with the following assistive technologies:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Screen readers (including JAWS, NVDA, VoiceOver, and TalkBack)</li>
            <li>Screen magnification software</li>
            <li>Speech recognition software</li>
            <li>Keyboard-only navigation</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Accessibility Limitations
          </Typography>
          <Typography paragraph>
            Despite our efforts to ensure accessibility, there may be some limitations. The following are known accessibility issues that we're working to resolve:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Some older content may not yet be fully accessible</li>
            <li>Some third-party content or functionality may not be fully accessible</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            We are continuously working to address these limitations and improve the accessibility of our website.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Feedback and Contact Information
          </Typography>
          <Typography paragraph>
            We welcome your feedback on the accessibility of our website. Please let us know if you encounter any accessibility barriers:
          </Typography>
          <Typography paragraph>
            Email: accessibility@projectstore.com<br />
            Project Store<br />
            123 Developer Lane<br />
            Tech City, TC 12345
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Continuous Improvement
          </Typography>
          <Typography paragraph>
            We are committed to ongoing accessibility improvements. We regularly review our website and content to identify and address accessibility issues, conduct periodic accessibility audits, and provide accessibility training to our staff.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccessibilityPage;
