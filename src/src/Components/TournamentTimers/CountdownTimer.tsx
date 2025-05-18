import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  initialMilliseconds: number;
  isRunning: boolean;
}

const formatDuration = (totalMilliseconds: number): string => {
  let prefix = '';
  if (totalMilliseconds < 0) {
    prefix = '-';
    totalMilliseconds = Math.abs(totalMilliseconds);
  }
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${prefix}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialMilliseconds, isRunning }) => {
  const [millisecondsToShow, setMillisecondsToShow] = useState(initialMilliseconds);
  
  // Ref to store the start time and initialMilliseconds value for the current "run" of the timer.
  // A "run" starts when isRunning becomes true, or when initialMilliseconds changes while isRunning is true.
  const currentRunRef = useRef<{ startTime: number; initialMillisecondsForRun: number } | null>(null);

  // Effect 1: Handles changes to initialMilliseconds prop.
  // If initialMilliseconds changes, millisecondsToShow should reflect this new total.
  // This is important for when the timer is stopped, or if initialMilliseconds changes while running
  // (the main effect will then also restart based on this new value).
  useEffect(() => {
    setMillisecondsToShow(initialMilliseconds);
  }, [initialMilliseconds]);

  // Effect 2: Main timer logic.
  useEffect(() => {
    if (isRunning) {
      // Timer is active. This is a "start" or "restart" event.
      
      // Record the start time and the initialMilliseconds for this specific run.
      // This happens when isRunning becomes true, or when initialMilliseconds changes while isRunning is true.
      currentRunRef.current = {
        startTime: Date.now(),
        initialMillisecondsForRun: initialMilliseconds // Use the current initialMilliseconds from props for this run
      };
      
      // When a new run starts (or restarts due to initialMilliseconds change while running),
      // millisecondsToShow should be the full duration of this run.
      // Effect 1 (above) ensures this if initialMilliseconds changed.
      // If only isRunning became true (and initialMilliseconds didn't change),
      // this explicitly sets/resets millisecondsToShow to the current initialMilliseconds.
      setMillisecondsToShow(initialMilliseconds); 

      const intervalId = setInterval(() => {
        if (currentRunRef.current) { // Should always be true if isRunning and interval is active
          const elapsedMilliseconds = Date.now() - currentRunRef.current.startTime;
          
          const remaining = currentRunRef.current.initialMillisecondsForRun - elapsedMilliseconds;
          setMillisecondsToShow(remaining); // Allow remaining to be negative
        }
      }, 1000); // Interval still runs every second to update the display

      return () => {
        clearInterval(intervalId);
        // When the effect cleans up (isRunning becomes false, or initialMilliseconds changes while isRunning is true),
        // currentRunRef is NOT reset here.
        // If isRunning becomes false, the 'else' block below will handle it.
        // If initialMilliseconds changed (while isRunning is true), this effect re-runs,
        // and currentRunRef is updated at the start of the 'if (isRunning)' block.
      };
    } else {
      // Timer is not running (isRunning is false).
      // Clear details of any active run, as it's now officially stopped/paused.
      currentRunRef.current = null;
      // When isRunning becomes false (pause/stop):
      // - millisecondsToShow should retain its last value from the active run.
      // - Effect 1 (listening to initialMilliseconds) would only change millisecondsToShow
      //   if initialMilliseconds itself changed. If initialMilliseconds is stable when pausing,
      //   millisecondsToShow correctly holds the paused value.
    }
  }, [isRunning, initialMilliseconds]); // These dependencies correctly define when a "run" state might change.

  return <>{formatDuration(millisecondsToShow)}</>;
};