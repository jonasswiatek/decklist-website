import { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { useTournamentTimersUpdated } from '../../Hooks/useWebsocketConnection';
import {  TimerDisplay } from './TimerDisplay';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';
import { useTournamentClocks } from './useTournamentClocks';

export function TournamentPublicViewWrapper(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();
  if (!tournament_id) {
    return (
      <Container fluid className="py-3 vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Alert variant="danger" className="w-75 text-center">Error: Tournament ID is required.</Alert>
      </Container>
    );
  }
  return <TournamentPublicView tournament_id={tournament_id} />;
}

export function TournamentPublicView({ tournament_id }: { tournament_id: string }): ReactElement {
  const { data: tournamentDetails, isLoading, error, refetch } = useTournamentDetails(tournament_id, false);
  const timers = useTournamentClocks(tournamentDetails?.clocks);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 950);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 950);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { readyState } = useTournamentTimersUpdated(
    (message) => {
        console.log("Tournament Clock Updated", message);
        refetch();
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

  if(!tournamentDetails || readyState !== WebSocket.OPEN || isLoading) {
    return (
      <Container fluid className="py-3 vh-100 d-flex flex-column justify-content-center align-items-center bg-dark">
        <Spinner animation="border" variant="light" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
        <p className="text-light fs-5 text-center">Connecting to server...</p>
      </Container>
    );
  }

  if (error) {
    return (
        <Alert variant="danger" className="w-75 text-center shadow-sm">
          <Alert.Heading as="h4">Error Loading Tournament Timers</Alert.Heading>
          <p>{error?.message || "Tournament details could not be loaded."}</p>
          <hr />
          <Button onClick={() => refetch()} variant="danger">Try Again</Button>
        </Alert>
    );
  }

  const runningClocks = timers
    .filter(clock => clock.is_running);
  const count = runningClocks.length;

  let numRows = 0;
  let numColsInGrid = 0; 
  let bootstrapColClass = ""; 

  if (count > 0) {
    if (isMobile || count <= 2) { // If mobile, or 1 or 2 items, always use a single column
      numColsInGrid = 1;
    } else { // For count > 2 on non-mobile devices, create a squarish grid
      numColsInGrid = Math.ceil(Math.sqrt(count));
    }

    // Calculate numRows based on numColsInGrid and count
    numRows = Math.ceil(count / numColsInGrid);

    // Calculate bootstrapColClass. If numColsInGrid is 1, this will result in 'col-12'.
    if (numColsInGrid > 0) {
      const bsCols = Math.max(1, Math.floor(12 / numColsInGrid));
      bootstrapColClass = `col-${bsCols}`;
    }
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
    <div className="container-fluid px-0 py-0 vh-100 d-flex flex-column bg-dark"> {/* Full screen, flex column for rows, no padding */}
      {count > 0 && rowsOfClocks.map((clocksInRow, rowIndex) => (
        <div key={rowIndex} className="row g-0 flex-grow-1"> {/* Row takes available height, no gutters */}
          {clocksInRow.map((clock) => (
            <div key={clock.clock_id} className={`${bootstrapColClass} d-flex p-1`}> {/* Cell with padding, d-flex for child fill */}
              <ClockComponent clock={clock} className="w-100 h-100" /> {/* Clock fills the padded cell */}
            </div>
          ))}
          {/* Fill remaining columns in the last row if it's not full, to maintain structure (optional) */}
          {clocksInRow.length < numColsInGrid && Array.from({ length: numColsInGrid - clocksInRow.length }).map((_, i) => (
            <div key={`empty-${i}`} className={`${bootstrapColClass} p-1`}></div>
          ))}
        </div>
      ))}
      {count === 0 && !isLoading && (
         <div className="vh-100 d-flex justify-content-center align-items-center"> {/* Centering the alert */}
           <Alert variant="info" className="w-75 text-center mx-auto">
              No active timers for this tournament at the moment.
           </Alert>
         </div>
      )}
    </div>
  );
}


export function ClockComponent({ clock, className }: { clock: TournamentTimerClock, className?: string }): ReactElement { // Removed priority prop
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const TEN_MINUTES_MS = 10 * 60 * 1000;

  let backgroundColor: string;
  // Standardized text styling
  const clockNameClass = 'clock-name-font'; // Added clock-name-font for Inter font

  if (clock.ms_remaining < FIVE_MINUTES_MS) {
    backgroundColor = '#C82E31'; // Dark, slightly reddish
  } else if (clock.ms_remaining < TEN_MINUTES_MS) {
    backgroundColor = '#9F6918'; // Dark, slightly yellowish
  } else {
    backgroundColor = '#3D802D'; // Dark, slightly greenish
  }

  let conditionalClasses = className || '';
  if (clock.ms_remaining < 0) { // Condition no longer depends on priority
    conditionalClasses += ' shake-warning-border'; // Changed to use shaking animation
  }

  return <div style={{ backgroundColor }} className={`p-3 mb-3 text-light d-flex flex-column justify-content-center align-items-center ${conditionalClasses}`}>
    <h1 className={clockNameClass}>{clock.clock_name}</h1>
    <div className={`timer-display-font`}> {/* Removed timerClass */}
      <TimerDisplay msRemaining={clock.ms_remaining} />
    </div>
  </div>;
}