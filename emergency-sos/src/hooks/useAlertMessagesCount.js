import { useState, useEffect } from 'react';
import { streamAlertMessages } from '../services/AlertServices';

export function useAlertMessagesCount(alertId) {
  const [messageCount, setMessageCount] = useState(0);
  const [hasVoiceMessages, setHasVoiceMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alertId) {
      setMessageCount(0);
      setHasVoiceMessages(false);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = streamAlertMessages(
      alertId,
      (messages) => {
        setMessageCount(messages.length);
        setHasVoiceMessages(messages.some(msg => msg.isVoiceMessage));
        setLoading(false);
      },
      { max: 200 },
      (error) => {
        console.error('Error loading message count:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [alertId]);

  return { messageCount, hasVoiceMessages, loading };
}
