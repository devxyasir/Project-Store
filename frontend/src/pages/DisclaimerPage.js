import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const DisclaimerPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Disclaimer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: May 14, 2025
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Interpretation and Definitions
          </Typography>
          <Typography paragraph>
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Disclaimer
          </Typography>
          <Typography paragraph>
            The information contained on Project Store's website is for general information purposes only. Project Store assumes no responsibility for errors or omissions in the contents of the website.
          </Typography>
          <Typography paragraph>
            In no event shall Project Store be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service.
          </Typography>
          <Typography paragraph>
            Project Store reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. External Links Disclaimer
          </Typography>
          <Typography paragraph>
            The Project Store website may contain links to external websites that are not provided or maintained by or in any way affiliated with Project Store.
          </Typography>
          <Typography paragraph>
            Please note that Project Store does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Errors and Omissions Disclaimer
          </Typography>
          <Typography paragraph>
            The information given by Project Store is for general guidance on matters of interest only. Even if Project Store takes every precaution to ensure that the content of the website is both current and accurate, errors can occur. Plus, given the changing nature of laws, rules and regulations, there may be delays, omissions or inaccuracies in the information contained on the website.
          </Typography>
          <Typography paragraph>
            Project Store is not responsible for any errors or omissions, or for the results obtained from the use of this information.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Fair Use Disclaimer
          </Typography>
          <Typography paragraph>
            Project Store may use copyrighted material which has not always been specifically authorized by the copyright owner. Project Store is making such material available for criticism, comment, news reporting, teaching, scholarship, or research.
          </Typography>
          <Typography paragraph>
            Project Store believes this constitutes a "fair use" of any such copyrighted material as provided for in section 107 of the United States Copyright law.
          </Typography>
          <Typography paragraph>
            If you wish to use copyrighted material from the website for your own purposes that go beyond fair use, you must obtain permission from the copyright owner.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Views Expressed Disclaimer
          </Typography>
          <Typography paragraph>
            The views and opinions expressed in the website are those of the authors and do not necessarily reflect the official policy or position of any other agency, organization, employer or company, including Project Store.
          </Typography>
          <Typography paragraph>
            Comments published by users are their sole responsibility and the users will take full responsibility, liability and blame for any libel or litigation that results from something written in or as a direct result of something written in a comment.
          </Typography>
          <Typography paragraph>
            Project Store is not liable for any comment published by users and reserves the right to delete any comment for any reason whatsoever.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. "Use at Your Own Risk" Disclaimer
          </Typography>
          <Typography paragraph>
            All information on the website is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied.
          </Typography>
          <Typography paragraph>
            Project Store will not be liable to you or anyone else for any decision made or action taken in reliance on the information given by the Service or for any consequential, special or similar damages, even if advised of the possibility of such damages.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            8. Contact Us
          </Typography>
          <Typography paragraph>
            If you have any questions about this Disclaimer, please contact us:
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

export default DisclaimerPage;
