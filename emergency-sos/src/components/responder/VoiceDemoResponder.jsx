import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { audioService } from '../../services/audioService';

export default function VoiceDemoResponder() {
  const [demoMessages, setDemoMessages] = useState([
    { id: 1, text: "I need help! There's been an accident!", isVoiceMessage: true, sender: "Citizen" },
    { id: 2, text: "I'm trapped in my car and can't get out", isVoiceMessage: true, sender: "Citizen" },
    { id: 3, text: "Help is on the way. Can you tell me your exact location?", isVoiceMessage: false, sender: "Responder" }
  ]);
  
  const { 
    isListening, 
    transcript, 
    error, 
    isSupported, 
    startListening, 
    stopListening 
  } = useVoiceRecognition();

  const speakMessage = (messageText) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(messageText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const addDemoMessage = () => {
    const newMessage = {
      id: demoMessages.length + 1,
      text: transcript || "This is a demo voice message",
      isVoiceMessage: true,
      sender: "Citizen"
    };
    setDemoMessages([...demoMessages, newMessage]);
    audioService.playSuccess();
  };

  if (!isSupported) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="error">
            Voice features not supported in this browser
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Voice Message Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This shows how voice messages appear to responders. Citizens can speak their messages, 
          and you'll see the transcribed text with voice indicators.
        </Typography>
        
        <Stack spacing={2}>
          {/* Demo Messages */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Sample Chat Messages:</Typography>
            <Stack spacing={1}>
              {demoMessages.map((msg) => (
                <Box key={msg.id} sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {msg.sender}
                      </Typography>
                      {msg.isVoiceMessage && (
                        <Chip
                          icon={<MicIcon />}
                          label="Voice"
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Stack>
                    <Button
                      size="small"
                      onClick={() => speakMessage(msg.text)}
                      startIcon={<VolumeUpIcon />}
                    >
                      Play
                    </Button>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {msg.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Voice Input Demo */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Try Voice Input:</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant={isListening ? "contained" : "outlined"}
                color={isListening ? "error" : "primary"}
                onClick={isListening ? stopListening : startListening}
                startIcon={<MicIcon />}
                disabled={!!error}
              >
                {isListening ? "Stop Listening" : "Start Voice Input"}
              </Button>
              {transcript && (
                <Button variant="contained" onClick={addDemoMessage}>
                  Add as Demo Message
                </Button>
              )}
            </Stack>
            {transcript && (
              <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <strong>Transcribed:</strong> {transcript}
              </Typography>
            )}
            {error && (
              <Typography variant="caption" color="error">
                Voice error: {error}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
