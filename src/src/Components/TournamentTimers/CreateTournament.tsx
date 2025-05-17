import { ReactElement } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { BsArrowLeft } from 'react-icons/bs';
import { createTournament } from '../../model/api/tournamentTimers'; 
import { HandleValidation } from '../../Util/Validators'; 

// Define the expected input type for the form
type Inputs = {
  tournament_name: string;
};

export function CreateTournament(): ReactElement {
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<Inputs>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    clearErrors(); // Clear previous errors
    try {
      const createdTournament = await createTournament({ tournament_name: data.tournament_name });
      navigate('/timers/' + createdTournament.tournament_id); 
    } catch (e) {
      HandleValidation(setError, e); 
    } 
  };

  return (
    <Container className="py-1">
      <div className="mb-3">
        <Button
          variant="link"
          className="text-decoration-none ps-0"
          onClick={() => navigate('/timers')}
        >
          <BsArrowLeft className="me-1" /> Back to Tournament Timers
        </Button>
      </div>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="mb-4">
            <Card.Header as="h5" className="bg-dark text-white">
              Create New Tournament Timer
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}> 
                {errors.root?.serverError && (
                  <Alert variant="danger">
                    {errors.root.serverError.message}
                  </Alert>
                )}
                <Form.Group className="mb-3" controlId="tournament_name">
                  <Form.Label>Tournament Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter tournament name (e.g., Modern RCQ Q1)"
                    isInvalid={!!errors.tournament_name}
                    {...register("tournament_name", { required: "Tournament name is required" })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tournament_name?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : 'Create Tournament Timer'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
