import { ReactElement, useState, Fragment, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  UserPlus, Trash2, History, Play, Pause, TriangleAlert,
  RotateCcw, ExternalLink, Check, Clipboard, SlidersHorizontal, ArrowLeft,
} from 'lucide-react';
import { useTournamentDetails } from '../../Hooks/useTournamentTimers';
import { TournamentTimerClock } from '../../model/api/tournamentTimers';
import { HandleValidation } from '../../Util/Validators';
import { TimerDisplay } from './TimerDisplay';
import { useTournamentClocks } from './useTournamentClocks';
import { useTournamentTimersUpdated, WebSocketTournamentTimersRefreshMessageType } from '../../Hooks/useWebsocketConnection';
import { useAuthQuery } from '../../Hooks/useAuthQuery';
import { useAddManagerMutation, useDeleteManagerMutation, useCreateClockMutation, useUpdateClockMutation, useResetClockMutation, useAdjustClockMutation, useDeleteClockMutation, useDeleteTournamentMutation, useForceSyncMutation } from '../../Hooks/useTournamentMutations';
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Spinner } from "@/Components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

const getWebSocketStatusText = (readyState: number): string => {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return 'CONNECTING (0)';
    case WebSocket.OPEN:
      return 'OPEN (1)';
    case WebSocket.CLOSING:
      return 'CLOSING (2)';
    case WebSocket.CLOSED:
      return 'CLOSED (3)';
    default:
      return `UNKNOWN (${readyState})`;
  }
};

interface AddManagerFormInputs {
  name: string;
  email: string;
}

interface AddClockFormInputs {
  clock_name: string;
  duration_minutes: number;
}

