import React from 'react';

const formatDuration = (totalMilliseconds: number): string => {
  const totalSeconds = totalMilliseconds === 0 ? 0 : Math.ceil(totalMilliseconds / 1000);
  const prefix = totalSeconds < 0 ? '-' : '';

  const absTotalSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absTotalSeconds / 60);
  const seconds = absTotalSeconds % 60;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${prefix}${formattedMinutes}:${formattedSeconds}`;
};

export const TimerDisplay: React.FC<{msRemaining: number}> = ({ msRemaining }) => {
    return <>{formatDuration(msRemaining)}</>;
};
