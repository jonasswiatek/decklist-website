import { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { useTournamentTimersUpdated, WebSocketTournamentTimersRefreshMessageType } from '../../Hooks/useWebsocketConnection';
import {  TimerDisplay } from './TimerDisplay';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';
import { useTournamentClocks } from './useTournamentClocks';
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Spinner } from "@/Components/ui/spinner";

export function TournamentPublicViewWrapper(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();
  if (!tournament_id) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-lg text-center">
          <AlertDescription>Error: Tournament ID is required.</AlertDescription>
        </Alert>
      </div>
    );
  }
  return <TournamentPublicView tournament_id={tournament_id} />;
}

export function TournamentPublicView({ tournament_id }: { tournament_id: string }): ReactElement {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 950);
  const [isSyncing, setIsSyncing] = useState(false); // New state for syncing message

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 950);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: tournamentDetails, isLoading, isError, refetch } = useTournamentDetails(tournament_id, false);
  const {clocks: timers, addClock, removeClock, initClocks} = useTournamentClocks();

  useEffect(() => {
    if (tournamentDetails?.clocks) {
      initClocks(tournamentDetails.clocks);
    }
  }, [initClocks, tournamentDetails?.clocks]);

  const { readyState } = useTournamentTimersUpdated(
    (message) => {
      console.log("Tournament Clock Updated", message);
      switch (message.message_type) {
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_ADDED:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_RESET:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_PAUSED:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_RESUMED:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_ADJUSTED:
          if (message.updated_clock)
            addClock(message.updated_clock);
          break;

        case WebSocketTournamentTimersRefreshMessageType.CLOCK_DELETED:
          if (message.clock_id)
            removeClock(message.clock_id);
          break;

        case WebSocketTournamentTimersRefreshMessageType.FORCE_UPDATE:
          setIsSyncing(true); // Show syncing message
          refetch();
          setTimeout(() => {
            setIsSyncing(false); // Hide syncing message after 3 seconds
          }, 3000);
          break;
      }
    },
    tournament_id
  );

  useEffect(() => {
    if (readyState === WebSocket.OPEN) {
      console.log("WebSocket: Tournament timers connection opened, fetching timers");
      refetch();
    }},
    [readyState, refetch]
  );

  if (isSyncing) { // Conditional rendering for syncing overlay
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <Spinner className="size-12 text-primary" />
        <p className="text-4xl">Synchronising...</p>
      </div>
    );
  }

  if(!tournamentDetails || readyState !== WebSocket.OPEN || isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <Spinner className="size-12 text-primary" />
        <p className="text-lg">Connecting to server...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-lg text-center">
          <AlertTitle>Error Loading Tournament Timers</AlertTitle>
          <AlertDescription>Tournament details could not be loaded.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const runningClocks = timers
    .filter(clock => clock.is_running);
  const count = runningClocks.length;

  let numRows = 0;
  let numColsInGrid = 0;

  if (count > 0) {
    if (isMobile || count <= 2) { // If mobile, or 1 or 2 items, always use a single column
      numColsInGrid = 1;
    } else { // For count > 2 on non-mobile devices, set to 2 columns
      numColsInGrid = 2;
    }

    // Calculate numRows based on numColsInGrid and count
    numRows = Math.ceil(count / numColsInGrid);
  }


  const rowsOfClocks = [];
  if (count > 0) {
    let clockIndex = 0;
    for (let r = 0; r < numRows && clockIndex < count; r++) {
      const clocksInCurrentRow = [];
      for (let c = 0; c < numColsInGrid && clockIndex < count; c++) {
        clocksInCurrentRow.push(runningClocks[clockIndex]);
        clockIndex++;
      }
      if (clocksInCurrentRow.length > 0) {
        rowsOfClocks.push(clocksInCurrentRow);
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background"> {/* Full screen, flex column for rows */}
      {count > 0 && rowsOfClocks.map((clocksInRow, rowIndex) => (
        <div key={rowIndex} className="flex flex-1"> {/* Row takes available height */}
          {clocksInRow.map((clock) => (
            <div key={clock.clock_id} className="flex flex-1 p-1"> {/* Cell with padding, flex for child fill */}
              <ClockComponent clock={clock} className="h-full w-full" /> {/* Clock fills the padded cell */}
            </div>
          ))}
          {/* Fill remaining columns in the last row if it's not full, to maintain structure (optional) */}
          {clocksInRow.length < numColsInGrid && Array.from({ length: numColsInGrid - clocksInRow.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 p-1"></div>
          ))}
        </div>
      ))}
      {count === 0 && !isLoading && (
         <div className="flex min-h-svh items-center justify-center p-4"> {/* Centering the alert */}
           <Alert className="max-w-lg text-center">
              <AlertDescription>
                No active timers for this tournament at the moment.
              </AlertDescription>
           </Alert>
         </div>
      )}
    </div>
  );
}


export function ClockComponent({ clock, className }: { clock: TournamentTimerClock, className?: string }): ReactElement { // Removed priority prop
  const RED_MS = 0 * 60 * 1000;
  const YELLOW_MS = 5 * 60 * 1000;

  let backgroundColor: string;
  // Standardized text styling
  const clockNameClass = 'clock-name-font'; // Added clock-name-font for Inter font

  if (clock.ms_remaining < RED_MS) {
    backgroundColor = '#C82E31'; // Dark, slightly reddish
  } else if (clock.ms_remaining < YELLOW_MS) {
    backgroundColor = '#9F6918'; // Dark, slightly yellowish
  } else {
    backgroundColor = '#3D802D'; // Dark, slightly greenish
  }

  let conditionalClasses = className || '';
  if (clock.ms_remaining < 0) { // Condition no longer depends on priority
    conditionalClasses += ' shake-warning-border border-2 border-warning'; // Changed to use shaking animation
  }

  return <div style={{ backgroundColor }} className={`flex flex-col items-center justify-center p-3 text-white clock-container-query ${conditionalClasses}`}>
    <h1 className={clockNameClass}>{clock.clock_name}</h1>
    <div className={`timer-display-font`}>
      <TimerDisplay msRemaining={clock.ms_remaining} />
    </div>
  </div>;
}
