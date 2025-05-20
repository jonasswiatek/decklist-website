import { useNavigate } from "react-router-dom";

export function Tools() {
    const navigate = useNavigate();

    const handleTournamentTimersClick = () => {
        navigate("/timers");
    };

    return (
        <div className="container text-center mt-5">
            <div className="mt-4">
                <button
                    className="btn btn-dark btn-lg d-flex flex-column align-items-center p-3"
                    onClick={handleTournamentTimersClick}
                    style={{ minWidth: '150px', minHeight: '100px' }} // Added style for explicit sizing
                >
                    <span style={{ fontSize: '2rem' }}>⏰</span> {/* Icon placeholder */}
                    <span className="mt-1">Tournament Timers</span>
                </button>
            </div>
        </div>
    )
}