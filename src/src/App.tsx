import './App.scss'
import { useDecklistStore } from './store/deckliststore';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { EventList } from './Components/Events/Events.tsx'
import { LoggedIn } from './Util/LoggedIn.tsx';
import { ReactNode, useEffect } from 'react'
import { LoginScreen } from './Components/Login/Login.tsx';
import { EventView } from './Components/Events/Event.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginScreen />,
  },
  {
    path: "/events",
    element:
      <LoggedIn>
        <EventList />
      </LoggedIn>,
  },
  {
    path: "/events/:event_id",
    element:
      <LoggedIn>
        <EventView />
      </LoggedIn>,
  },

]);

const Loader = (props: {children: ReactNode}) => {
  const { isLoggedIn, loadEvents } = useDecklistStore();

  useEffect(() => {
    if (isLoggedIn === null || isLoggedIn) {
      loadEvents();
    }
  }, [isLoggedIn]);

  if (isLoggedIn != null)
    return props.children;
};


function App() {
  return (
    <Loader>
      <RouterProvider router={router} />
    </Loader>
  );
}

export default App
