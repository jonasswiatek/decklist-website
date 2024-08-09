import { useEffect } from 'react'
import './App.scss'
import { useDecklistStore } from './store/deckliststore';
import { ContinueLogin, StartLogin } from './Components/Login/Login';
import React from 'react';

function App() {
  const { isLoggedIn, loadEvents, events, pendingLoginEmail, logout } = useDecklistStore();

  useEffect(() => {
    console.log("Run: " + isLoggedIn);
    if (isLoggedIn === null || isLoggedIn) {
      loadEvents();
    }
  }, [isLoggedIn]);

  function EventList() {
    return (
        events.map((event) => 
          <li>
            {event.event_name}
          </li>
        )
    )
  }

  if (isLoggedIn) {
    return (
    <>
      <EventList />
        <p>
        <button onClick={() => logout()}> 
            Log out
          </button>
        </p>
      </>
    )
  }
  else {
    if (pendingLoginEmail === null)
      return <StartLogin />
    else
      return <ContinueLogin />
  }

}

export default App
