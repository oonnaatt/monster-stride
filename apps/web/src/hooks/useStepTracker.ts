import { useState, useCallback, useRef, useEffect } from 'react';

export type TrackStatus = 'idle' | 'tracking' | 'paused' | 'stopped';
export type InferredPace = 'walk' | 'jog' | 'run' | 'sprint';

export interface TrackerState {
  status: TrackStatus;
  steps: number;
  distanceM: number;
  durationS: number;
  cadenceSpm: number;
  pace: InferredPace;
  error: string | null;
}

// Step detection tuning
const HIGH_THR = 13.0;  // m/s² — rising edge triggers a step count
const LOW_THR  = 10.8;  // m/s² — must fall below before next step
const MIN_GAP  = 250;   // ms  — minimum gap between detected steps
const STRIDE_M = 0.762; // m   — avg step distance
const ALPHA    = 0.3;   // EMA smoothing factor

function toPace(spm: number): InferredPace {
  if (spm > 165) return 'sprint';
  if (spm > 130) return 'run';
  if (spm > 88)  return 'jog';
  return 'walk';
}

export function useStepTracker() {
  const [state, setState] = useState<TrackerState>({
    status: 'idle', steps: 0, distanceM: 0,
    durationS: 0, cadenceSpm: 0, pace: 'walk', error: null,
  });

  const statusRef    = useRef<TrackStatus>('idle');
  const stepsRef     = useRef(0);
  const smoothRef    = useRef(9.8);
  const inHighRef    = useRef(false);
  const lastStepRef  = useRef(0);
  const stepTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const elapsedRef   = useRef(0); // accumulated ms while not-tracking (paused)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const now = Date.now();
    const totalMs =
      statusRef.current === 'tracking'
        ? elapsedRef.current + (now - startTimeRef.current)
        : elapsedRef.current;

    // Rolling 60-second cadence window
    const cutoff = now - 60_000;
    stepTimesRef.current = stepTimesRef.current.filter(t => t > cutoff);
    const spm = stepTimesRef.current.length;

    setState(s => ({
      ...s,
      steps: stepsRef.current,
      distanceM: Math.round(stepsRef.current * STRIDE_M),
      durationS: Math.round(totalMs / 1000),
      cadenceSpm: spm,
      pace: toPace(spm),
    }));
  }, []);

  const onMotion = useCallback((e: DeviceMotionEvent) => {
    if (statusRef.current !== 'tracking') return;
    const a = e.accelerationIncludingGravity;
    if (!a) return;

    const raw = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
    smoothRef.current = ALPHA * raw + (1 - ALPHA) * smoothRef.current;
    const sm = smoothRef.current;

    if (!inHighRef.current && sm >= HIGH_THR) {
      // Rising edge — count a step if debounce window has passed
      inHighRef.current = true;
      const now = Date.now();
      if (now - lastStepRef.current >= MIN_GAP) {
        stepsRef.current += 1;
        lastStepRef.current = now;
        stepTimesRef.current.push(now);
      }
    } else if (inHighRef.current && sm < LOW_THR) {
      // Falling edge — re-arm for next step
      inHighRef.current = false;
    }
  }, []);

  const start = useCallback(async () => {
    // iOS 13+ requires explicit permission for DeviceMotionEvent
    type DMWithPerm = typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
    const DM = DeviceMotionEvent as unknown as DMWithPerm;
    if (typeof DM.requestPermission === 'function') {
      try {
        const result = await DM.requestPermission();
        if (result !== 'granted') {
          setState(s => ({
            ...s,
            error: 'Motion access denied. Enable in Settings → Safari → Motion & Orientation Access.',
          }));
          return;
        }
      } catch {
        setState(s => ({ ...s, error: 'Cannot request motion permission.' }));
        return;
      }
    }

    // Reset tracking state
    stepsRef.current = 0;
    stepTimesRef.current = [];
    smoothRef.current = 9.8;
    inHighRef.current = false;
    lastStepRef.current = 0;
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    statusRef.current = 'tracking';

    window.addEventListener('devicemotion', onMotion);
    timerRef.current = setInterval(tick, 1000);

    setState({
      status: 'tracking', steps: 0, distanceM: 0,
      durationS: 0, cadenceSpm: 0, pace: 'walk', error: null,
    });
  }, [onMotion, tick]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'tracking') return;
    elapsedRef.current += Date.now() - startTimeRef.current;
    statusRef.current = 'paused';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setState(s => ({ ...s, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    startTimeRef.current = Date.now();
    statusRef.current = 'tracking';
    timerRef.current = setInterval(tick, 1000);
    setState(s => ({ ...s, status: 'tracking' }));
  }, [tick]);

  const stop = useCallback(() => {
    if (statusRef.current === 'idle') return;
    if (statusRef.current === 'tracking') {
      elapsedRef.current += Date.now() - startTimeRef.current;
    }
    statusRef.current = 'stopped';
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    window.removeEventListener('devicemotion', onMotion);
    tick(); // final state flush
    setState(s => ({ ...s, status: 'stopped' }));
  }, [onMotion, tick]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.removeEventListener('devicemotion', onMotion);
    statusRef.current = 'idle';
    stepsRef.current = 0;
    elapsedRef.current = 0;
    stepTimesRef.current = [];
    setState({
      status: 'idle', steps: 0, distanceM: 0,
      durationS: 0, cadenceSpm: 0, pace: 'walk', error: null,
    });
  }, [onMotion]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.removeEventListener('devicemotion', onMotion);
  }, [onMotion]);

  return { state, start, pause, resume, stop, reset };
}
