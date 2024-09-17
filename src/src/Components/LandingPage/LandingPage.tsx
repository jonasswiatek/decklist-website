import { useNavigate } from "react-router-dom";
import { AuthState, useDecklistStore } from "../../store/deckliststore";
import Button from 'react-bootstrap/Button';
import { useState } from "react";
import { getEvent } from '../../model/api/apimodel';

export function LandingPage() {
    const { authState, logout } = useDecklistStore();
    const [joinCode, setJoinCode] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);

    const navigate = useNavigate();

    const goToEvent = async () => {
        setShowError(false);
        if (joinCode && joinCode.length > 0)
        {
            const eventDetails = await getEvent(joinCode);
            if (!eventDetails) {
                //Show alert
                setShowError(true)
            }
            else {
                navigate(`/events/${joinCode}`);
            }
        }
    };

    return (
        <>
            <div className="row">
                <div className="col">
                    <p>Welcome</p>
                    <p>
                        To upload a decklist, scan the QR code provided by your tournament organiser or enter the code provided by the tournament below.
                    </p>
                    <p>
                        <input type='text'  value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                    </p>
                    {showError ? (
                        <>
                            <p>
                                This code doesn't seem right. Check that you entered it correctly.
                            </p>
                        </>
                    ) : (<></>)}
                    <p>
                        <Button onClick={goToEvent}>Join Event</Button>
                    </p>
                    <p>
                        If you wish to collect decklists for your own event, choose "My Tournaments" in the menu at the top.
                    </p>
                </div>
            </div>
            {authState === AuthState.Authorized ? (
                <div className="row">
                    <div className="col">
                        <button onClick={() => logout()}>
                            Log out
                        </button>
                    </div>
                </div>
            ) : (<></>)}
        </>
    )
}