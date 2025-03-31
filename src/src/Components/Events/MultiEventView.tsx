import { useQuery } from "react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getMultipleEventsRequest } from "../../model/api/apimodel";
import { Card, Spinner, Table } from "react-bootstrap";

export function MutliEventView() {
  const [searchParams, _] = useSearchParams();
  const { hub_name } = useParams();

  const {isLoading, data} = useQuery({
        queryKey: searchParams.getAll('id').map((id: string) => `event-${id}`),
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getMultipleEventsRequest(searchParams.getAll('id')),
      }
  );


  return (
    <div className="container mt-4">
      <div className='row mb-4'>
        <div className='col'>
          <h2 className='text-capitalize'>{hub_name}</h2>
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
                  <th scope='col'>Tournament</th>
                  <th scope='col'>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.map(event => (
                  <tr key={event.event_id}>
                    <td>
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={'/e/' + event.event_id} className="fw-semibold text-decoration-none">
                          {event.event_name}
                        </Link>
                        <span className="badge bg-primary">{event.role}</span>
                      </div>
                    </td>
                    <td>{new Date(event.event_date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-4">No events found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
