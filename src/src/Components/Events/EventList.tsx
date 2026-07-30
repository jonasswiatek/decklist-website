import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventListQuery } from '../../Hooks/useEventListQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Spinner } from '@/Components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

export function EventList(): ReactElement {
  const { data, isLoading } = useEventListQuery();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your tournaments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Spinner className="size-5" />
            <span>Loading events...</span>
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No events found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((event) => (
                <TableRow
                  key={event.event_id}
                  className="cursor-pointer"
                  onClick={() => navigate('/e/' + event.event_id)}
                >
                  <TableCell>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{event.event_name}</span>
                      <Badge variant="secondary" className="capitalize">{event.role}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(event.event_date + 'T00:00:00').toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
