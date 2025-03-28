import './App.scss'
import { useDecklistStore } from './store/deckliststore';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { EventView } from './Components/Events/EventView.tsx'
import { LoggedIn } from './Components/Login/LoggedIn.tsx';
import { LandingPage } from './Components/LandingPage/LandingPage.tsx';
import {
  QueryClient,
  QueryClientProvider
} from 'react-query'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { AuthProvider, useAuth } from './Components/Login/AuthContext.tsx';
import { CreateEvent } from './Components/Events/CreateEvent.tsx';
import { DeckView } from './Components/Events/DeckView.tsx';
import QRCodeView from './Components/Events/Views/QRCodeView';
import { DecklistHelp } from './Components/Help/DecklistHelp';

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/e/new",
    element:
      <LoggedIn>
        <CreateEvent />
      </LoggedIn>,
  },
  {
    path: "/e/:event_id",
    element:
      <EventView />
  },
  {
    path: "/e/:event_id/deck",
    element:
    <LoggedIn>
      <DeckView />
    </LoggedIn>,
  },
  {
    path: "/e/:eventId/qr",
    element: <QRCodeView />
  },
  {
    path: "/help",
    element: <DecklistHelp />
  },
]);

function App() {
  return (
    <>
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <NavBar />
        <div className="py-3 py-md-5 flex-grow-1">
          <div className='container'>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </div>
        </div>
      </div>
    </AuthProvider>
    </>
  );
}

function NavBar()
{
  const { login, authorized } = useAuth();
  const { logout } = useDecklistStore();

  return <><Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
    <Container>
      <Navbar.Brand href="/">decklist.lol</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/e/new">Create Event</Nav.Link>
        </Nav>
        <Nav>
        {authorized ? (
          <>
            <Nav.Link onClick={() => logout()}>Log out</Nav.Link>
          </>
          ) :
          (
            <>
              <Nav.Link onClick={() => login()}>Log in</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  <Container id='top-floating-container'>
  </Container>
</>
}

export default App
