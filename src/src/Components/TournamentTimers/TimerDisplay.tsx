import React from 'react';

const formatDuration = (totalMilliseconds: number): string => {
  let prefix = '';
  if (totalMilliseconds < 0) {
    prefix = '-';
    totalMilliseconds = Math.abs(totalMilliseconds);
  }
  // For positive numbers, Math.ceil ensures that if any part of a second exists,
  // it's rounded up to the next whole second.
  // e.g., 1ms will be treated as 1 second, 1001ms as 2 seconds.
  // If totalMilliseconds is 0, Math.ceil(0) is 0.
  const totalSeconds = totalMilliseconds === 0 ? 0 : Math.ceil(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${prefix}${formattedMinutes}:${formattedSeconds}`;
};

export const TimerDisplay: React.FC<{msRemaining: number}> = ({ msRemaining }) => {
    return <>{formatDuration(msRemaining)}</>;
};
