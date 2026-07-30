import { Link } from 'react-router-dom';
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";

export function About() {
  return (
    <PageContainer size="default">
      <h1 className="text-3xl font-bold tracking-tight">About This Project</h1>

      <div className="mt-4">
        <Button asChild variant="secondary">
          <Link to="/">Back to Front page</Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            This tool was created by Jonas Swiatek to simplify decklist submission for Magic tournaments.
          </p>

          <p>
            The site provides a straightforward way to submit decklists electronically for Competitive REL
            Magic tournaments that use MTG Companion/Eventlink. It's available for free to all players and TOs.
          </p>

          <p className="pt-2 text-sm">
            Magic: The Gathering, MTG Companion, and Eventlink are trademarks of Wizards of the Coast LLC.
            This site isn't affiliated with or endorsed by Wizards of the Coast.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
