// Audio service for providing sound feedback
export class AudioService {
  constructor() {
    this.audioContext = null;
    this.isEnabled = true;
  }

  // Initialize audio context (required for modern browsers)
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play a simple beep sound
  playBeep(frequency = 800, duration = 200) {
    if (!this.isEnabled) return;
    
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // Play SOS pattern (3 short, 3 long, 3 short)
  playSOSPattern() {
    if (!this.isEnabled) return;
    
    const shortBeep = () => this.playBeep(800, 150);
    const longBeep = () => this.playBeep(800, 450);
    
    // S (3 short)
    setTimeout(() => shortBeep(), 0);
    setTimeout(() => shortBeep(), 200);
    setTimeout(() => shortBeep(), 400);
    
    // O (3 long)
    setTimeout(() => longBeep(), 800);
    setTimeout(() => longBeep(), 1400);
    setTimeout(() => longBeep(), 2000);
    
    // S (3 short)
    setTimeout(() => shortBeep(), 2600);
    setTimeout(() => shortBeep(), 2800);
    setTimeout(() => shortBeep(), 3000);
  }

  // Play success sound
  playSuccess() {
    if (!this.isEnabled) return;
    
    this.playBeep(600, 100);
    setTimeout(() => this.playBeep(800, 100), 150);
    setTimeout(() => this.playBeep(1000, 200), 300);
  }

  // Play error sound
  playError() {
    if (!this.isEnabled) return;
    
    this.playBeep(300, 200);
    setTimeout(() => this.playBeep(200, 200), 250);
  }

  // Play voice activation sound
  playVoiceActivation() {
    if (!this.isEnabled) return;
    
    this.playBeep(1000, 100);
  }

  // Enable/disable audio
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Check if audio is supported
  isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
}

// Export singleton instance
export const audioService = new AudioService();
