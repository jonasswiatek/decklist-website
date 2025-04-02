import { useQuery } from "react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getMultipleEventsRequest,
} from "../../model/api/apimodel";
import { Card, Spinner, Table } from "react-bootstrap";

export function MutliEventView() {
  const [searchParams] = useSearchParams();
  const { hub_name } = useParams();

  const eventIds = searchParams.getAll("id");

  const { isLoading, data } = useQuery({
    queryKey: ["eventId", eventIds],
    queryFn: () => getMultipleEventsRequest(eventIds),
  });

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-capitalize">{hub_name}</h2>
        </div>
      </div>

      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th scope="col">Tournament</th>
                  <th scope="col">Format</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).map((event) => (
                    <tr key={event.event_id}>
                      <td>
                        <div className="d-flex justify-content-between align-items-center">
                          <Link
                            to={"/e/" + event.event_id}
                            className="fw-semibold text-decoration-none"
                          >
                            {event.event_name}
                          </Link>
                          <span className="badge bg-primary">{event.role}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-capitalize">{event.format}</span>
                      </td>
                      <td>{new Date(event.event_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                {(!data || data?.length === 0) && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
