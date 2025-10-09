// Simple geolocation helper with timeout and accuracy filtering

export function getCurrentPosition(options = {}) {
  const {
    enableHighAccuracy = true,
    timeoutMs = 10000,
    maximumAgeMs = 0,
    maxAllowedAccuracyMeters = 200,
  } = options;

  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    let didFinish = false;

    const onSuccess = (pos) => {
      if (didFinish) return;
      didFinish = true;
      const { latitude, longitude, accuracy } = pos.coords;
      if (typeof accuracy === 'number' && accuracy > maxAllowedAccuracyMeters) {
        // Still resolve but mark low accuracy
        resolve({ lat: latitude, lng: longitude, accuracy, lowAccuracy: true });
      } else {
        resolve({ lat: latitude, lng: longitude, accuracy, lowAccuracy: false });
      }
    };

    const onError = (err) => {
      if (didFinish) return;
      didFinish = true;
      reject(err);
    };

    const timer = setTimeout(() => {
      if (didFinish) return;
      didFinish = true;
      onError(new Error('Geolocation timeout'));
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout: timeoutMs,
      maximumAge: maximumAgeMs,
    });

    // Cleanup in case consumer abandons
    // Note: getCurrentPosition has no cancel; timer guards callback
  });
}


