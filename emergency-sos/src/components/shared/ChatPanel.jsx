import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useAlertMessages, useSendAlertMessage } from '../../hooks/useAlert';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { audioService } from '../../services/audioService';
import { voiceNotificationService } from '../../services/voiceNotificationService';

export default function ChatPanel({ alert, open, onClose }) {
  const { messages, loading } = useAlertMessages(alert?.id);
  const { send, sending, error } = useSendAlertMessage(alert?.id);
  const [text, setText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const endRef = useRef(null);
  
  const { 
    isListening, 
    transcript, 
    error: voiceError, 
    isSupported, 
    startListening, 
    stopListening 
  } = useVoiceRecognition();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Check for new voice messages and play notification
  useEffect(() => {
    if (messages && alert?.id) {
      voiceNotificationService.checkForNewVoiceMessages(alert.id, messages);
    }
  }, [messages, alert?.id]);

  // Handle voice transcript updates
  useEffect(() => {
    if (transcript && isVoiceMode) {
      setText(transcript);
    }
  }, [transcript, isVoiceMode]);

  const onSend = async () => {
    const t = text.trim();
    if (!t) return;
    await send(t, isVoiceMode);
    setText('');
    if (isVoiceMode) {
      setIsVoiceMode(false);
      stopListening();
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      setIsVoiceMode(false);
      stopListening();
    } else {
      setIsVoiceMode(true);
      setText('');
      startListening();
      audioService.playVoiceActivation();
    }
  };

  const speakMessage = (messageText) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(messageText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chat — {alert ? (alert.type || 'Alert') : 'Alert'}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Stack alignItems="center" sx={{ my: 2 }}>
            <CircularProgress size={22} />
          </Stack>
        )}
        {!loading && (!messages || messages.length === 0) && (
          <Typography variant="body2" color="text.secondary">No messages yet. Start the conversation.</Typography>
        )}
        <Stack spacing={1.2} sx={{ mt: 1 }}>
          {(messages || []).map((m) => (
            <Stack key={m.id} sx={{ p: 1.2, borderRadius: 1, bgcolor: '#f6f6f6' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {m.sender?.name || m.sender?.email || 'Unknown'}
                  {m.isVoiceMessage && (
                    <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
                      <MicIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      <Typography variant="caption" color="primary">Voice</Typography>
                    </Box>
                  )}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => speakMessage(m.text)}
                  sx={{ p: 0.5 }}
                >
                  <VolumeUpIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
              <Typography variant="body2">{m.text}</Typography>
            </Stack>
          ))}
          <div ref={endRef} />
        </Stack>
        {error && (
          <Typography variant="caption" color="error">Failed to send: {error.message || 'Unknown error'}</Typography>
        )}
        {voiceError && (
          <Typography variant="caption" color="error">Voice error: {voiceError}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={isVoiceMode ? "Listening..." : "Type a message"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={isListening}
            sx={{
              '& .MuiInputBase-input': {
                color: isVoiceMode ? 'primary.main' : 'inherit'
              }
            }}
          />
          {isSupported && (
            <IconButton
              onClick={toggleVoiceMode}
              disabled={sending}
              color={isVoiceMode ? 'error' : 'primary'}
              sx={{ 
                bgcolor: isVoiceMode ? 'error.light' : 'primary.light',
                color: 'white',
                '&:hover': {
                  bgcolor: isVoiceMode ? 'error.main' : 'primary.main',
                }
              }}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          )}
          <Button 
            onClick={onSend} 
            disabled={sending || !text.trim()} 
            variant="contained"
          >
            Send
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}



