import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getMultipleEventsRequest,
} from "../../model/api/apimodel";
import { PageContainer } from "@/Components/layout/PageContainer";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Spinner } from "@/Components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

export function MutliEventView() {
  const [searchParams] = useSearchParams();
  const { hub_name } = useParams();
  const navigate = useNavigate();

  const eventIds = searchParams.getAll("id");

  const { isLoading, data } = useQuery({
    queryKey: ["eventId", eventIds],
    queryFn: () => getMultipleEventsRequest(eventIds),
  });

  const sortedEvents = data?.toSorted(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  return (
    <PageContainer size="lg">
      <h2 className="mb-6 text-2xl font-bold capitalize">{hub_name}</h2>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-8" />
            </div>
          ) : !sortedEvents || sortedEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No events found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event) => (
                  <TableRow
                    key={event.event_id}
                    className="cursor-pointer"
                    onClick={() => navigate("/e/" + event.event_id)}
                  >
                    <TableCell>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{event.event_name}</span>
                        <Badge variant="secondary" className="capitalize">{event.role}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{event.format}</TableCell>
                    <TableCell>{new Date(event.event_date + "T00:00:00").toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
