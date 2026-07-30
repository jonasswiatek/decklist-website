import { getDecklistRequest, getEvent } from "../../model/api/apimodel";
import { LoadingScreen } from "../Login/LoadingScreen";
import { ArrowLeft, PlusCircle, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { useEventListQuery } from "../../Hooks/useEventListQuery";
import { useLibraryDecksQuery } from "../../Hooks/useLibraryDecksQuery";
import { useToast } from "../../Util/ToastContext";
import { PageContainer } from "@/Components/layout/PageContainer";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

export const LibraryOverview: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: library, isError: isDecksError, isLoading: isLibraryLoading } = useLibraryDecksQuery();
  const { data: events, isError: isEventsError, isLoading: isEventsLoading } = useEventListQuery();

  const onImportDeck = async (eventId: string) => {
    if (!eventId) return;
    try {
      const importedEvent = await getEvent(eventId);
      const importedDeck = await getDecklistRequest(eventId, null);
      if (importedEvent && importedDeck) {
        navigate('/library/deck', {
          state: {
            importedDeck: {
              format: importedEvent.format,
              decklist_text: importedDeck.decklist_text,
            }
          }
        });
      }
    } catch (e) {
      console.error("Failed to import deck", e);
      showToast("Failed to import deck", "danger");
    }
  };

  if (isLibraryLoading || isEventsLoading) {
      return <LoadingScreen />;
  }

  if (isDecksError || isEventsError) {
      return (
          <PageContainer size="lg">
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Error loading deck</AlertTitle>
              <AlertDescription>Please try again later.</AlertDescription>
            </Alert>
          </PageContainer>
      );
  }

  const pastEvents = events?.filter(event => event.role === "player");

  return (
    <PageContainer size="lg">
      <Button variant="link" className="mb-3 h-auto p-0" onClick={() => navigate('/')}>
        <ArrowLeft className="size-4" /> Back to Events
      </Button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold">Your saved decks</h2>
        <p className="text-muted-foreground">You can quickly reuse these decklists when signing up for events</p>
      </div>

      <div className="mb-6">
        {library && library.decks.length >= 20 ? (
          <Alert variant="warning">
            <TriangleAlert />
            <AlertDescription>
              You can only have a maximum of 20 saved decks. Please delete some decks before creating new ones.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => navigate('/library/deck')}>
              <PlusCircle className="size-4" /> Create New Deck
            </Button>
            <Select
              onValueChange={(value) => onImportDeck(value)}
              disabled={pastEvents?.length === 0}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Import from event" />
              </SelectTrigger>
              <SelectContent>
                {pastEvents?.map((event) => (
                  <SelectItem key={event.event_id} value={event.event_id}>
                    {event.event_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!library || library.decks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <h3 className="text-lg font-semibold">No decks found in your library</h3>
            <p className="text-sm text-muted-foreground">Create a deck to get started.</p>
            <Button onClick={() => navigate('/library/deck')}>
              <PlusCircle className="size-4" /> Create New Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deck Name</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Format</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {library.decks.map((deck) => (
                  <TableRow
                    key={deck.deck_id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/library/deck/${deck.deck_id}`)}
                    title="View deck"
                  >
                    <TableCell className="font-medium">{deck.deck_name}</TableCell>
                    <TableCell className="text-right">
                      {deck.has_warnings && <TriangleAlert className="ml-auto size-4 text-warning" />}
                    </TableCell>
                    <TableCell>{deck.format_name || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <p className="mt-4 text-sm italic text-muted-foreground">Decks that haven't been used for 90 days are automatically deleted</p>
    </PageContainer>
  );
}
