import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
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
        <div className="container">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <h1 className="display-5" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>Register your decklist</h1>
                </div>
                <div className="col-auto d-none d-md-block">
                    <Button variant="primary" onClick={() => navigate('/e/new')}>
                        Create Tournament
                    </Button>
                </div>
            </div>
            
            <div className="row mb-4">
                <div className="col">
                    <Card>
                        <Card.Body>
                            <Card.Title>Joining a Tournament?</Card.Title>
                            <Card.Text>
                                Enter event code, or scan QR code provided by the tournament to upload your decklist.
                            </Card.Text>
                            <InputGroup className="mb-3" style={{ maxWidth: '450px' }}>
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
                            {showError && (
                                <p className="text-danger">
                                    This code doesn't seem right. Check that you entered it correctly.
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>
            
            <div className="row">
                <div className="col">
                    {authorized ? (
                        <EventList />
                    ) : (
                        <Card>
                            <Card.Body>
                                <Card.Text>
                                    <a href="#" onClick={(e) => { e.preventDefault(); login(); }}>Log in</a> to see your tournaments.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}