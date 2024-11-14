import '../../App.scss'
import { EventListItem } from '../../model/api/apimodel';
import { useQuery } from 'react-query';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export function EventList() : ReactElement {

  const { data } = useQuery({
    queryKey: ['my-events'],
    queryFn: () =>
      fetch('/api/events').then(async (res) =>
        await res.json() as EventListItem[],
      ),
  })
    
  return (
    <>
      <div className='row'>
          <div className='col'>
            <table className='table'>
              <thead>
                <tr>
                  <th scope='col'>Date</th>
                  <th scope='col'>Tournament</th>
                  <th scope='col'>Role</th>
                </tr>
              </thead>
              <tbody>
                {data?.map(event =>
                  <tr>
                    <th scope='row'>{event.event_date.toString()}</th>
                    <td><Link to={'/e/' + event.event_id}>{event.event_name}</Link></td>
                    <td>{event.role}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </>
  )
}