import { useEffect } from 'react'
import './App.scss'
import { useDecklistStore } from './store/deckliststore';
import { ContinueLogin, StartLogin } from './Components/Login/Login';

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
  
  let component;
  if (isLoggedIn) {
    component = <>
      <EventList />
      <p>
      <button onClick={() => logout()}> 
          Log out
        </button>
      </p>
    </>;
  }
  else {
    if (pendingLoginEmail === null)
      component = <StartLogin />
    else
    component = <ContinueLogin />
  }


  return component

}

export default App
