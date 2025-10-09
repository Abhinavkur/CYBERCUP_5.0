import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getCurrentPosition } from '../../services/locationService';
import { useCreateAlert } from '../../hooks/useAlert';

export default function SOSbutton() {
  const [status, setStatus] = useState('idle'); // idle | locating | sending | success | error
  const [message, setMessage] = useState('');
  const { create, loading } = useCreateAlert();

  const onSOS = async () => {
    try {
      setStatus('locating');
      setMessage('Getting your location...');
      const coords = await getCurrentPosition({ timeoutMs: 12000 });

      setStatus('sending');
      setMessage('Sending SOS alert...');
      await create({ coords, type: 'general' });

      setStatus('success');
      setMessage('SOS sent. Help is on the way.');
    } catch (e) {
      setStatus('error');
      setMessage(e?.message || 'Failed to send SOS');
    }
  };

  const isBusy = status === 'locating' || status === 'sending' || loading;

  return (
    <Stack spacing={2} alignItems="center">
      {message && (
        <Alert severity={status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'}>
          {message}
        </Alert>
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
    </Stack>
  );
}

