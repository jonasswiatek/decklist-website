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
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${prefix}${formattedMinutes}:${formattedSeconds}`;
};

export const TimerDisplay: React.FC<{msRemaining: number}> = ({ msRemaining }) => {
    return <>{formatDuration(msRemaining)}</>;
};
