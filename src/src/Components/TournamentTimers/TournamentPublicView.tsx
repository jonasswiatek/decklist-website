import { ReactElement } from 'react';
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
  const { data: tournamentDetails, isLoading, error, refetch } = useTournamentDetails(tournament_id);
  const timers = useTournamentClocks(tournamentDetails?.clocks);

  useTournamentTimersUpdated(
    (message) => {
      if (message.tournamentId === tournament_id) {
        console.log("Tournament Timers Updated: ", message);
        refetch();
      }
    },
    tournament_id
  );

  if (isLoading) {
    return (
      <>
        <Spinner animation="border" role="status" style={{ width: '4rem', height: '4rem' }} variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 fs-4 text-light">Loading tournament timers...</p>
      </>
    );
  }

  if (error || !tournamentDetails) {
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

  const getColumnClass = (count: number): string => {
    if (count === 1) {
      return "col-12";
    }
    if (count === 2) {
      return "col-12 col-md-6";
    }
    // 3 or more items
    return "col-12 col-md-6 col-lg-4";
  };

  return (
    <div className="container-fluid px-3 py-3">
      {runningClocks.length > 0 && (
        <div className="mb-4">
          <div className="row g-4"> {/* Changed g-3 to g-4 */}
            {runningClocks.map((clock) => {
              const columnClass = getColumnClass(runningClocks.length);
              return (
                <div key={clock.clock_id} className={columnClass}>
                  <ClockComponent clock={clock} className="h-100" /> {/* Pass h-100 if clocks should fill height of grid cell */}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {runningClocks.length === 0 && !isLoading && (
         <Alert variant="info" className="w-75 text-center mx-auto mt-4">
            No active timers for this tournament at the moment.
         </Alert>
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