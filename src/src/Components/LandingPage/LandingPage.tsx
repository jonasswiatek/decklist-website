import { Link } from "react-router-dom";
import { AuthState, useDecklistStore } from "../../store/deckliststore";

export function LandingPage() {
    const { authState, logout } = useDecklistStore();

    return (
        <>
            <div className="row">
                <div className="col">
                    <p>Welcome</p>
                    <Link to="/events">My Events</Link>
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