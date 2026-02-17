import './App.scss'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import { EventView } from './Components/Events/EventView.tsx'
import { ProtectedLayout } from './Components/Login/LoggedIn.tsx';
import { LandingPage } from './Components/LandingPage/LandingPage.tsx';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { CreateEvent } from './Components/Events/CreateEvent.tsx';
import { DeckView } from './Components/Events/DeckView.tsx';
import { QRCodeView } from './Components/Events/Views/QRCodeView';
import { DecklistHelp } from './Components/Help/DecklistHelp';
import { PrivacyHelp } from './Components/Help/PrivacyPolicy';
import { TermsAndServicesHelp } from './Components/Help/TermsAndServices';
import { MutliEventView } from './Components/Events/MultiEventView.tsx';
import { ContributeHelp } from './Components/Help/Contribute.tsx';
import { About } from './Components/Help/About.tsx';
import { EventlinkSync } from './Components/Events/Views/EventlinkSync.tsx';
import { LibraryDeckEditorPage } from './Components/DeckLibrary/LibraryDeckEditorPage.tsx';
import { LibraryOverview } from './Components/DeckLibrary/LibraryOverview.tsx';
import { PrintDecklistView } from './Components/Events/Views/PrintDecklistView.tsx';
import MyTournaments from './Components/TournamentTimers/MyTournaments.tsx';
import { CreateTournament } from './Components/TournamentTimers/CreateTournament.tsx';
import { TournamentWrapper } from './Components/TournamentTimers/Tournament.tsx';
import { TournamentPublicViewWrapper } from './Components/TournamentTimers/TournamentPublicView.tsx';
import { Tools } from './Components/LandingPage/Tools.tsx';
import { LoginScreen } from './Components/Login/Login.tsx';
import { useAuthQuery } from './Hooks/useAuthQuery.ts';
import { useLogoutMutation } from './Hooks/useAuthMutations.ts';

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    element: <><ScrollRestoration /><Outlet /></>,
    children: [
      // --- Public routes ---
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginScreen /> },
      { path: "/multi/:hub_name", element: <MutliEventView /> },
      { path: "/e/:event_id", element: <EventView /> },
      { path: "/e/:eventId/qr", element: <QRCodeView /> },
      { path: "/tools", element: <Tools /> },
      { path: "/timers", element: <MyTournaments /> },
      { path: "/timers/:tournament_id/view", element: <TournamentPublicViewWrapper /> },
      { path: "/help/decklist", element: <DecklistHelp /> },
      { path: "/help/privacy", element: <PrivacyHelp /> },
      { path: "/help/terms-and-services", element: <TermsAndServicesHelp /> },
      { path: "/help/contribute", element: <ContributeHelp /> },
      { path: "/help/about", element: <About /> },

      // --- Protected routes ---
      {
        element: <ProtectedLayout />,
        children: [
          { path: "/e/new", element: <CreateEvent /> },
          { path: "/e/:event_id/deck", element: <DeckView /> },
          { path: "/e/:event_id/deck/print", element: <PrintDecklistView /> },
          { path: "/e/:event_id/sync/eventlink", element: <EventlinkSync /> },
          { path: "/library", element: <LibraryOverview /> },
          { path: "/library/deck/:deck_id?", element: <LibraryDeckEditorPage /> },
          { path: "/timers/new", element: <CreateTournament /> },
          { path: "/timers/:tournament_id", element: <TournamentWrapper /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {/* This div acts as the main flex container for the page */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          {/* This main element will grow to fill available space, pushing the footer down */}
          <main style={{ flex: '1 0 auto' }}>
            <RouterProvider router={router} />
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </>
  );
}

function NavBar()
{
  const { authorized } = useAuthQuery();
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      queryClient.resetQueries();
    },
  });

  const isQRCodeRoute = window.location.pathname.match(/\/e\/.*\/qr$/i) !== null;
  const isPrintDecklistRoute = window.location.pathname.match(/\/e\/.*\/deck\/print$/i) !== null;
  const isTournamentPublicViewRoute = window.location.pathname.match(/\/timers\/.*\/view$/i) !== null;

  if (isQRCodeRoute || isPrintDecklistRoute || isTournamentPublicViewRoute) {
    return null;
  }

  // Custom navigation function to avoid full page reloads
  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleLogout = () => {
    logoutMutation.mutate({});
  }

  return <>
    <Navbar collapseOnSelect expand="md">
      <Container>
        <Navbar.Brand onClick={handleNavigate('/')} href="/" className="ps-2">decklist.lol</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={handleNavigate('/e/new')} href="/e/new">Create Tournament</Nav.Link>
            <Nav.Link onClick={handleNavigate('/library')} href="/library">My Decks</Nav.Link>
            <Nav.Link onClick={handleNavigate('/tools')} href="/tools">Tools</Nav.Link>
            {authorized ? (
              <>
                <Nav.Link onClick={() => handleLogout()}>Log out</Nav.Link>
              </>
              ) :
              (
                <>
                  <Nav.Link onClick={handleNavigate(`/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`)} href="/login">Log in</Nav.Link>
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
  const isPrintDecklistRoute = window.location.pathname.match(/\/e\/.*\/deck\/print$/i) !== null;
  const isTournamentPublicViewRoute = window.location.pathname.match(/\/timers\/.*\/view$/i) !== null;

  if (isQRCodeRoute || isPrintDecklistRoute || isTournamentPublicViewRoute) {
    return null;
  }

  return (
    <footer className="py-3 mt-auto"> {/* mt-auto will now work as expected */}
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
