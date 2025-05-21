import { ReactElement, useState, Fragment, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BsPersonPlus, BsTrash, BsClockHistory, BsPlayFill, BsPauseFill, BsExclamationTriangleFill, BsArrowCounterclockwise, BsBoxArrowUpRight, BsCheck, BsClipboard, BsSliders, BsArrowLeft } from 'react-icons/bs';
import { useTournamentDetails, useUserTournaments } from '../../Hooks/useTournamentTimers';
import { addManager, createClock, deleteClock, deleteManager, TournamentTimerClock, updateClock, deleteTournament, resetClock, adjustClock, forceUpdate } from '../../model/api/tournamentTimers';
import { TimerDisplay } from './TimerDisplay';
import { useTournamentClocks } from './useTournamentClocks';
import { useTournamentTimersUpdated, WebSocketTournamentTimersRefreshMessageType } from '../../Hooks/useWebsocketConnection';
import { useAuth } from '../Login/useAuth';

interface AddManagerFormInputs {
  name: string;
  email: string;
}

interface AddClockFormInputs {
  clock_name: string;
  duration_minutes: number;
}

export function TournamentWrapper(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();
  if (!tournament_id) {
    return <div>Error: Tournament ID is required.</div>;
  }
  return <Tournament tournament_id={tournament_id} />;
}

