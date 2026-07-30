import { Link } from 'react-router-dom';
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export function DecklistHelp() {
  return (
    <PageContainer size="default">
      <h1 className="text-3xl font-bold tracking-tight">Decklist Formatting Guide</h1>

      <div className="mt-4">
        <Button asChild variant="secondary">
          <Link to="/">Back to Front page</Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li><a href="#sixty" className="text-primary underline-offset-4 hover:underline">Standard 60-Card Format</a></li>
            <li><a href="#commander" className="text-primary underline-offset-4 hover:underline">Commander Format</a></li>
          </ul>
        </CardContent>
      </Card>

      <Card id="sixty" className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Standard 60-Card Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <h4 className="text-lg font-semibold text-foreground">Formatting requirements</h4>
          <ul className="list-disc space-y-1 pl-6">
            <li>Line format is N CardName. N is the number of cards.</li>
            <li>If the name is followed by a parenthesis with set name, this is ignored.</li>
            <li>Main and sideboard must be separated by a blank line</li>
            <li>Main board must be listed before the sideboard</li>
            <li>Lines with text like "mainboard" and "sideboard", or starting with // are ignored, but can be included for your own benefit</li>
          </ul>

          <h4 className="text-lg font-semibold text-foreground">Split and MDFC cards</h4>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong className="text-foreground">Split cards</strong> (e.g., Wear // Tear) and <strong className="text-foreground">MDFC cards</strong> (Modal Double-Faced Cards, e.g., Fable of the Mirror-Breaker // Reflection of Kiki-Jiki) can be entered in two ways:</li>
            <ul className="list-disc space-y-1 pl-6">
              <li>With both sides: <code className="rounded bg-muted px-1 py-0.5 text-foreground">Wear // Tear</code> or <code className="rounded bg-muted px-1 py-0.5 text-foreground">Fable of the Mirror-Breaker // Reflection of Kiki-Jiki</code></li>
              <li>With just the front side: <code className="rounded bg-muted px-1 py-0.5 text-foreground">Wear</code> or <code className="rounded bg-muted px-1 py-0.5 text-foreground">Fable of the Mirror-Breaker</code></li>
            </ul>
            <li>Both formats are accepted and will be recognized by the system.</li>
          </ul>

          <h5 className="font-semibold text-foreground">Examples</h5>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm text-foreground">
{`2 Wear // Tear
3 Fable of the Mirror-Breaker // Reflection of Kiki-Jiki
1 Valki, God of Lies // Tibalt, Cosmic Impostor
// Or simply:
2 Wear
3 Fable of the Mirror-Breaker
1 Valki, God of Lies
`}
          </pre>

          <h4 className="text-lg font-semibold text-foreground">Formatting Example</h4>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm text-foreground">
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
        </CardContent>
      </Card>

      <Card id="commander" className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Commander Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <h4 className="text-lg font-semibold text-foreground">Formatting requirements</h4>
          <ul className="list-disc space-y-1 pl-6">
            <li>The Commander(s) must be in a separate section from the main deck, separated by an empty line. Optionally you can write "Commander" above it.</li>
            <li>Companions must be listed after a Companion line</li>
            <li>Lines with text like mainboard and sideboard, or starting with // are ignored, but can be included for your own benefit</li>
          </ul>

          <h4 className="text-lg font-semibold text-foreground">Formatting Example</h4>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm text-foreground">
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
        </CardContent>
      </Card>
    </PageContainer>
  );
}
