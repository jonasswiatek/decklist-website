import { useQueries } from "react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getEvent } from "../../model/api/apimodel";
import { Card, Table } from "react-bootstrap";

export function MutliEventView() {
  const [searchParams, _] = useSearchParams();
  const { hub_name } = useParams();

  const queries = useQueries(
    searchParams.getAll("id").map((id: string) => {
      return {
        queryKey: [`event-${id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getEvent(id!),
      };
    })
  );

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-capitalize">{hub_name}</h2>
        </div>
      </div>

      <Card>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th scope="col">Tournament</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => {
                const event = query.data;

                if (!event) return;

                return (
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
                    <td>{new Date(event.event_date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
