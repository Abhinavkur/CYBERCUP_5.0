import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { audioService } from '../../services/audioService';

export default function VoiceDemo() {
  const [lastCommand, setLastCommand] = useState('');
  const { 
    isListening, 
    transcript, 
    error, 
    isSupported, 
    startListening, 
    stopListening, 
    checkForSOSCommand 
  } = useVoiceRecognition();

  const handleTranscript = (text) => {
    setLastCommand(text);
    if (checkForSOSCommand(text)) {
      audioService.playSuccess();
    }
  };

  // Update last command when transcript changes
  useEffect(() => {
    if (transcript) {
      handleTranscript(transcript);
    }
  }, [transcript]);

  if (!isSupported) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="error">
            Voice recognition not supported in this browser
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please use Chrome, Edge, or Safari for voice features.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Voice Recognition Demo
        </Typography>
        
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label={isListening ? "Listening..." : "Not Listening"} 
              color={isListening ? "error" : "default"}
              variant={isListening ? "filled" : "outlined"}
            />
            {error && (
              <Chip label={`Error: ${error}`} color="error" variant="outlined" />
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Try saying: "Hey SOS", "Emergency", "Help", or "Send SOS"
          </Typography>

          {lastCommand && (
            <Typography variant="body1">
              Last command: <strong>"{lastCommand}"</strong>
              {checkForSOSCommand(lastCommand) && (
                <Chip label="SOS Command Detected!" color="error" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
          )}

          <Stack direction="row" spacing={1}>
            <button 
              onClick={startListening}
              disabled={isListening}
              style={{
                padding: '8px 16px',
                backgroundColor: isListening ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isListening ? 'not-allowed' : 'pointer'
              }}
            >
              Start Listening
            </button>
            <button 
              onClick={stopListening}
              disabled={!isListening}
              style={{
                padding: '8px 16px',
                backgroundColor: !isListening ? '#ccc' : '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !isListening ? 'not-allowed' : 'pointer'
              }}
            >
              Stop Listening
            </button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
