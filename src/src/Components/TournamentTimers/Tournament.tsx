import { ReactElement, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { BsPersonPlus, BsChevronDown, BsChevronUp, BsTrash } from 'react-icons/bs';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface AddManagerFormInputs {
  name: string;
  email: string;
}

export function Tournament(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();
  const { data: tournamentDetails, isLoading, error } = useTournamentDetails(tournament_id!);

  const [managers, setManagers] = useState<Manager[]>([]); // Mock data, replace with API data later
  const [showAddManagerForm, setShowAddManagerForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddManagerFormInputs>();

  const onAddManager: SubmitHandler<AddManagerFormInputs> = async (data) => {
    // Mock adding manager. Replace with API call.
    setManagers(prevManagers => [...prevManagers, { ...data, id: Date.now().toString() }]);
    reset();
    setShowAddManagerForm(false);
  };

  const onRemoveManager = async (managerId: string) => {
    // Mock removing manager. Replace with API call.
    if (window.confirm("Are you sure you want to remove this manager?")) {
      setManagers(prevManagers => prevManagers.filter(manager => manager.id !== managerId));
    }
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

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">
          Error loading tournament details: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <Row className="mb-3">
        <Col>
          <h2>Tournament: {tournamentDetails?.tournament_name || tournament_id}</h2>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3 mb-md-0">
          <Card>
            <Card.Header as="h5">Timers</Card.Header>
            <Card.Body>
              <p>List of timers for this tournament will be displayed here.</p>
              <ul>
                <li>Round 1 Timer</li>
                <li>Break Timer</li>
                <li>Round 2 Timer</li>
              </ul>
              {/* Placeholder for timer controls and display */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header
              onClick={() => setShowAddManagerForm(!showAddManagerForm)}
              style={{ cursor: 'pointer' }}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <BsPersonPlus className="me-2" />
                <strong>Add Manager</strong>
              </div>
              {showAddManagerForm ? <BsChevronUp /> : <BsChevronDown />}
            </Card.Header>
            {showAddManagerForm && (
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
            )}
          </Card>

          <Card>
            <Card.Header as="h5">Current Managers</Card.Header>
            <Card.Body>
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
                <p>No managers assigned to this tournament yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
