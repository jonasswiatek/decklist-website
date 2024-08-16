import './App.scss'
import { AuthState, useDecklistStore } from './store/deckliststore';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { EventList } from './Components/Events/Events.tsx'
import { ReactNode, useEffect } from 'react'
import { EventView } from './Components/Events/Event.tsx'
import { LoggedIn } from './Components/Login/LoggedIn.tsx';
import { LandingPage } from './Components/LandingPage/LandingPage.tsx';
import {
  QueryClient,
  QueryClientProvider
} from 'react-query'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
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
  const { authState, checkAuth } = useDecklistStore();
  console.log(authState);
  
  useEffect(() => {
    if (authState == AuthState.Loading) {
      checkAuth();
    }
  }, [authState, checkAuth]);

  if (authState == AuthState.Loading) {
    return (<p>Loading...</p>)
  }

  return props.children
};


function App() {
  return (
    <div className="py-3 py-md-5">
      <div className='container'>
        <Loader>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Loader>
      </div>
    </div>
  );
}

export default App
