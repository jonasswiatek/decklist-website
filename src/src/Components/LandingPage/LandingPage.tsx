import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { useState } from "react";
import { getEvent } from '../../model/api/apimodel';
import { useAuth } from "../Login/AuthContext";
import { EventList } from "../Events/EventList";
import { Footer } from '../Footer/Footer';

export function LandingPage() {
    const { login, authorized } = useAuth();

    const [joinCode, setJoinCode] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);

    const navigate = useNavigate();

    const goToEvent = async () => {
        setShowError(false);
        if (joinCode && joinCode.length > 0)
        {
            const eventDetails = await getEvent(joinCode.toLowerCase());
            if (!eventDetails) {
                //Show alert
                setShowError(true)
            }
            else {
                navigate(`/e/${joinCode.toLowerCase()}`);
            }
        }
    };

    return (
        <div className="d-flex flex-column">
            <div className="row mb-4">
                <div className="col">
                    <p>
                        Enter event code, or scan QR code provided by the tournament to upload your decklist.
                    </p>
                    <p>
                        <input type='text' value={joinCode} onChange={(e) => setJoinCode(e.target.value)} /> <Button onClick={goToEvent}>Join Event</Button>
                    </p>
                    {showError ? (
                        <>
                            <p>
                                This code doesn't seem right. Check that you entered it correctly.
                            </p>
                        </>
                    ) : (<></>)}
                </div>
            </div>
            <div className="row mb-4">
                <div className="col">
                    <p>
                    {authorized ? (
                        <>
                            <EventList />
                        </>
                    ) : (
                        <>
                            <a onClick={() => login()}>Log in</a> to change or delete existing decklists.
                        </>
                    )}
                    </p>
                </div>
            </div>
            {/* Footer without mt-auto to show it immediately after content */}
            <div className="mb-4">
                <Footer />
            </div>
        </div>
    )
}