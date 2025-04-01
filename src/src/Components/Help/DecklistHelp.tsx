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
            <div className="card-header">
              <h2 className="mb-0">Table of Contents</h2>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#sixty">Standard 60-Card Format</a></li>
                <li className="mb-2"><a href="#commander">Commander Format</a></li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <div id="sixty" className="card mb-4">
        <div className="card-header">
          <h2>Standard 60-Card Format</h2>
        </div>
        <div className="card-body">
          <h4>Formatting requirements</h4>
          <ul>
            <li>Line format is N CardName. N is the number of cards.</li>
            <li>If the name is followed by a parenthesis with set name, this is ignored.</li>
            <li>Main and sideboard must be separated by a blank line</li>
            <li>Main board must be listed before the sideboard</li>
            <li>Lines with text like "mainboard" and "sideboard", or starting with // are ignored, but can be included for your own benefit</li>
          </ul>

          <h4>Formatting Example</h4>
          <pre className=" p-3 rounded">
{`4 Lightning Bolt
4 Goblin Guide
4 Monastery Swiftspear
3 Eidolon of the Great Revel

3 Smash to Smithereens
2 Blood Moon
2 Tormod's Crypt
...`}
          </pre>
        </div>
      </div>

      <div id="commander" className="card mb-4">
        <div className="card-header">
          <h2>Commander Format</h2>
        </div>
        <div className="card-body">
          <h4>Formatting requirements</h4>
          <ul>
            <li>The Commander(s) must be in a separate section from the main deck, separated by an empty line.</li>
            <li>Lines with text like mainboard and sideboard, or starting with // are ignored, but can be included for your own benefit</li>
          </ul>

          <h4>Formatting Example</h4>
          <pre className=" p-3 rounded">
{`1 Atraxa, Praetors' Voice

1 Bloom Tender
1 Birds of Paradise
1 Eternal Witness
1 Counterspell
1 Cyclonic Rift
1 Cultivate
1 Demonic Tutor
1 Sol Ring
1 Arcane Signet
1 Smothering Tithe
1 Sylvan Library
1 Teferi, Time Raveler
1 Command Tower
1 Breeding Pool
3 Forest
2 Island
...`}
          </pre>
        </div>
      </div>
    </div>
  );
}
