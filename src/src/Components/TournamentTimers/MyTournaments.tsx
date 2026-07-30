import React from 'react';
import { useUserTournaments } from '../../Hooks/useTournamentTimers';
import { UserTournamentsResponseItem } from '../../model/api/tournamentTimers';
import { LoadingScreen } from '../Login/LoadingScreen';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthQuery } from '../../Hooks/useAuthQuery';
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

const MyTournaments: React.FC = () => {
  const { authorized } = useAuthQuery();
  const { data, isLoading, isError } = useUserTournaments(authorized || false);
  const navigate = useNavigate();

  if (isLoading) {
      return (
          <LoadingScreen />
      )
  }

  if (isError) {
    return (
      <PageContainer size="lg">
        <Alert variant="destructive">
          <AlertDescription>
            Error fetching tournaments. Please try again later.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="lg">
      <div className="mb-6">
        <div className="mb-3">
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => navigate('/tools')}
          >
            <ArrowLeft className="size-4" /> Tools
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Round timers for your tournaments</h1>
        <p className="mt-2 text-lg text-muted-foreground">Synchronized with WebSockets and judge access via mobile.</p>
      </div>

      <div className="mb-4">
        {!authorized ? (
          <Alert>
            <AlertDescription className="w-full items-center gap-3 text-center">
              <p>Please log in to view your tournaments.</p>
              <Button onClick={() => navigate('/login?return=/timers')}>
                Log In
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.tournaments && data.tournaments.length > 0 ? (
                data.tournaments.map((tournament: UserTournamentsResponseItem) => (
                  <TableRow key={tournament.tournament_id}>
                    <TableCell>
                      <Link
                        to={`/timers/${tournament.tournament_id}`}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {tournament.tournament_name}
                      </Link>
                    </TableCell>
                    <TableCell><Badge>{tournament.role}</Badge></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="py-4 text-center text-muted-foreground">
                    You currently have no tournament timers set up.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {authorized && (
        <div className="mt-4 flex justify-end">
          <Button onClick={() => navigate('/timers/new')}>
            Create New Tournament
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default MyTournaments;
