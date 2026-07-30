import {
  createBrowserRouter,
  NavLink,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query'
import { LogIn, LogOut, Menu } from "lucide-react";

import { EventView } from './Components/Events/EventView.tsx'
import { ProtectedLayout } from './Components/Login/LoggedIn.tsx';
import { LandingPage } from './Components/LandingPage/LandingPage.tsx';
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
import { LoadingScreen } from './Components/Login/LoadingScreen.tsx';
import { useAuthQuery } from './Hooks/useAuthQuery.ts';
import { useLogoutMutation } from './Hooks/useAuthMutations.ts';
import { ToastProvider } from './Util/ToastContext.tsx';
import { Button } from '@/Components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/Components/ui/sheet';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient()

const NAV_LINKS = [
  { to: "/e/new", label: "Create Tournament" },
  { to: "/library", label: "My Decks" },
  { to: "/tools", label: "Tools" },
] as const;

/** Routes that render fullscreen with no chrome (kiosk / print / projector). */
function useChromeless() {
  const { pathname } = useLocation();
  return (
    /\/e\/.*\/qr$/i.test(pathname) ||
    /\/e\/.*\/deck\/print$/i.test(pathname) ||
    /\/timers\/.*\/view$/i.test(pathname)
  );
}

function Brand({ className }: { className?: string }) {
  return (
    <NavLink
      to="/"
      className={cn(
        "group flex items-center gap-2 text-lg font-semibold tracking-tight",
        className
      )}
    >
      <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <span className="text-sm font-bold">D</span>
      </span>
      <span>
        decklist<span className="text-primary">.lol</span>
      </span>
    </NavLink>
  );
}

function NavBar() {
  const { authorized } = useAuthQuery();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      queryClient.resetQueries();
    },
  });

  if (useChromeless()) return null;

  const handleLogout = () => logoutMutation.mutate({});
  const loginHref = `/login?return=${encodeURIComponent(
    location.pathname + location.search
  )}`;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-secondary text-foreground"
        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <div className="mx-2 h-5 w-px bg-border" />
          {authorized ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              Log out
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <NavLink to={loginHref}>
                <LogIn className="size-4" />
                Log in
              </NavLink>
            </Button>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          "rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto p-4">
                {authorized ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="size-4" />
                    Log out
                  </Button>
                ) : (
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <NavLink to={loginHref}>
                        <LogIn className="size-4" />
                        Log in
                      </NavLink>
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  if (useChromeless()) return null;

  const footerLinks = [
    { to: "/help/privacy", label: "Privacy Policy" },
    { to: "/help/terms-and-services", label: "Terms of Service" },
    { to: "/help/contribute", label: "Contribute" },
    { to: "/help/about", label: "About" },
  ];

  return (
    <footer className="mt-auto border-t border-border/60 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          Brought to you with love, for free and with no guarantees.
        </p>
        <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
          {footerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ScrollRestoration />
      <NavBar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // --- Public routes ---
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginScreen /> },
      { path: "/multi/:hub_name", element: <MutliEventView /> },
      { path: "/e/:event_id", element: <EventView /> },
      { path: "/e/:event_id/qr", element: <QRCodeView /> },
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

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isError, refetch } = useAuthQuery();
  if (isLoading) return <LoadingScreen />;
  if (isError)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
        <h4 className="text-xl font-semibold">Something went wrong</h4>
        <p className="text-muted-foreground">
          Unable to reach the server. Please try again later.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthGate>
    </QueryClientProvider>
  );
}

export default App
