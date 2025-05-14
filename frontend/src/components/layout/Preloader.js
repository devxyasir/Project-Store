import React from 'react';
import { Box, Typography, CircularProgress, keyframes } from '@mui/material';

// Define keyframes for animations
const fadeInOut = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const slideIn = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Preloader = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: `${slideIn} 0.5s ease-out forwards`,
        }}
      >
        {/* Main Logo/Title */}
        <Typography
          variant="h2"
          component="div"
          sx={{
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            mb: 1,
            animation: `${pulse} 2s infinite ease-in-out`,
            textShadow: '0 0 10px rgba(0, 170, 255, 0.7)',
          }}
        >
          <Box component="span" sx={{ mr: 1, fontSize: '3rem' }}>🚀</Box>
          Project Store
        </Typography>

        {/* Subtitle with Devsecure */}
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            color: '#0af',
            textAlign: 'center',
            mb: 4,
            fontStyle: 'italic',
            letterSpacing: '2px',
            animation: `${fadeInOut} 2s infinite ease-in-out`,
          }}
        >
          DEVSECURE
        </Typography>

        {/* Custom Loading Spinner */}
        <Box
          sx={{
            position: 'relative',
            width: 60,
            height: 60,
          }}
        >
          <CircularProgress
            size={60}
            thickness={3}
            sx={{
              color: '#0af',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <CircularProgress
            size={40}
            thickness={3}
            sx={{
              color: '#fff',
              position: 'absolute',
              top: 10,
              left: 10,
              animation: 'none',
              animationDuration: '1s',
            }}
          />
        </Box>

        {/* Loading text */}
        <Typography
          variant="body2"
          sx={{
            color: '#999',
            mt: 3,
            animation: `${fadeInOut} 1.5s infinite ease-in-out`,
          }}
        >
          Loading secure environment...
        </Typography>
      </Box>
    </Box>
  );
};

export default Preloader;
