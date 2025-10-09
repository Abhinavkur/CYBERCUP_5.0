import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      // Configure recognition settings
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript.toLowerCase().trim();
        setTranscript(result);
      };

      recognition.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start voice recognition');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const checkForSOSCommand = useCallback((text) => {
    const sosCommands = [
      'hey sos',
      'emergency',
      'help',
      'sos',
      'send sos',
      'emergency sos',
      'call for help'
    ];
    
    return sosCommands.some(command => 
      text.includes(command) || command.includes(text)
    );
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    checkForSOSCommand
  };
}
