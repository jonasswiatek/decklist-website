import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { CountdownTimer } from './CountdownTimer';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';
import { useTournamentTimersUpdated } from '../../Hooks/useWebsocketConnection';

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
      <Container fluid className="py-3 text-center vh-100 d-flex flex-column justify-content-center align-items-center bg-dark">
        <Spinner animation="border" role="status" style={{ width: '4rem', height: '4rem' }} variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 fs-4 text-light">Loading tournament timers...</p>
      </Container>
    );
  }

  if (error || !tournamentDetails) {
    return (
      <Container fluid className="py-3 vh-100 d-flex flex-column justify-content-center align-items-center bg-dark">
        <Alert variant="danger" className="w-75 text-center shadow-sm">
          <Alert.Heading as="h4">Error Loading Tournament Timers</Alert.Heading>
          <p>{error?.message || "Tournament details could not be loaded."}</p>
          <hr />
          <Button onClick={() => refetch()} variant="danger">Try Again</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 vh-100 d-flex flex-column bg-dark text-light">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center display-5 fw-bold text-primary">{tournamentDetails.tournament_name}</h1>
        </Col>
      </Row>
      {tournamentDetails.clocks && tournamentDetails.clocks.length > 0 ? (
        <Row xs={1} md={2} className="g-4 flex-grow-1">
          {tournamentDetails.clocks.map((clock: TournamentTimerClock) => (
            <Col key={clock.clock_id} className="d-flex">
              <Card className="text-center w-100 shadow border-0 rounded-3 bg-secondary">
                <Card.Header as="h4" className={`py-3 ${clock.is_running ? 'bg-success' : 'bg-dark text-white-50'} text-white rounded-top-3`}>
                  {clock.clock_name}
                </Card.Header>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '150px' }}>
                  <div style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 'bold', lineHeight: '1.1' }} className="text-light">
                    <CountdownTimer initialMilliseconds={clock.ms_remaining} isRunning={clock.is_running} />
                  </div>
                </Card.Body>
                <Card.Footer className="text-white-50 bg-dark border-top-0 rounded-bottom-3">
                  {/* Status removed as per request */}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="flex-grow-1">
          <Col className="d-flex justify-content-center align-items-center">
            <Alert variant="dark" className="text-center shadow-sm w-50 border-secondary">
              <Alert.Heading as="h4" className="text-light">No Clocks Available</Alert.Heading>
              <p className="text-light">There are no clocks currently set up for this tournament.</p>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}
