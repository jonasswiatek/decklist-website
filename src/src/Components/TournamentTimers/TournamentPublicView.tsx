import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { useTournamentTimersUpdated } from '../../Hooks/useWebsocketConnection';
import { CountdownTimer } from './CountdownTimer';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';

const HIGH_PRIORITY_MS = 10 * 60 * 1000; // 10 minutes
const MEDIUM_PRIORITY_MS = 20 * 60 * 1000; // 20 minutes

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

  const runningClocks = tournamentDetails.clocks
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
            className="d-flex flex-row flex-nowrap" // Ensures items are in a single row and shrink to fit
            style={{ gap: '1rem' }} // Spacing between clock items
          >
            {highPriorityClocks.map((clock) => (
              <div
                key={clock.clock_id}
                className="d-flex" // Make this wrapper a flex container for h-100 on child
                style={{
                  flex: '1 1 0%', // Each item shares width equally, allows shrinking
                  minHeight: '20vh', // Adjust '20vh' as needed for desired vertical space
                }}
              >
                {/* Assumes ClockComponent is modified to accept and apply className */}
                <ClockComponent clock={clock} className="h-100 w-100" priority="high" />
              </div>
            ))}
          </div>
        </div>
      )}
      {mediumPriorityClocks.length > 0 && (
        <div className="mb-4">
          {/* Optional: <h3 className="text-light mb-3">Medium Priority</h3> */}
          <div className="row g-3">
            {mediumPriorityClocks.map((clock) => (
              <div key={clock.clock_id} className="col-12 col-md-6 col-lg-4">
                <ClockComponent clock={clock} priority="medium" />
              </div>
            ))}
          </div>
        </div>
      )}
      {lowPriorityClocks.length > 0 && (
        <div className="mb-4">
          {/* Optional: <h3 className="text-light mb-3">Low Priority</h3> */}
          <div className="row g-3">
            {lowPriorityClocks.map((clock) => (
              <div key={clock.clock_id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ClockComponent clock={clock} priority="low" />
              </div>
            ))}
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

  if (priority === 'high') {
    backgroundColor = '#382424'; // Dark, slightly reddish
  } else if (priority === 'medium') {
    backgroundColor = '#383124'; // Dark, slightly yellowish
  } else if (priority === 'low') {
    backgroundColor = '#24382b'; // Dark, slightly greenish
  }

  return <div style={{ backgroundColor }} className={`rounded p-3 mb-3 text-light ${className || ''}`}>
    <h1>{clock.clock_name}</h1>
    <div className="fs-1">
      <CountdownTimer initialMilliseconds={clock.ms_remaining} isRunning={clock.is_running} />
    </div>
  </div>;

}