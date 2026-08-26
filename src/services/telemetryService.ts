/**
 * Real-time Mobile Diagnostics & Telemetry Service
 * Sends phone events, camera stats, and barcode diagnostics to the backend
 */

export function logMobileEvent(event: string, data?: any) {
  try {
    const payload = {
      event,
      data: {
        ...data,
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: Date.now(),
      },
    };

    fetch('/api/telemetry/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (e) {
    // silent fallback
  }
}
