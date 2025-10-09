// Voice notification service for alerting responders about new voice messages
export class VoiceNotificationService {
  constructor() {
    this.lastMessageCounts = new Map();
    this.isEnabled = true;
  }

  // Check for new voice messages and play notification
  checkForNewVoiceMessages(alertId, currentMessages) {
    if (!this.isEnabled || !currentMessages) return;

    const previousCount = this.lastMessageCounts.get(alertId) || 0;
    const currentCount = currentMessages.length;
    
    // If there are new messages
    if (currentCount > previousCount) {
      const newMessages = currentMessages.slice(previousCount);
      const hasNewVoiceMessages = newMessages.some(msg => msg.isVoiceMessage);
      
      if (hasNewVoiceMessages) {
        this.playVoiceMessageNotification();
      }
    }
    
    this.lastMessageCounts.set(alertId, currentCount);
  }

  // Play notification sound for new voice messages
  playVoiceMessageNotification() {
    if (!this.isEnabled) return;

    // Create a more distinctive sound for voice messages
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play a sequence of beeps to indicate voice message
      const playBeep = (frequency, duration, delay = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration / 1000);
        }, delay);
      };

      // Play distinctive voice message notification pattern
      playBeep(800, 200, 0);    // First beep
      playBeep(1000, 200, 300); // Second beep (higher pitch)
      playBeep(800, 200, 600);  // Third beep
    }
  }

  // Enable/disable notifications
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Clear message count for an alert (useful when alert is resolved)
  clearAlertCount(alertId) {
    this.lastMessageCounts.delete(alertId);
  }
}

// Export singleton instance
export const voiceNotificationService = new VoiceNotificationService();
