import { useState } from "react";
import { useParams } from "react-router";
import { TriangleAlert } from "lucide-react";
import { LoadingScreen } from "../../Login/LoadingScreen";
import { useEventDetailsQuery } from "../../../Hooks/useEventDetailsQuery";
import { PageContainer } from "@/Components/layout/PageContainer";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

export const EventlinkSync: React.FC = () => {
    const { event_id } = useParams();

    const { data, isError, isLoading} = useEventDetailsQuery(event_id!);

    const [pastedText, setPastedText] = useState<string>("");
    const [parsedPlayers, setParsedPlayers] = useState<string[]>([]);
    const [playerSubmissionStatus, setPlayerSubmissionStatus] = useState<Map<string, boolean>>(new Map());
    const [playersNotInEventlink, setPlayersNotInEventlink] = useState<string[]>([]);

    // Helper function to get sorted players for display
    const getSortedPlayersForDisplay = () => {
        // Group 1: Not submitted (from EventLink)
        const notSubmitted = displayPlayers
            .filter(player => !playerSubmissionStatus.get(player))
            .sort((a, b) => a.localeCompare(b));

        // Group 2: Not in EventLink
        const notInEventlink = displayPlayersNotInEventlink
            .sort((a, b) => a.localeCompare(b));

        // Group 3: Submitted
        const submitted = displayPlayers
            .filter(player => playerSubmissionStatus.get(player))
            .sort((a, b) => a.localeCompare(b));

        return {
            notSubmitted,
            notInEventlink,
            submitted
        };
    };

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    if (isError) {
        return (
            <PageContainer size="default">
                <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Try again later.</AlertDescription>
                </Alert>
            </PageContainer>
        )
    }

    if (!data) {
        return (
            <PageContainer size="default">
                <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertTitle>Event not found</AlertTitle>
                    <AlertDescription>Can't find this event. Check that the code you entered is correct.</AlertDescription>
                </Alert>
            </PageContainer>
        )
    }

    const players = data.participants.filter(a => a.role === "player");

    // Initialize display data - if no paste operation has happened yet,
    // show all existing players with "unknown" status
    const displayPlayers = parsedPlayers.length === 0 ? [] : parsedPlayers;
    const displayPlayersNotInEventlink = parsedPlayers.length === 0
        ? players.map(p => p.player_name.trim())
        : playersNotInEventlink;

    // Parse player names from the pasted text according to the specified format
    const parsePlayerNames = (text: string): string[] => {
        const lines = text.split("\n");
        const playerNames: string[] = [];
        let dashLineFound = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for the line with more than 10 dashes
            if (!dashLineFound && line.match(/^-{10,}$/)) {
                dashLineFound = true;
                continue;
            }

            // After dash line is found, collect player names until empty line
            if (dashLineFound) {
                if (line === "") {
                    break;
                }

                if (line) {
                    // Extract the player name (everything before the first number) and always trim
                    const playerNameMatch = line.match(/^(.*?)(?=\d|$)/);
                    const playerName = (playerNameMatch ? playerNameMatch[1] : line).trim();
                    playerNames.push(playerName);
                }
            }
        }

        return playerNames;
    };

    // Check which players have submitted decklists
    const checkSubmissions = () => {
        const parsedPlayerNames = parsePlayerNames(pastedText);
        setParsedPlayers(parsedPlayerNames);

        const statusMap = new Map<string, boolean>();

        parsedPlayerNames.forEach(playerName => {
            // If player is in the players array, they have submitted a decklist
            // Use case-insensitive comparison
            const hasSubmitted = players.some(p =>
                p.player_name.trim().toLowerCase() === playerName.trim().toLowerCase());
            statusMap.set(playerName.trim(), hasSubmitted);
        });

        setPlayerSubmissionStatus(statusMap);

        // Find players who have submitted decklists but are not in the EventLink list
        // Use case-insensitive comparison
        const notInEventlink = players
            .filter(p => !parsedPlayerNames.some(name =>
                name.trim().toLowerCase() === p.player_name.trim().toLowerCase()))
            .map(p => p.player_name.trim());

        setPlayersNotInEventlink(notInEventlink);
    };

    return (
      <PageContainer size="default">
        <h2 className="mb-6 text-2xl font-bold">EventLink Player Sync</h2>

        <Card>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="playerList">Paste EventLink Player List:</Label>
                    <Textarea
                        id="playerList"
                        rows={10}
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder={`EventLink            03/04/2025, 12:55
Report: Player List
Event: Pioneer (234asdf)
Event Date: 27/03/2025
Event Information: Pioneer

Player                  Table
------------------------------------------
John Doe
Jane Dawg
Helly R
Jean-Luc Picard
Luke Skywalker
Chandra Nalaar

EventLink - Copyright © 2025 - Wizards of the Coast LLC`}
                    />
                </div>

                <Button
                    onClick={checkSubmissions}
                    disabled={!pastedText.trim()}
                >
                    Check Submissions
                </Button>
            </CardContent>
        </Card>

        {(displayPlayers.length > 0 || displayPlayersNotInEventlink.length > 0) && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Submission Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player Name</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(() => {
                                const { notSubmitted, notInEventlink, submitted } = getSortedPlayersForDisplay();

                                return (
                                    <>
                                        {/* Group 1: Submitted */}
                                        {submitted.map(player => (
                                            <TableRow key={player}>
                                                <TableCell>{player}</TableCell>
                                                <TableCell>
                                                    <Badge variant="success">✓ Submitted</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Group 2: Not submitted */}
                                        {notSubmitted.map(player => (
                                            <TableRow key={player}>
                                                <TableCell>{player}</TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive">✗ Not Submitted</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Group 3: Not in EventLink */}
                                        {notInEventlink.map(player => (
                                            <TableRow key={`not-in-eventlink-${player}`}>
                                                <TableCell>{player}</TableCell>
                                                <TableCell>
                                                    {parsedPlayers.length > 0
                                                        ? <Badge variant="warning">⚠ Not registered in EventLink</Badge>
                                                        : <Badge variant="secondary">Unknown</Badge>}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                );
                            })()}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
      </PageContainer>
    );
};
