import { ReactElement, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BsPersonPlus, BsTrash, BsClockHistory, BsPlayFill, BsPauseFill } from 'react-icons/bs';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { createClock, TournamentTimerClock } from '../../model/api/tournamentTimers';

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface AddManagerFormInputs {
  name: string;
  email: string;
}

interface AddClockFormInputs {
  clock_name: string;
  duration_minutes: number;
}

interface TournamentProps {
  tournament_id: string;
}

export function TournamentWrapper(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();
  if (!tournament_id) {
    return <div>Error: Tournament ID is required.</div>;
  }
  return <Tournament tournament_id={tournament_id} />;
}

export function Tournament({ tournament_id }: TournamentProps): ReactElement {
  const { data: tournamentDetails, isLoading, error, refetch } = useTournamentDetails(tournament_id);
  const [managers, setManagers] = useState<Manager[]>([]); // Mock data, replace with API data later
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddManagerFormInputs>();
  const { register: registerClock, handleSubmit: handleSubmitClock, reset: resetClockForm, formState: { errors: clockErrors, isSubmitting: isSubmittingClock } } = useForm<AddClockFormInputs>({
    defaultValues: {
      duration_minutes: 50
    }
  });

  const onAddManager: SubmitHandler<AddManagerFormInputs> = async (data) => {
    setManagers(prevManagers => [...prevManagers, { ...data, id: Date.now().toString() }]);
    reset();
  };

  const onRemoveManager = async (managerId: string) => {
    if (window.confirm("Are you sure you want to remove this manager?")) {
      setManagers(prevManagers => prevManagers.filter(manager => manager.id !== managerId));
    }
  };

  const onAddClock: SubmitHandler<AddClockFormInputs> = async (data) => {
    await createClock(tournament_id, {
      clock_name: data.clock_name,
      duration_seconds: data.duration_minutes * 60,
    });

    resetClockForm({ clock_name: '', duration_minutes: 50 });
    refetch();
  };

  const onToggleClock = async (clockId: string, currentState: boolean) => {
    // Placeholder for API call to toggle clock state
    console.log(`Toggling clock ${clockId}. Current state: ${currentState ? 'running' : 'paused'}`);
    // Example: await toggleClockAPI(tournament_id, clockId, !currentState);
    // After API call, refetch data
    refetch();
  };

  const onDeleteClock = async (clockId: string) => {
    if (window.confirm("Are you sure you want to delete this clock?")) {
      console.log(`Deleting clock ${clockId}`);
      // TODO: Implement API call to delete clock
      // Example: await deleteClockAPI(tournament_id, clockId);
      // After API call, refetch data
      refetch();
    }
  };

  const formatDuration = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  if (isLoading) {
    return (
      <Container className="py-3 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading tournament details...</p>
      </Container>
    );
  }

  if (error || !tournamentDetails) {
    return (
      <Container className="py-3">
        <Alert variant="danger">
          Error loading tournament details: {error?.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <Row className="mb-3">
        <Col>
          <h2>Tournament: {tournamentDetails.tournament_name}</h2>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3 mb-md-0">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <BsClockHistory className="me-2" />
                <strong>Add Clock</strong>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitClock(onAddClock)}>
                <Row className="mb-3">
                  <Col md={8} xs={7}>
                    <Form.Group controlId="clockName">
                      <Form.Label>Clock Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter clock name (e.g., Round 1, Break)"
                        {...registerClock("clock_name", { required: "Clock name is required" })}
                        isInvalid={!!clockErrors.clock_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {clockErrors.clock_name?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4} xs={5}>
                    <Form.Group controlId="clockDuration">
                      <Form.Label>Duration (min)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Mins"
                        {...registerClock("duration_minutes", {
                          required: "Duration is required",
                          valueAsNumber: true,
                          min: { value: 1, message: "Duration must be at least 1 minute" }
                        })}
                        isInvalid={!!clockErrors.duration_minutes}
                      />
                      <Form.Control.Feedback type="invalid">
                        {clockErrors.duration_minutes?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="success" type="submit" disabled={isSubmittingClock}>
                  {isSubmittingClock ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Adding Clock...
                    </>
                  ) : 'Add Clock'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Current Clocks Section - Restructured */}
          <h4 className="mt-4 mb-3">
            <BsClockHistory className="me-2" />
            Current Clocks
          </h4>
          {tournamentDetails?.clocks && tournamentDetails.clocks.length > 0 ? (
            <Table striped hover responsive size="sm" className="mb-0"> {/* Removed bordered prop */}
              <thead className="table-dark">
                <tr>
                  <th>Clock</th>
                  <th>Remainder</th>
                  <th className="text-end"></th> {/* Actions column - no title */}
                </tr>
              </thead>
              <tbody>
                {tournamentDetails.clocks.map((clock: TournamentTimerClock) => (
                  <tr key={clock.clock_id}>
                    <td className="align-middle">{clock.clock_name}</td>
                    <td className="align-middle">{formatDuration(clock.seconds_remaining)}</td>
                    <td className="text-end align-middle">
                      <Button
                        variant={clock.is_running ? "warning" : "success"}
                        size="sm"
                        onClick={() => onToggleClock(clock.clock_id, clock.is_running)}
                        title={clock.is_running ? "Pause Clock" : "Start Clock"}
                        className="me-1"
                      >
                        {clock.is_running ? <BsPauseFill /> : <BsPlayFill />}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDeleteClock(clock.clock_id)}
                        title="Delete Clock"
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No clocks created for this tournament yet.</p>
          )}
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <BsPersonPlus className="me-2" />
                <strong>Add Manager</strong>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit(onAddManager)}>
                <Form.Group className="mb-3" controlId="managerName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter manager's name"
                    {...register("name", { required: "Name is required" })}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="managerEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter manager's email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Adding...
                    </>
                  ) : 'Add Manager'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header as="h5">Current Managers</Card.Header>
            <Card.Body>
              {/* This part still uses local mock 'managers' state. 
                  To use server data, it should use tournamentDetails.managers 
                  and API calls for add/remove, then refetch tournamentDetails.
              */}
              {managers.length > 0 ? (
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map(manager => (
                      <tr key={manager.id}>
                        <td>{manager.name}</td>
                        <td>{manager.email}</td>
                        <td className="text-end">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onRemoveManager(manager.id)}
                            title="Remove Manager"
                          >
                            <BsTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No managers assigned to this tournament yet. (Using mock data)</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
