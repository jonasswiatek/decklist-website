import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

export function Tournament(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();

  return (
    <Container className="py-1">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header as="h5">Tournament Details</Card.Header>
            <Card.Body>
              <p>Displaying details for tournament ID: {tournament_id}</p>
              <p>Placeholder for tournament timer and controls.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