function AddClockForm({ tournamentId, onClockAdded }: { tournamentId: string; onClockAdded: (clock: TournamentTimerClock) => void }): ReactElement {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<AddClockFormInputs>({
    defaultValues: { duration_minutes: 50 }
  });

  const createClockMutation = useCreateClockMutation({
    onSuccess: (data) => onClockAdded(data),
    onError: (err) => HandleValidation(setError, err),
  });

  const onSubmit = (data: AddClockFormInputs) => {
    createClockMutation.mutate({
      params: { path: { tournamentId } },
      body: {
        clock_name: data.clock_name,
        duration_seconds: data.duration_minutes * 60,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" />
          Add Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="clockName">Clock Name</Label>
              <Input
                type="text"
                id="clockName"
                placeholder="Enter clock name (e.g., Round 1, Break)"
                aria-invalid={!!errors.clock_name}
                {...register("clock_name", { required: "Clock name is required" })}
              />
              {errors.clock_name && (
                <p className="text-sm text-destructive">{errors.clock_name?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clockDuration">Duration (min)</Label>
              <Input
                type="number"
                id="clockDuration"
                placeholder="Mins"
                aria-invalid={!!errors.duration_minutes}
                {...register("duration_minutes", {
                  required: "Duration is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Duration must be at least 1 minute" }
                })}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-destructive">{errors.duration_minutes?.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={createClockMutation.isPending}>
            {createClockMutation.isPending ? (
              <>
                <Spinner className="size-4 text-current" />
                Adding Clock...
              </>
            ) : 'Add Clock'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TournamentWrapper(): ReactElement {
  const { tournament_id } = useParams<{ tournament_id: string }>();
  if (!tournament_id) {
    return <div>Error: Tournament ID is required.</div>;
  }
  return <Tournament tournament_id={tournament_id} />;
}

export function Tournament({ tournament_id }: {tournament_id: string}): ReactElement {
  const { sessionId } = useAuthQuery();
  const { data: tournamentDetails, isLoading, isError, refetch } = useTournamentDetails(tournament_id, false);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<AddManagerFormInputs>();
  const [clockFormKey, setClockFormKey] = useState(0);
  const navigate = useNavigate();
  const publicLink = `${window.location.origin}/timers/${tournamentDetails?.tournament_id}/view`;
  const [copied, setCopied] = useState(false);
  const [expandedClockId, setExpandedClockId] = useState<string | null>(null);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string>("");

  const {clocks: timers, addClock, removeClock, initClocks} = useTournamentClocks();

  useEffect(() => {
    if (tournamentDetails?.clocks) {
      initClocks(tournamentDetails.clocks);
    }
  }, [initClocks, tournamentDetails?.clocks]);

  const { readyState } = useTournamentTimersUpdated(
    (message) => {
      if (message.message_type === WebSocketTournamentTimersRefreshMessageType.FORCE_UPDATE) {
        refetch();
        setSyncStatusMessage("Sync completed");
        setTimeout(() => setSyncStatusMessage(""), 3000); // Clear message after 3 seconds
        return;
      }

      if (message.updated_by_session_id == sessionId) {
        console.log("Ignoring update from own session");
        return; // Ignore updates from the same session
      }

      switch (message.message_type) {
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_ADDED:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_RESET:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_PAUSED:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_RESUMED:
        case WebSocketTournamentTimersRefreshMessageType.CLOCK_ADJUSTED:
          if (message.updated_clock)
            addClock(message.updated_clock);
          break;

        case WebSocketTournamentTimersRefreshMessageType.CLOCK_DELETED:
          if (message.clock_id)
            removeClock(message.clock_id);
          break;
      }

      console.log("Tournament Clock Updated", message);
    },
    tournament_id
  );

    useEffect(() => {
    if (readyState === WebSocket.OPEN) {
      console.log("WebSocket: Tournament timers connection opened, fetching timers");
      refetch();
    }},
    [readyState, refetch]
  );

  const copyToClipboard = async () => {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- Mutations ---

  const addManagerMutation = useAddManagerMutation({
    onSuccess: () => {
      refetch();
      reset();
    },
    onError: (e) => HandleValidation(setError, e),
  });

  const deleteManagerMutation = useDeleteManagerMutation({
    onSuccess: () => refetch(),
  });

  const updateClockMutation = useUpdateClockMutation({
    onSuccess: (data) => addClock(data),
  });

  const resetClockMutation = useResetClockMutation({
    onSuccess: (data) => addClock(data),
  });

  const adjustClockMutation = useAdjustClockMutation({
    onSuccess: (data) => addClock(data),
  });

  const deleteClockMutation = useDeleteClockMutation({
    onSuccess: (_data, { params }) => removeClock(params.path.clockId),
  });

  const deleteTournamentMutation = useDeleteTournamentMutation({
    onSuccess: () => navigate('/timers'),
  });

  const forceSyncMutation = useForceSyncMutation({
    onSuccess: () => {
      setSyncStatusMessage("Sync requested");
      setTimeout(() => setSyncStatusMessage(""), 3000);
    },
  });

  // --- Handlers ---

  const onAddManager = (data: AddManagerFormInputs) => {
    addManagerMutation.mutate({
      params: { path: { tournamentId: tournament_id } },
      body: {
        user_email: data.email,
        user_name: data.name,
      },
    });
  };

  const onRemoveManager = (managerId: string) => {
    if (window.confirm("Are you sure you want to remove this manager?")) {
      deleteManagerMutation.mutate({
        params: { path: { tournamentId: tournament_id, userId: managerId } },
      });
    }
  };


  const onToggleClock = (clockId: string, currentState: boolean) => {
    updateClockMutation.mutate({
      params: { path: { tournamentId: tournament_id, clockId } },
      body: { is_running: !currentState },
    });
  };

  const handleToggleAdjustPanel = (clockId: string) => {
    setExpandedClockId(prevId => (prevId === clockId ? null : clockId));
  };

  const onResetClock = (clockId: string, durationSeconds: number) => {
    const durationMinutes = Math.floor(durationSeconds / 60);
    if (window.confirm(`Are you sure you want to reset this clock to ${durationMinutes} minutes?`)) {
      resetClockMutation.mutate({
        params: { path: { tournamentId: tournament_id, clockId } },
      });
    }
  };

  const onAdjustClockTime = (clockId: string, msAdjustment: number) => {
    adjustClockMutation.mutate({
      params: { path: { tournamentId: tournament_id, clockId } },
      body: { ms_adjustment: msAdjustment },
    });
  };

  const onDeleteClock = (clockId: string) => {
    if (window.confirm("Are you sure you want to delete this clock?")) {
      deleteClockMutation.mutate({
        params: { path: { tournamentId: tournament_id, clockId } },
      });
    }
  };

  const onDeleteTournament = () => {
    if (window.confirm("Are you sure you want to permanently delete this tournament and all its clocks? This action cannot be undone.")) {
      deleteTournamentMutation.mutate({
        params: { path: { tournamentId: tournament_id } },
      });
    }
  };

  const onForceSync = () => {
    forceSyncMutation.mutate({
      params: { path: { tournamentId: tournament_id } },
    });
  };

  if(!tournamentDetails || readyState !== WebSocket.OPEN || isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
        <Spinner className="size-12 text-primary" />
        <p className="text-lg">Connecting to server...</p>
        <p className="text-sm text-muted-foreground">
          WebSocket Status: {getWebSocketStatusText(readyState)}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <PageContainer size="lg">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading tournament details. Please try again later.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (tournamentDetails.role !== "owner" && tournamentDetails.role !== "manager") {
    return (
      <PageContainer size="lg">
        <Alert variant="warning">
          <AlertDescription>
            You do not have permission to view this tournament.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="lg">
      <div className="mb-6">
        <div className="mb-3">
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => navigate('/timers')}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{tournamentDetails.tournament_name}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AddClockForm
            key={clockFormKey}
            tournamentId={tournament_id}
            onClockAdded={(clock) => {
              addClock(clock);
              setClockFormKey(k => k + 1);
            }}
          />

          {/* Current Clocks Section */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <History className="size-5" />
              Current Clocks
            </h4>
            {timers && timers.length > 0 ? (
              <Table>
                <TableBody>
                  {timers.map((clock: TournamentTimerClock) => (
                    <Fragment key={clock.clock_id}>
                      <TableRow>
                        <TableCell
                          className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                          title={clock.clock_name}
                        >
                          {clock.clock_name}
                        </TableCell>
                        <TableCell className="text-right timer-display-font-table">
                          <TimerDisplay msRemaining={clock.ms_remaining} />
                        </TableCell>
                        <TableCell className="w-px whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant={clock.is_running ? "secondary" : "default"}
                              size="icon"
                              className="size-8"
                              onClick={() => onToggleClock(clock.clock_id, clock.is_running)}
                              title={clock.is_running ? "Pause Clock" : "Start Clock"}
                            >
                              {clock.is_running ? <Pause className="size-4" /> : <Play className="size-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => onResetClock(clock.clock_id, clock.duration_seconds)}
                              title="Reset Clock"
                            >
                              <RotateCcw className="size-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="size-8"
                              onClick={() => handleToggleAdjustPanel(clock.clock_id)}
                              title="Adjust Time"
                              aria-expanded={expandedClockId === clock.clock_id}
                            >
                              <SlidersHorizontal className="size-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="size-8"
                              onClick={() => onDeleteClock(clock.clock_id)}
                              title="Delete Clock"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedClockId === clock.clock_id && (
                        <TableRow>
                          <TableCell colSpan={3} className="p-2">
                            <div className="flex flex-wrap justify-center gap-2">
                              {[
                                { label: "-1m", ms: -60000 },
                                { label: "-30s", ms: -30000 }, { label: "-10s", ms: -10000 },
                                { label: "+10s", ms: 10000 }, { label: "+30s", ms: 30000 },
                                { label: "+1m", ms: 60000 },
                              ].map(adj => (
                                <Button
                                  key={adj.label}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAdjustClockTime(clock.clock_id, adj.ms)}
                                  className="min-w-[50px]"
                                >
                                  {adj.label}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No clocks created for this tournament yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              <div className="flex w-full items-center justify-between gap-2">
                <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  <strong className="text-foreground">Public Link:</strong> {publicLink}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="icon"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    title="Open public view"
                  >
                    <Link
                      to={publicLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {tournamentDetails.role === "owner" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="size-4" />
                    Add Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onAddManager)} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="managerName">Name</Label>
                        <Input
                          type="text"
                          id="managerName"
                          placeholder="Enter manager's name"
                          aria-invalid={!!errors.name}
                          {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="managerEmail">Email</Label>
                        <Input
                          type="email"
                          id="managerEmail"
                          placeholder="Enter manager's email"
                          aria-invalid={!!errors.email}
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email?.message}</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={addManagerMutation.isPending}>
                      {addManagerMutation.isPending ? (
                        <>
                          <Spinner className="size-4 text-current" />
                          Adding...
                        </>
                      ) : 'Add Manager'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <UserPlus className="size-5" />
                  Current Managers
                </h4>
                {tournamentDetails.managers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournamentDetails.managers.map(manager => (
                        <TableRow key={manager.user_id}>
                          <TableCell>{manager.user_name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="size-8"
                              onClick={() => onRemoveManager(manager.user_id)}
                              title="Remove Manager"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No managers assigned to this tournament yet.</p>
                )}
              </div>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Utilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use this button in case one or more presentation screens have desynchronized,
                which can happen in case of intermittent connectivity issues.
                While they should automatically recover given time, you can attempt to force a sync here.
              </p>
              <Button
                onClick={onForceSync}
                className="w-full"
                disabled={forceSyncMutation.isPending}
              >
                {forceSyncMutation.isPending ? (
                  <>
                    <Spinner className="size-4 text-current" />
                    Syncing...
                  </>
                ) : 'Force Sync'}
              </Button>
              {syncStatusMessage && <p className="text-center text-sm text-muted-foreground">{syncStatusMessage}</p>}
            </CardContent>
          </Card>

          {/* Danger Zone Section */}
          {tournamentDetails.role === "owner" && (
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <TriangleAlert className="size-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Be careful, these actions are irreversible.</p>
                <Button
                  variant="destructive"
                  onClick={onDeleteTournament}
                  className="w-full"
                >
                  <Trash2 className="size-4" />
                  Delete This Tournament
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
