import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function DecklistHelp() {
  return (
    <div className="container my-4">
      <h1 className="mb-4">Decklist Formatting Guide</h1>
      
      <div className="mb-3">
        <Link to="/" className="btn btn-secondary">Back to Front page</Link>
      </div>
      
      <div className="row">
        <div className="col-12">
          <Card className="card mb-4">
            <Card.Header className="card-header">
              <h2 className="mb-0">Table of Contents</h2>
            </Card.Header>
            <Card.Body className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#sixty">Standard 60-Card Format</a></li>
                <li className="mb-2"><a href="#commander">Commander Format</a></li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card id="sixty" className="card mb-4">
        <Card.Header className="card-header">
          <h2>Standard 60-Card Format</h2>
        </Card.Header>
        <Card.Body className="card-body">
          <h4>Formatting requirements</h4>
          <ul>
            <li>Line format is N CardName. N is the number of cards.</li>
            <li>If the name is followed by a parenthesis with set name, this is ignored.</li>
            <li>Main and sideboard must be separated by a blank line</li>
            <li>Main board must be listed before the sideboard</li>
            <li>Lines with text like "mainboard" and "sideboard", or starting with // are ignored, but can be included for your own benefit</li>
          </ul>

          <h4>Split and MDFC cards</h4>
          <ul>
            <li><strong>Split cards</strong> (e.g., Wear // Tear) and <strong>MDFC cards</strong> (Modal Double-Faced Cards, e.g., Fable of the Mirror-Breaker // Reflection of Kiki-Jiki) can be entered in two ways:</li>
            <ul>
              <li>With both sides: <code>Wear // Tear</code> or <code>Fable of the Mirror-Breaker // Reflection of Kiki-Jiki</code></li>
              <li>With just the front side: <code>Wear</code> or <code>Fable of the Mirror-Breaker</code></li>
            </ul>
            <li>Both formats are accepted and will be recognized by the system.</li>
          </ul>

          <h5>Examples</h5>
          <pre className="p-3 rounded">
{`2 Wear // Tear
3 Fable of the Mirror-Breaker // Reflection of Kiki-Jiki
1 Valki, God of Lies // Tibalt, Cosmic Impostor
// Or simply:
2 Wear
3 Fable of the Mirror-Breaker
1 Valki, God of Lies
`}
          </pre>

          <h4>Formatting Example</h4>
          <pre className=" p-3 rounded">
{`4 Lightning Bolt
4 Goblin Guide
4 Monastery Swiftspear
3 Eidolon of the Great Revel

Sideboard
3 Smash to Smithereens
2 Blood Moon
2 Tormod's Crypt
...`}
          </pre>
        </Card.Body>
      </Card>

      <Card id="commander" className="card mb-4">
        <Card.Header className="card-header">
          <h2>Commander Format</h2>
        </Card.Header>
        <Card.Body className="card-body">
          <h4>Formatting requirements</h4>
          <ul>
            <li>The Commander(s) must be in a separate section from the main deck, separated by an empty line. Optionally you can write "Commander" above it.</li>
            <li>Companions must be listed after a Companion line</li>
            <li>Lines with text like mainboard and sideboard, or starting with // are ignored, but can be included for your own benefit</li>
          </ul>

          <h4>Formatting Example</h4>
          <pre className=" p-3 rounded">
{`Commander
Atraxa, Praetors' Voice

Companion
Jegantha, the Wellspring

Bloom Tender
Birds of Paradise
Eternal Witness
Counterspell
Cyclonic Rift
Cultivate
Demonic Tutor
Sol Ring
Arcane Signet
Smothering Tithe
Sylvan Library
Teferi, Time Raveler
Command Tower
Breeding Pool
Forest
Island
...`}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
}
