import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MicIcon from '@mui/icons-material/Mic';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

export default function VoiceStatusIndicator() {
  const { isListening, isSupported } = useVoiceRecognition();

  if (!isSupported) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: isListening ? 'error.main' : 'primary.main',
        color: 'white',
        px: 2,
        py: 1,
        borderRadius: 2,
        boxShadow: 2,
        opacity: isListening ? 1 : 0.7,
        transition: 'all 0.3s ease',
        animation: isListening ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        }
      }}
    >
      <MicIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption" fontWeight="bold">
        {isListening ? 'Listening...' : 'Voice Ready'}
      </Typography>
    </Box>
  );
}
