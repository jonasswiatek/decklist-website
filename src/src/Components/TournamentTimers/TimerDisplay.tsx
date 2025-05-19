import React from 'react';

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

export const TimerDisplay: React.FC<{msRemaining: number}> = ({ msRemaining }) => {
    return <>{formatDuration(msRemaining)}</>;
};
