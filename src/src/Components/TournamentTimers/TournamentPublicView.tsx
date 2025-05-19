import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { useTournamentTimersUpdated } from '../../Hooks/useWebsocketConnection';
import {  TimerDisplay } from './TimerDisplay';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';
import { useTournamentClocks } from './useTournamentClocks';

const HIGH_PRIORITY_MS = 5 * 60 * 1000; // 5 minutes
const MEDIUM_PRIORITY_MS = 10 * 60 * 1000; // 10 minutes

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
    .filter(clock => clock.is_running)
    .sort((a, b) => a.ms_remaining - b.ms_remaining);

  const highPriorityClocks = runningClocks.filter(clock => clock.ms_remaining <= HIGH_PRIORITY_MS);
  const mediumPriorityClocks = runningClocks.filter(clock => clock.ms_remaining > HIGH_PRIORITY_MS && clock.ms_remaining <= MEDIUM_PRIORITY_MS);
  const lowPriorityClocks = runningClocks.filter(clock => clock.ms_remaining > MEDIUM_PRIORITY_MS);

  return (
    <div className="container-fluid px-3 py-3"> {/* Changed px-0 to px-3 */}
      {highPriorityClocks.length > 0 && (
        <div className="mb-4">
          {/* Optional: <h3 className="text-light mb-3">High Priority</h3> */}
          <div
            className="row g-3" // Ensures items wrap and use grid gutter
          >
            {highPriorityClocks.map((clock) => {
              const columnClass = highPriorityClocks.length === 1 ? "col-12" : "col-12 col-md-6";
              return (
                <div key={clock.clock_id} className={columnClass}>
                  <ClockComponent clock={clock} className="h-100 w-100" priority="high" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {mediumPriorityClocks.length > 0 && (
        <div className="mb-4">
          {/* Optional: <h3 className="text-light mb-3">Medium Priority</h3> */}
          <div className="row g-3">
            {mediumPriorityClocks.map((clock) => {
              let columnClass = "col-12"; // Default: 1 per row on mobile (xs, sm)
              if (mediumPriorityClocks.length > 1) { // More than 1 item
                if (mediumPriorityClocks.length === 2) {
                  columnClass += " col-md-6"; // 2 per row on md+
                } else { // 3 or more items
                  columnClass += " col-md-6 col-lg-4"; // 2 per row on md, 3 per row on lg+
                }
              }
              // If length is 1, it remains "col-12" (full width)
              return (
                <div key={clock.clock_id} className={columnClass}>
                  <ClockComponent clock={clock} priority="medium" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {lowPriorityClocks.length > 0 && (
        <div className="mb-4">
          {/* Optional: <h3 className="text-light mb-3">Low Priority</h3> */}
          <div className="row g-3">
            {lowPriorityClocks.map((clock) => {
              let columnClass = "col-12"; // Default: 1 per row on mobile (xs, sm)
              if (lowPriorityClocks.length > 1) { // More than 1 item
                if (lowPriorityClocks.length === 2) {
                  columnClass += " col-md-6"; // 2 per row on md+
                } else if (lowPriorityClocks.length === 3) {
                  columnClass += " col-md-4"; // 3 per row on md+
                } else { // 4 or more items
                  columnClass += " col-md-4 col-lg-3"; // 3 per row on md, 4 per row on lg+
                }
              }
              // If length is 1, it remains "col-12" (full width)
              return (
                <div key={clock.clock_id} className={columnClass}>
                  <ClockComponent clock={clock} priority="low" />
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


export function ClockComponent({ clock, className, priority }: { clock: TournamentTimerClock, className?: string, priority?: 'high' | 'medium' | 'low' }): ReactElement {
  let backgroundColor = '#212529'; // Default Bootstrap bg-dark color
  let clockNameClass = '';
  let timerClass = 'fs-1'; // Default timer font size

  if (priority === 'high') {
    backgroundColor = '#382424'; // Dark, slightly reddish
    clockNameClass = 'display-4'; // Larger clock name for high priority
    timerClass = 'display-1'; // Larger timer font size for high priority
  } else if (priority === 'medium') {
    backgroundColor = '#383124'; // Dark, slightly yellowish
    // clockNameClass remains default (h1 styling)
    // timerClass remains fs-1
  } else if (priority === 'low') {
    backgroundColor = '#24382b'; // Dark, slightly greenish
    // clockNameClass remains default (h1 styling)
    // timerClass can be made smaller if needed, e.g., fs-2 or fs-3
  }

  let conditionalClasses = className || '';
  if (priority === 'high' && clock.ms_remaining < 0) {
    conditionalClasses += ' border border-danger border-3'; // Added border-3 for thickness
  }

  return <div style={{ backgroundColor }} className={`rounded p-3 mb-3 text-light ${conditionalClasses}`}>
    <h1 className={clockNameClass}>{clock.clock_name}</h1>
    <div className={timerClass}>
      <TimerDisplay msRemaining={clock.ms_remaining} />
    </div>
  </div>;

}