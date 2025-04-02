import '../../App.scss'
import { EventListItem } from '../../model/api/apimodel';
import { useQuery } from 'react-query';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Card, Spinner, Table } from 'react-bootstrap';

export function EventList() : ReactElement {

  const { data, isLoading } = useQuery({
    queryKey: ['my-events'],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: () =>
      fetch('/api/events').then(async (res) =>
        await res.json() as EventListItem[],
      ),
  })
    
  return (
    <div className="container mt-4">
      <div className='row mb-4'>
        <div className='col'>
          <h2>My Events</h2>
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