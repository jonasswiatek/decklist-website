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

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

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
      <EventView />
  },
]);

const Loader = (props: {children: ReactNode}) => {
  const { authState, checkAuth } = useDecklistStore();
  
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
  const { authState, logout } = useDecklistStore();

  return (
    <>
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">decklist.lol</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/events">Joined Tournaments</Nav.Link>
            <Nav.Link href="#features">My Tournaments</Nav.Link>
          </Nav>
          <Nav>
          {authState === AuthState.Authorized ? (
            <>
              <Nav.Link onClick={() => logout()}>Log out</Nav.Link>
            </>
            ) :
            (
              <>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <div className="py-3 py-md-5">
      <div className='container'>
        <Loader>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Loader>
      </div>
    </div>
    </>
  );
}

export default App
