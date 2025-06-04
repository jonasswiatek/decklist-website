import React from 'react';
import { Button, Container, Row, Col, Alert, Table } from 'react-bootstrap';
import { useUserTournaments } from '../../Hooks/useTournamentTimers';
import { UserTournamentsResponseItem } from '../../model/api/tournamentTimers';
import { LoadingScreen } from '../Login/LoadingScreen';
import { useNavigate, Link } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';
import { useAuth } from '../Login/useAuth';

const MyTournaments: React.FC = () => {
  const { login, authorized } = useAuth();
  const { data, isLoading, isError, error } = useUserTournaments(authorized || false);
  const navigate = useNavigate();

  if (isLoading) {
      return (
          <LoadingScreen />
      )
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
          <div className="mb-3">
              <button 
                  type="button" 
                  className="btn btn-link text-decoration-none p-0" 
                  onClick={() => navigate('/tools')}
              >
                  <BsArrowLeft className="me-1" /> Tools
              </button>
          </div>
          <h1 className="display-5">Round timers for your tournaments</h1>
          <p className="lead text-muted">Synchronized with WebSockets and judge access via mobile.</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          {!authorized ? (
            <Alert variant="info" className="text-center">
              <p>Please log in to view your tournaments.</p>
              <Button variant="primary" onClick={login}>
                Log In
              </Button>
            </Alert>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th scope='col'>Tournament Name</th>
                  <th scope='col'>Role</th>
                </tr>
              </thead>
              <tbody>
                {data?.tournaments && data.tournaments.length > 0 ? (
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
                      <td><span className="badge bg-primary">{tournament.role}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-4">
                      You currently have no tournament timers set up.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {authorized && (
        <Row className="mt-4">
          <Col className="text-end">
            <Button variant="primary" onClick={() => navigate('/timers/new') }>
              Create New Tournament
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default MyTournaments;
