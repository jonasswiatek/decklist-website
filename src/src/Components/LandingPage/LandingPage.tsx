import { useNavigate } from "react-router-dom";
import { useDecklistStore } from "../../store/deckliststore";
import Button from 'react-bootstrap/Button';
import { useState } from "react";
import { getEvent } from '../../model/api/apimodel';
import { useAuth } from "../Login/AuthContext";

export function LandingPage() {
    const { logout } = useDecklistStore();
    const { login, authorized } = useAuth();

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
                    <p>
                        Enter event code, or scan QR code provided by the tournament to upload your decklist.
                    </p>
                    <p>
                        <input type='text'  value={joinCode} onChange={(e) => setJoinCode(e.target.value)} /> <Button onClick={goToEvent}>Join Event</Button>
                    </p>
                    {showError ? (
                        <>
                            <p>
                                This code doesn't seem right. Check that you entered it correctly.
                            </p>
                        </>
                    ) : (<></>)}
                    <p>
                    <a onClick={() => login()}>Log in</a> to change or delete existing decklists.
                    </p>
                </div>
            </div>
            {authorized ? (
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