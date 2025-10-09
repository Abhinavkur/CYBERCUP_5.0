import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { getCurrentPosition } from '../../services/locationService';
import { useCreateAlert } from '../../hooks/useAlert';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { audioService } from '../../services/audioService';

export default function SOSbutton() {
  const [status, setStatus] = useState('idle'); // idle | locating | sending | success | error
  const [message, setMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { create, loading } = useCreateAlert();
  const { 
    isListening, 
    transcript, 
    error: voiceError, 
    isSupported, 
    startListening, 
    stopListening, 
    checkForSOSCommand 
  } = useVoiceRecognition();

  // Handle voice command detection
  useEffect(() => {
    if (transcript && checkForSOSCommand(transcript)) {
      setMessage(`Voice command detected: "${transcript}"`);
      audioService.playVoiceActivation();
      onSOS();
    }
  }, [transcript, checkForSOSCommand]);

  const onSOS = async () => {
    try {
      setStatus('locating');
      setMessage('Getting your location...');
      audioService.playSOSPattern(); // Play SOS pattern when starting
      
      const coords = await getCurrentPosition({ timeoutMs: 12000 });

      setStatus('sending');
      setMessage('Sending SOS alert...');
      // Use a default emergency type when sending the alert
      await create({ coords, type: 'other' });

      setStatus('success');
      setMessage('SOS sent. Help is on the way.');
      audioService.playSuccess(); // Play success sound
    } catch (e) {
      setStatus('error');
      setMessage(e?.message || 'Failed to send SOS');
      audioService.playError(); // Play error sound
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      audioService.playVoiceActivation(); // Play activation sound
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const isBusy = status === 'locating' || status === 'sending' || loading;

  return (
    <Stack spacing={2} alignItems="center">
      {message && (
        <Alert severity={status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'}>
          {message}
        </Alert>
      )}
      
      {voiceError && (
        <Alert severity="warning">
          Voice recognition error: {voiceError}
        </Alert>
      )}

      {isSupported && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={toggleVoiceRecognition}
            disabled={isBusy}
            color={isListening ? 'error' : 'primary'}
            sx={{ 
              bgcolor: isListening ? 'error.light' : 'primary.light',
              color: 'white',
              '&:hover': {
                bgcolor: isListening ? 'error.main' : 'primary.main',
              }
            }}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {isListening ? 'Listening for "Hey SOS" or "Emergency"...' : 'Click mic for voice activation'}
          </Typography>
        </Box>
      )}

      <Button
        onClick={onSOS}
        disabled={isBusy}
        size="large"
        variant="contained"
        color="error"
        sx={{ px: 6, py: 3, borderRadius: 999, fontSize: 20 }}
      >
        {isBusy ? <CircularProgress size={28} color="inherit" /> : 'SEND SOS'}
      </Button>
      
      <Typography variant="body2" color="text.secondary">
        Press to share your location and notify nearby responders
      </Typography>
      
      {isSupported && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 300 }}>
          Voice commands: "Hey SOS", "Emergency", "Help", "Send SOS"
        </Typography>
      )}
      
    </Stack>
  );
}

