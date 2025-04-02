import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="container my-4">
      <h1 className="mb-4">About This Project</h1>
      
      <div className="mb-3">
        <Link to="/" className="btn btn-secondary">Back to Front page</Link>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <p>
            This tool was created by Jonas Swiatek to simplify decklist submission for Magic tournaments.
          </p>
          
          <p>
            The site provides a straightforward way to submit decklists electronically for Competitive REL 
            Magic tournaments that use MTG Companion/Eventlink. It's available for free to all players and TOs.
          </p>
          
          <p className="text-muted mt-4 small">
            Magic: The Gathering, MTG Companion, and Eventlink are trademarks of Wizards of the Coast LLC. 
            This site isn't affiliated with or endorsed by Wizards of the Coast.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
