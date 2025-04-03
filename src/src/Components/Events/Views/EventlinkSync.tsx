import { useState } from "react";
import { useParams } from "react-router";
import { EventDetails, getEvent } from "../../../model/api/apimodel";
import { LoadingScreen } from "../../Login/LoadingScreen";
import { useQuery } from "react-query";

export const EventlinkSync: React.FC = () => {
    const { event_id } = useParams();

    const { data, error, isLoading} = useQuery<EventDetails>({
        queryKey: [`event-${event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getEvent(event_id!),
    });
        
    const [pastedText, setPastedText] = useState<string>("");
    const [parsedPlayers, setParsedPlayers] = useState<string[]>([]);
    const [playerSubmissionStatus, setPlayerSubmissionStatus] = useState<Map<string, boolean>>(new Map());
    const [playersNotInEventlink, setPlayersNotInEventlink] = useState<string[]>([]);

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    if(error === "error") {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Error. Try again later.</p>
                    </div>
                </div>
            </>
        )
    }

    if(!data) {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Can't find this event. Check that the code you entered is correct.</p>
                    </div>
                </div>
            </>
        )
    }

    const players = data.participants.filter(a => a.role === "player");
    
    // Initialize display data - if no paste operation has happened yet, 
    // show all existing players with "unknown" status
    const displayPlayers = parsedPlayers.length === 0 ? [] : parsedPlayers;
    const displayPlayersNotInEventlink = parsedPlayers.length === 0 
        ? players.map(p => p.player_name) 
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
                    playerNames.push(line);
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
                p.player_name.toLowerCase() === playerName.toLowerCase());
            statusMap.set(playerName, hasSubmitted);
        });
        
        setPlayerSubmissionStatus(statusMap);
        
        // Find players who have submitted decklists but are not in the EventLink list
        // Use case-insensitive comparison
        const notInEventlink = players
            .filter(p => !parsedPlayerNames.some(name => 
                name.toLowerCase() === p.player_name.toLowerCase()))
            .map(p => p.player_name);
        
        setPlayersNotInEventlink(notInEventlink);
    };
    
    return (
        <div className="eventlink-sync-container">
            <h2>EventLink Player Sync</h2>
            
            <div className="form-group">
                <label htmlFor="playerList">Paste EventLink Player List:</label>
                <textarea 
                    id="playerList"
                    className="form-control"
                    rows={10}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="EventLink            03/04/2025, 12:55
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

EventLink - Copyright © 2025 - Wizards of the Coast LLC"
                />
            </div>
            
            <button 
                className="btn btn-primary mt-3 mb-4"
                onClick={checkSubmissions}
                disabled={!pastedText.trim()}
            >
                Check Submissions
            </button>
            
            {(displayPlayers.length > 0 || displayPlayersNotInEventlink.length > 0) && (
                <div className="results-table">
                    <h3>Submission Status</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Player Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Players from EventLink */}
                            {displayPlayers.map(player => (
                                <tr key={player}>
                                    <td>{player}</td>
                                    <td>
                                        {playerSubmissionStatus.get(player) 
                                            ? <span className="text-success">✓ Submitted</span> 
                                            : <span className="text-danger">✗ Not Submitted</span>}
                                    </td>
                                </tr>
                            ))}
                            
                            {/* Players with decklists but not in EventLink or initial list */}
                            {displayPlayersNotInEventlink.map(player => (
                                <tr key={`not-in-eventlink-${player}`}>
                                    <td>{player}</td>
                                    <td>
                                        {parsedPlayers.length > 0 
                                            ? <span className="text-warning">⚠ Not registered in EventLink</span>
                                            : <span className="text-secondary">Unknown</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};