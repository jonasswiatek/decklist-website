import '../../App.scss'
import { EventListItem } from '../../model/api/apimodel';
import { useQuery } from 'react-query';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Card, Spinner, Table } from 'react-bootstrap';

export function EventList() : ReactElement {

  const { data, isLoading } = useQuery({
    queryKey: ['my-events'],
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
                  <th scope='col'>Date</th>
                  <th scope='col'>Tournament</th>
                  <th scope='col'>Role</th>
                </tr>
              </thead>
              <tbody>
                {data?.map(event => (
                  <tr key={event.event_id}>
                    <td>{new Date(event.event_date).toLocaleDateString()}</td>
                    <td><Link to={'/e/' + event.event_id} className="fw-semibold text-decoration-none">{event.event_name}</Link></td>
                    <td><span className="badge bg-primary">{event.role}</span></td>
                  </tr>
                ))}
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">No events found</td>
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