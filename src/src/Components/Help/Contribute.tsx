import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function ContributeHelp() {
  return (
    <div className="container my-4">
      <h1 className="mb-4">Feature Requests Guidelines</h1>
      
      <div className="mb-3">
        <Link to="/" className="btn btn-secondary">Back to Front page</Link>
      </div>
      
      <Card className="card mb-4">
        <Card.Body className="card-body">
          <p>
            You are welcome to request features for this website. However, before submitting a request, 
            please understand that this project is built with specific constraints and goals in mind.
          </p>

          <h3 className="mt-4">Technical Limitations & System Constraints</h3>
          <p>
            This website is engineered to keep hosting costs at an absolute minimum. This design 
            decision has several implications:
          </p>
          <ul>
            <li>
              The data structure uses Amazon DynamoDB, which makes certain operations expensive 
              for large events.
            </li>
            <li>
              Features such as the ability to change dates and names of events after creation 
              cannot be implemented due to these cost constraints.
            </li>
            <li>
              A user can only own 25 events at a given time.
            </li>
            <li>
              There can only be 300 players in an event.
            </li>
          </ul>
          <p>
            These restrictions may be adjusted in the future as the cost structure of the project becomes clearer.
          </p>

          <h3 className="mt-4">Privacy & Project Scope</h3>
          <p>
            User data is stored and encrypted in a specific way to minimize GDPR compliance concerns, and 
            the project has a focused scope:
          </p>
          <ul>
            <li>
              Features that would involve processing personal data in new ways (such as emailing participants) 
              are outside the scope of what can be implemented.
            </li>
            <li>
              Metagame analysis features will not be implemented as they require significant 
              ongoing maintenance and development resources.
            </li>
            <li>
              The focus of this website is on providing core functionality for deck registration 
              and tournament management with minimal overhead.
            </li>
          </ul>

          <h3 className="mt-4">Contributing to the Project</h3>
          <p>
            This React application is open source and available on <a href="https://github.com/jonasswiatek/decklist-website" target="_blank" rel="noopener noreferrer">GitHub</a>. If you're a developer and would like to contribute:
          </p>
          <ul>
            <li>
              You are welcome to fork the repository and implement features yourself.
            </li>
            <li>
              Pull requests with new features or improvements are encouraged and will be reviewed.
            </li>
            <li>
              Contributing directly allows you to implement features that might otherwise be outside the current priorities.
            </li>
            <li>
              <strong>Developers with React and HTML/CSS design experience are especially welcome</strong> to contribute, as frontend development and UI/UX improvements are not my core competencies.
            </li>
            <li>
              Currently, only the React frontend is publicly available. While I don't have plans to release the C#/AWS backend as open source, I'm willing to provide access to developers with C# and AWS experience who want to contribute to backend features.
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}
