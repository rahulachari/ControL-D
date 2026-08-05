// Web Audio API Sound Effects for ControL-D (Medication Alarms & Water Drops)

export function playWaterDropSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First droplet
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(350, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.16);

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.18);

    // Echo droplet
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(500, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.06);

        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.12);
      } catch {}
    }, 120);
  } catch (e) {
    console.warn("Water sound audio warning:", e);
  }
}

export function playAlarmSoundLoop(stopSignalRef: { current: boolean } = { current: false }) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();
    if (stopSignalRef) stopSignalRef.current = false;

    const playChime = () => {
      if (stopSignalRef.current) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.15); // C6
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.3); // E6

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    };

    playChime();
    const timer = setInterval(() => {
      if (stopSignalRef.current) {
        clearInterval(timer);
        ctx.close().catch(() => {});
        return;
      }
      playChime();
    }, 1500);

    return () => {
      stopSignalRef.current = true;
      clearInterval(timer);
      ctx.close().catch(() => {});
    };
  } catch (e) {
    console.warn("Alarm audio warning:", e);
    return () => {};
  }
}
