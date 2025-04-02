import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useState } from "react";
import { getEvent } from '../../model/api/apimodel';
import { EventList } from "../Events/EventList";
import { useAuth } from "../Login/useAuth";

export function LandingPage() {
    const { login, authorized } = useAuth();

    const [joinCode, setJoinCode] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);

    const navigate = useNavigate();

    const goToEvent = async () => {
        setShowError(false);
        if (joinCode && joinCode.length > 0)
        {
            try
            {
                const eventDetails = await getEvent(joinCode.toLowerCase());
                navigate(`/e/${eventDetails.event_id.toLowerCase()}`);
            }
            catch (e)
            {
                setShowError(true);
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
                    <div className="d-flex justify-content-left">
                        <InputGroup className="mb-3" style={{ maxWidth: '500px' }}>
                            <Form.Control 
                                placeholder="Enter event code"
                                value={joinCode} 
                                onChange={(e) => setJoinCode(e.target.value)}
                                aria-label="Event code"
                            />
                            <Button variant="primary" onClick={goToEvent}>
                                Join Event
                            </Button>
                        </InputGroup>
                    </div>
                    {showError ? (
                        <>
                            <p className="text-danger">
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
        </div>
    )
}