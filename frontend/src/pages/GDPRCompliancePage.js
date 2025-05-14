import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const GDPRCompliancePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          GDPR Compliance
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
            At Project Store, we are committed to protecting the privacy and rights of our customers and users. This GDPR Compliance statement outlines how we adhere to the General Data Protection Regulation (GDPR), which is a regulation in EU law on data protection and privacy for all individuals within the European Union.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Data Controller
          </Typography>
          <Typography paragraph>
            Project Store acts as a data controller for the personal data collected from our users. As a data controller, we determine the purposes and means of processing personal data.
          </Typography>
          <Typography paragraph>
            Our Data Protection Officer can be contacted at:
          </Typography>
          <Typography paragraph>
            Email: dpo@projectstore.com<br />
            Project Store<br />
            123 Developer Lane<br />
            Tech City, TC 12345
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Your Rights Under GDPR
          </Typography>
          <Typography paragraph>
            If you are an EU resident, you have the following rights regarding your personal data:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Right to Access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li><strong>Right to Object to Processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions.</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Lawful Basis for Processing
          </Typography>
          <Typography paragraph>
            We process personal data on the following lawful bases:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Consent:</strong> We collect and process data when you provide explicit consent.</li>
            <li><strong>Contract:</strong> We process your data to fulfill our contractual obligations when you purchase a product.</li>
            <li><strong>Legitimate Interests:</strong> We process data for our legitimate business interests, such as fraud prevention, marketing, and improving our services.</li>
            <li><strong>Legal Obligation:</strong> We may process your data to comply with legal requirements.</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Data Retention
          </Typography>
          <Typography paragraph>
            We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </Typography>
          <Typography paragraph>
            To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the data, the potential risk of harm from unauthorized use or disclosure, the purposes for which we process it, and whether we can achieve those purposes through other means.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. International Transfers
          </Typography>
          <Typography paragraph>
            Your data may be transferred to and processed in countries outside the European Economic Area (EEA). When we do so, we ensure appropriate safeguards are in place to protect your data, including:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Using Standard Contractual Clauses approved by the European Commission</li>
            <li>Processing in countries with an adequacy decision from the European Commission</li>
            <li>Implementing appropriate technical and organizational measures to ensure data security</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Data Breach Procedures
          </Typography>
          <Typography paragraph>
            In the event of a data breach that may pose a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach, where feasible. If the breach is likely to result in a high risk to your rights and freedoms, we will also notify you directly without undue delay.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            8. Exercising Your Rights
          </Typography>
          <Typography paragraph>
            To exercise any of your rights under GDPR, please submit a request to our Data Protection Officer at dpo@projectstore.com. We will respond to all legitimate requests within one month. Occasionally, it may take us longer if your request is particularly complex or you have made multiple requests, in which case we will notify you of the extension.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            9. Updates to This Statement
          </Typography>
          <Typography paragraph>
            We may update this GDPR Compliance statement from time to time. We will notify you of any significant changes by posting the new statement on our website and, where appropriate, notifying you by email.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default GDPRCompliancePage;
