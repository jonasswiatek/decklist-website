import React from 'react';
import { Button, Container, Row, Col, Alert, Table, Spinner } from 'react-bootstrap';
import { useUserTournaments } from '../../Hooks/useTournamentTimers';
import { UserTournamentsResponseItem } from '../../model/api/tournamentTimers';
import { LoadingScreen } from '../Login/LoadingScreen';
import { useNavigate, Link } from 'react-router-dom';

const MyTournaments: React.FC = () => {
  const { data, isLoading, isError, error } = useUserTournaments();
  const navigate = useNavigate();

  if (isLoading && !data) { // Show loading screen only on initial load
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Error fetching tournaments: {error?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1 className="display-5">Round timers for your tournaments</h1>
          <p className="lead text-muted">Always up to date, with websocket push and judge access via mobile.</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Table hover responsive>
            <thead>
              <tr>
                <th scope='col'>Tournament Name</th>
                <th scope='col'>Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={2} className="text-center py-4">
                    <Spinner animation="border" role="status" size="sm" className="me-2" />
                    <span>Loading tournaments...</span>
                  </td>
                </tr>
              )}
              {!isLoading && data?.tournaments && data.tournaments.length > 0 ? (
                data.tournaments.map((tournament: UserTournamentsResponseItem) => (
                  <tr key={tournament.tournament_id}>
                    <td>
                      <Link 
                        to={`/timers/${tournament.tournament_id}`}
                        className="fw-semibold text-decoration-none"
                      >
                        {tournament.tournament_name}
                      </Link>
                    </td>
                    <td>{tournament.role}</td>
                  </tr>
                ))
              ) : (
                !isLoading && (
                  <tr>
                    <td colSpan={2} className="text-center py-4">
                      You currently have no tournament timers set up.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="text-end">
          <Button variant="primary" onClick={() => navigate('/timers/new') }>
            Create New Tournament
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default MyTournaments;
