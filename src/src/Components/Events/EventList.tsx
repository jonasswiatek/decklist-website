import '../../App.scss'
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Table } from 'react-bootstrap';
import { useEventListQuery } from '../../Hooks/useEventListQuery';

export function EventList() : ReactElement {
  const { data, isLoading } = useEventListQuery();
    
  return (
    <Table hover responsive>
      <thead>
        <tr>
          <th scope='col'>Tournament</th>
          <th scope='col'>Date</th>
        </tr>
      </thead>
      <tbody>
        {isLoading && (
          <tr>
            <td colSpan={2} className="text-center py-4">
              <Spinner animation="border" role="status" size="sm" className="me-2" />
              <span>Loading events...</span>
            </td>
          </tr>
        )}
        {!isLoading && data?.map(event => (
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
        {!isLoading && data?.length === 0 && (
          <tr>
            <td colSpan={2} className="text-center">No events found</td>
          </tr>
        )}
      </tbody>
    </Table>
  )
}