export function Tournament({ tournament_id }: {tournament_id: string}): ReactElement {
  const { sessionId } = useAuth();
  const { data: tournamentDetails, isLoading, error, refetch } = useTournamentDetails(tournament_id, false);
  const { refetch: refetchUserTournaments } = useUserTournaments();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddManagerFormInputs>();
  const { register: registerClock, handleSubmit: handleSubmitClock, reset: resetClockForm, formState: { errors: clockErrors, isSubmitting: isSubmittingClock } } = useForm<AddClockFormInputs>({
    defaultValues: {
      duration_minutes: 50
    }
  });
  const navigate = useNavigate();
  const publicLink = `${window.location.origin}/timers/${tournamentDetails?.tournament_id}/view`;
  const [copied, setCopied] = useState(false);
  const [expandedClockId, setExpandedClockId] = useState<string | null>(null);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const {clocks: timers, addClock, removeClock, initClocks} = useTournamentClocks();

  useEffect(() => {
    if (tournamentDetails?.clocks) {
      initClocks(tournamentDetails.clocks);
    }
  }, [initClocks, tournamentDetails?.clocks]);

  const { readyState } = useTournamentTimersUpdated(
    (message) => {
      if (message.message_type === WebSocketTournamentTimersRefreshMessageType.FORCE_UPDATE) {
        refetch();
        setSyncStatusMessage("Sync completed");
        setTimeout(() => setSyncStatusMessage(""), 3000); // Clear message after 3 seconds
        return;
      }

      if (message.updated_by_session_id == sessionId)
        return; // Ignore updates from the same session

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
      }

      console.log("Tournament Clock Updated", message);
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

  const copyToClipboard = async () => {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const onAddManager: SubmitHandler<AddManagerFormInputs> = async (data) => {
    await addManager(tournament_id, {
      user_email: data.email,
      user_name: data.name,
    });
    refetch();
    reset();
  };

  const onRemoveManager = async (managerId: string) => {
    if (window.confirm("Are you sure you want to remove this manager?")) {
      await deleteManager(tournament_id, managerId);
      refetch();
    }
  };

  const onAddClock: SubmitHandler<AddClockFormInputs> = async (data) => {
    const clock = await createClock(tournament_id, {
      clock_name: data.clock_name,
      duration_seconds: data.duration_minutes * 60,
    });

    addClock(clock);
    resetClockForm({ clock_name: '', duration_minutes: 50 });
  };

  const onToggleClock = async (clockId: string, currentState: boolean) => {
    const clock = await updateClock(tournament_id, clockId, { is_running: !currentState });
    addClock(clock);
  };

  const handleToggleAdjustPanel = (clockId: string) => {
    setExpandedClockId(prevId => (prevId === clockId ? null : clockId));
  };

  const onResetClock = async (clockId: string, durationSeconds: number) => {
    const durationMinutes = Math.floor(durationSeconds / 60);
    if (window.confirm(`Are you sure you want to reset this clock to ${durationMinutes} minutes?`)) {
      const clock = await resetClock(tournament_id, clockId);
      addClock(clock);
    }
  };

  const onAdjustClockTime = async (clockId: string, msAdjustment: number) => {
    console.log(`Adjusting clock ${clockId} by ${msAdjustment} ms`);
    const clock = await adjustClock(tournament_id, clockId, { ms_adjustment: msAdjustment });
    addClock(clock);
  };

  const onDeleteClock = async (clockId: string) => {
    if (window.confirm("Are you sure you want to delete this clock?")) {
      console.log(`Deleting clock ${clockId}`);
      await deleteClock(tournament_id, clockId);
      removeClock(clockId);
    }
  };

  const onDeleteTournament = async () => {
    if (window.confirm("Are you sure you want to permanently delete this tournament and all its clocks? This action cannot be undone.")) {
      await deleteTournament(tournament_id);
      refetchUserTournaments();
      navigate('/timers');
    }
  };

  const onForceSync = async () => {
    setIsSyncing(true);
    await forceUpdate(tournament_id);
    setSyncStatusMessage("Sync requested");
    setTimeout(() => {
      setSyncStatusMessage("");
      setIsSyncing(false); // Re-enable button after 3 seconds
    }, 3000);
  };

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
      <Container className="py-3">
        <Alert variant="danger">
          Error loading tournament details: {error?.message}
        </Alert>
      </Container>
    );
  }

  if (tournamentDetails.role !== "owner" && tournamentDetails.role !== "manager") {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          You do not have permission to view this tournament.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <Row className="mb-3">
        <Col>
          <div className="mb-3">
              <button 
                  type="button" 
                  className="btn btn-link text-decoration-none p-0" 
                  onClick={() => navigate('/timers')}
              >
                  <BsArrowLeft className="me-1" /> Back
              </button>
          </div>
          <h2>{tournamentDetails.tournament_name}</h2>
        </Col>
      </Row>
      <Row>
        <Col lg={6} className="mb-3 mb-lg-0">
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
          {timers && timers.length > 0 ? (
            <Table striped hover responsive size="sm" className="mb-0">
              <tbody>
                {timers.map((clock: TournamentTimerClock) => (
                  <Fragment key={clock.clock_id}>
                    <tr>
                      <td 
                        className="align-middle"
                        style={{ 
                          maxWidth: '150px', // Adjust as needed
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={clock.clock_name} // Show full name on hover
                      >
                        {clock.clock_name}
                      </td>
                      <td 
                        className="align-middle text-end timer-display-font-table" 
                      >
                        <TimerDisplay msRemaining={clock.ms_remaining} />
                      </td>
                      <td 
                        className="text-end align-middle"
                        style={{ whiteSpace: 'nowrap', width: '1%' }}
                      >
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
                          variant="info"
                          size="sm"
                          onClick={() => onResetClock(clock.clock_id, clock.duration_seconds)}
                          title="Reset Clock"
                          className="me-1"
                        >
                          <BsArrowCounterclockwise />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleAdjustPanel(clock.clock_id)}
                          title="Adjust Time"
                          className="me-1"
                          aria-expanded={expandedClockId === clock.clock_id}
                        >
                          <BsSliders />
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
                    {expandedClockId === clock.clock_id && (
                      <tr>
                        <td colSpan={3} className="p-2">
                          <div className="d-flex justify-content-center flex-wrap">
                            {[
                              { label: "-1m", ms: -60000 },
                              { label: "-30s", ms: -30000 }, { label: "-10s", ms: -10000 },
                              { label: "+10s", ms: 10000 }, { label: "+30s", ms: 30000 },
                              { label: "+1m", ms: 60000 },
                            ].map(adj => (
                              <Button
                                key={adj.label}
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => onAdjustClockTime(clock.clock_id, adj.ms)}
                                className="m-1"
                                style={{ minWidth: '50px' }}
                              >
                                {adj.label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No clocks created for this tournament yet.</p>
          )}
        </Col>
        <Col lg={6}>
          <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
              <div style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '70%'
              }}>
                  <strong>Public Link:</strong> {publicLink}
              </div>
              <div className="d-flex align-items-center">
                  <button 
                      onClick={copyToClipboard} 
                      className="btn btn-primary d-flex align-items-center me-2"
                      title="Copy to clipboard"
                  >
                    {copied ? <BsCheck /> : <BsClipboard />}    
                  </button>
                  
                  <Link 
                      to={publicLink} 
                      className="btn btn-primary d-flex align-items-center"
                      title="Open public view"
                      target="_blank" // Add this to open in a new window
                      rel="noopener noreferrer" // Add this for security best practices
                  >
                      <BsBoxArrowUpRight />
                  </Link>
              </div>
          </div>
        
          {tournamentDetails.role === "owner" && (
            <>
              <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <BsPersonPlus className="me-2" />
                    <strong>Add Manager</strong>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit(onAddManager)}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="managerName">
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
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="managerEmail">
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
                      </Col>
                    </Row>

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

              <h4 className="mt-4 mb-3">
                <BsPersonPlus className="me-2" />
                Current Managers
              </h4>
              {tournamentDetails.managers.length > 0 ? (
                <Table striped hover responsive size="sm" className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th className="text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentDetails.managers.map(manager => (
                      <tr key={manager.user_id}>
                        <td className="align-middle">{manager.user_name}</td>
                        <td className="text-end align-middle">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onRemoveManager(manager.user_id)}
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
                <p>No managers assigned to this tournament yet.</p>
              )}
            </>
          )}

          <Card className="mb-3 mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                {/* Consider an icon for Utilities, e.g., BsGear or BsCloudSync */}
                <strong>Utilities</strong>
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                Use this button in case one or more presentation screens have desynchronized, 
                which can happen in case of intermittent connectivity issues. 
                While they should automatically recover given time, you can attempt to force a sync here.
              </p>
              <Button
                variant="primary"
                onClick={onForceSync}
                className="w-100"
                disabled={isSyncing} // Disable button when syncing
              >
                {isSyncing ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Syncing...
                  </>
                ) : 'Force Sync'}
              </Button>
              {syncStatusMessage && <p className="text-muted mt-2 text-center">{syncStatusMessage}</p>}
            </Card.Body>
          </Card>

          {/* Danger Zone Section */}
          {tournamentDetails.role === "owner" && (
            <Card className="mt-4">
              <Card.Header className="text-white d-flex justify-content-between align-items-center">
                <div>
                  <BsExclamationTriangleFill className="me-2" />
                  <strong>Danger Zone</strong>
                </div>
              </Card.Header>
              <Card.Body>
                <p>Be careful, these actions are irreversible.</p>
                <Button
                  variant="danger"
                  onClick={onDeleteTournament}
                  className="w-100"
                >
                  <BsTrash className="me-2" />
                  Delete This Tournament
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
