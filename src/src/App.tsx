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
import { AuthProvider } from './Components/Login/AuthContext.tsx';
import { CreateEvent } from './Components/Events/CreateEvent.tsx';
import { DeckView } from './Components/Events/DeckView.tsx';
import { QRCodeView } from './Components/Events/Views/QRCodeView';
import { DecklistHelp } from './Components/Help/DecklistHelp';
import { PrivacyHelp } from './Components/Help/PrivacyPolicy';
import { TermsAndServicesHelp } from './Components/Help/TermsAndServices';
import { MutliEventView } from './Components/Events/MultiEventView.tsx';
import { useAuth } from './Components/Login/useAuth.ts';
import { ContributeHelp } from './Components/Help/Contribute.tsx';
import { About } from './Components/Help/About.tsx';
import { EventlinkSync } from './Components/Events/Views/EventlinkSync.tsx';
import { ScrollToTop } from './Util/ScrollToTop.tsx';

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    
    element: 
      <ScrollToTop>
        <LandingPage />
      </ScrollToTop>,
  },
  {
    path: "/multi/:hub_name",
    element:
      <ScrollToTop>
        <MutliEventView/>
      </ScrollToTop>,
  },
  {
    path: "/e/new",
    element:
      <LoggedIn>
        <ScrollToTop>
          <CreateEvent />
        </ScrollToTop>
      </LoggedIn>,
  },
  {
    path: "/e/:event_id",
    element:
      <ScrollToTop>
        <EventView />
      </ScrollToTop>
  },
  {
    path: "/e/:event_id/deck",
    element:
    <LoggedIn>
      <ScrollToTop>
        <DeckView />
      </ScrollToTop>
    </LoggedIn>,
  },
  {
    path: "/e/:event_id/sync/eventlink",
    element:
    <LoggedIn>
      <ScrollToTop>
        <EventlinkSync />
      </ScrollToTop>
    </LoggedIn>,
  },
  {
    path: "/e/:eventId/qr",
    element: 
      <ScrollToTop>
        <QRCodeView />
      </ScrollToTop>,
  },
  {
    path: "/help/decklist",
    element: 
      <ScrollToTop>
        <DecklistHelp />
      </ScrollToTop>
  },
  {
    path: "/help/privacy",
    element:
      <ScrollToTop>
        <PrivacyHelp />
      </ScrollToTop>
  },
  {
    path: "/help/terms-and-services",
    element:
      <ScrollToTop>
        <TermsAndServicesHelp />
      </ScrollToTop>
  },
  {
    path: "/help/contribute",
    element:
      <ScrollToTop>
        <ContributeHelp />
      </ScrollToTop>
  },
  {
    path: "/help/about",
    element:
      <ScrollToTop>
        <About />
      </ScrollToTop>
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
        <Footer />
      </div>
    </AuthProvider>
    </>
  );
}

function NavBar()
{
  const { login, authorized } = useAuth();
  const { logout } = useDecklistStore();

  const isQRCodeRoute = window.location.pathname.match(/\/e\/.*\/qr$/i) !== null;
  
  if (isQRCodeRoute) {
    return null;
  }

  return <>
    <Navbar collapseOnSelect expand="md" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">decklist.lol</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/e/new">Create Tournament</Nav.Link>
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

function Footer() {
  const isQRCodeRoute = window.location.pathname.match(/\/e\/.*\/qr$/i) !== null;
  
  if (isQRCodeRoute) {
    return null;
  }

  return (
    <footer className="py-3 mt-auto">
      <Container className="text-center">
        <div className="mt-2">
          Brought to you with love, for free and with no guarantees.
        </div>

        <Nav className="justify-content-center small">
          <Nav.Link href="/help/privacy" className="text-reset text-decoration-none">Privacy Policy</Nav.Link>
          <Nav.Link href="/help/terms-and-services" className="text-reset text-decoration-none">Terms of Service</Nav.Link>
          <Nav.Link href="/help/contribute" className="text-reset text-decoration-none">Contribute</Nav.Link>
          <Nav.Link href="/help/About" className="text-reset text-decoration-none">About</Nav.Link>
        </Nav>
      </Container>
    </footer>
  );
}

export default App
