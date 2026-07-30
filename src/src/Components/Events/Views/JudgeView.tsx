import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    QrCode, Clipboard, Check, Lock, LockOpen, Search, UserPlus,
    ChevronDown, ChevronUp, Download, Trash2, TriangleAlert, CircleCheck
} from 'lucide-react';
import { HandleValidation } from '../../../Util/Validators';
import { EventViewProps } from '../EventTypes';
import { useAuthQuery } from '../../../Hooks/useAuthQuery';
import { useEventUpdated } from '../../../Hooks/useWebsocketConnection';
import { useUpdateEventMutation, useDeleteEventMutation, useDeleteEventUserMutation, useLeaveEventMutation, useAddJudgeMutation, useAddPlayerMutation } from '../../../Hooks/useEventMutations';
import { PageContainer } from '@/Components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Spinner } from '@/Components/ui/spinner';
import { cn } from '@/lib/utils';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'checked', label: 'Checked' },
    { key: 'unchecked', label: 'Unchecked' },
    { key: 'warnings', label: 'Warnings' },
] as const;

export const JudgeView: React.FC<EventViewProps> = (e) => {
    const players = e.event.participants.filter(a => a.role === "player");
    const judges = e.event.participants.filter(a => a.role === "judge");
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDeckForm, setShowAddDeckForm] = useState(false);

    const inviteLink = `${window.location.origin}/e/${e.event.event_id}`;
    const navigate = useNavigate();
    const auth = useAuthQuery();
    const [filterByDeckStatus, setFilterByDeckStatus] = useState<'all' | 'checked' | 'unchecked' | 'warnings'>('all');
    const { refetch: refetchEvent } = e;

    useEventUpdated((message) => {
        if (refetchEvent && message.refresh && message.updated_by_session_id != auth.sessionId) {
            console.log("Refetching event");
            refetchEvent();
        }
    }, e.event.event_id);

    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.player_name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesDeckStatus =
            filterByDeckStatus === 'all' ||
            (filterByDeckStatus === 'checked' && player.is_deck_checked) ||
            (filterByDeckStatus === 'unchecked' && !player.is_deck_checked) ||
            (filterByDeckStatus === 'warnings' && player.has_deck_warning);
        return matchesSearch && matchesDeckStatus;
    });

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateEventMutation = useUpdateEventMutation({
        onSuccess: () => e.refetch?.(),
    });

    const deleteEventMutation = useDeleteEventMutation({
        onSuccess: () => navigate('/'),
    });

    const deleteEventUserMutation = useDeleteEventUserMutation({
        onSuccess: () => e.refetch!(),
    });

    const toggleEventState = () => {
        const isOpen = e.event.status === "open";

        if (e.event.role === "judge" && isOpen) {
            const confirmed = window.confirm(
                "As a judge, you can close this tournament but cannot reopen it.\n\n" +
                "Only the tournament owner can reopen a closed tournament.\n\n" +
                "Are you sure you want to close this tournament?"
            );

            if (!confirmed) return;
        }

        if (e.event.role === "owner" || isOpen) {
            updateEventMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
                body: { event_status: isOpen ? "closed" : "open" },
            });
        }
    };

    const handleDeleteEvent = () => {
        const confirmed = window.confirm("Are you sure you want to delete this tournament? This action cannot be undone.");
        if (confirmed) {
            deleteEventMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
            });
        }
    };

    const handleDownloadDecklists = () => {
        window.open(`/api/events/${e.event.event_id}/decks/all`, '_blank');
    };

    const { register, reset, setError, handleSubmit, clearErrors, formState: { errors } } = useForm<{ player_name: string, email: string }>();
    const addJudgeMutation = useAddJudgeMutation({
        onSuccess: () => {
            e.refetch!();
            reset();
        },
        onError: (err) => HandleValidation(setError, err),
    });
    const onAddJudge = (data: { player_name: string, email: string }) => {
        addJudgeMutation.mutate({
            params: { path: { eventId: e.event.event_id } },
            body: {
                email: data.email.trim(),
                player_name: data.player_name.trim(),
                role: "judge",
            },
        });
    };

    const { register: registerPlayer, handleSubmit: handleSubmitPlayer, reset: resetPlayer, setError: setPlayerError, clearErrors: clearPlayerErrors, formState: { errors: playerErrors } } = useForm<{ player_name: string, email: string }>();
    const addPlayerMutation = useAddPlayerMutation({
        onSuccess: (response) => {
            resetPlayer();
            if (response && response.user_id) {
                navigate(`/e/${e.event.event_id}/deck?id=${response.user_id}`);
            } else {
                e.refetch?.();
            }
        },
        onError: (err) => HandleValidation(setPlayerError, err),
    });
    const onAddPlayer = (data: { player_name: string, email: string }) => {
        addPlayerMutation.mutate({
            params: { path: { eventId: e.event.event_id } },
            body: {
                email: data.email?.trim() || undefined,
                player_name: data.player_name.trim(),
            },
        });
    };

    const onRemovePlayer = (userId: string, playerName: string) => {
        const confirmed = window.confirm(`Are you sure you want to remove ${playerName} from the tournament?`);

        if (confirmed) {
            deleteEventUserMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
                body: { user_id: userId },
            });
        }
    };

    const disassociateSelfMutation = useLeaveEventMutation({
        onSuccess: () => navigate('/'),
    });

    const onDisassociateSelf = () => {
        const confirmed = window.confirm(`Are you sure you want to leave this event?`);

        if (confirmed) {
            disassociateSelfMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
                body: { user_id: auth.userId! },
            });
        }
    };

    const isOpen = e.event.status === "open";
    const isRemoving = (userId: string) => deleteEventUserMutation.isPending && deleteEventUserMutation.variables?.body?.user_id === userId;
    const visiblePlayers = searchTerm !== '' ? filteredPlayers : filteredPlayers.slice(0, 50);

    return (
        <PageContainer size="lg">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* ----- Decks column ----- */}
                <div>
                    <h2 className="mb-3 text-xl font-semibold">Decks</h2>

                    {/* Add Player */}
                    <Card className="mb-4 gap-0 py-0">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                            onClick={() => setShowAddDeckForm(!showAddDeckForm)}
                        >
                            <span className="flex items-center gap-2 font-semibold">
                                <UserPlus className="size-4" /> Manually add deck
                            </span>
                            {showAddDeckForm ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>
                        {showAddDeckForm && (
                            <CardContent className="border-t py-4">
                                <form className="space-y-3" onSubmit={(ev) => { clearPlayerErrors(); handleSubmitPlayer(onAddPlayer)(ev); }}>
                                    <div>
                                        <Input
                                            type="text"
                                            placeholder="Player Name"
                                            required
                                            aria-invalid={!!playerErrors.player_name}
                                            {...registerPlayer("player_name")}
                                        />
                                        {playerErrors.player_name && <p className="mt-1 text-sm text-destructive">{playerErrors.player_name.message}</p>}
                                    </div>
                                    <div>
                                        <Input
                                            type="email"
                                            placeholder="Email (optional)"
                                            aria-invalid={!!playerErrors.email}
                                            {...registerPlayer("email")}
                                        />
                                        {playerErrors.email && <p className="mt-1 text-sm text-destructive">{playerErrors.email.message}</p>}
                                    </div>
                                    <Button type="submit" disabled={addPlayerMutation.isPending}>
                                        {addPlayerMutation.isPending ? (<><Spinner className="size-4 text-current" />Adding...</>) : 'Add Deck'}
                                    </Button>
                                </form>
                            </CardContent>
                        )}
                    </Card>

                    {/* Player search + filters */}
                    <div className="mb-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Players ({players.length}/{e.event.max_players})
                            </h3>
                        </div>
                        {players.length > 0 && (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by player name"
                                        className="pl-9 pr-16"
                                        value={searchTerm}
                                        onChange={(ev) => setSearchTerm(ev.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {FILTERS.map(f => (
                                        <Button
                                            key={f.key}
                                            type="button"
                                            size="sm"
                                            variant={filterByDeckStatus === f.key ? 'default' : 'outline'}
                                            onClick={() => setFilterByDeckStatus(f.key)}
                                        >
                                            {f.label}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Players list */}
                    <Card className="gap-0 py-0">
                        {filteredPlayers.length > 50 && searchTerm === '' && (
                            <div className="border-b bg-warning/10 px-3 py-2 text-center text-sm text-warning">
                                Showing first 50 of {filteredPlayers.length} players. Use the search bar to find specific players.
                            </div>
                        )}
                        <ul className="divide-y">
                            {visiblePlayers.map((p) => (
                                <li key={p.user_id} className="flex items-center justify-between gap-2 px-3 py-2">
                                    <button
                                        type="button"
                                        className="flex-1 truncate text-left hover:text-primary"
                                        onClick={() => navigate('/e/' + e.event.event_id + '/deck?id=' + p.user_id)}
                                        title="View deck"
                                    >
                                        {p.player_name}
                                    </button>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {p.has_deck_warning && <TriangleAlert className="size-4 text-warning" aria-label="Warning" />}
                                        {p.is_deck_checked && <CircleCheck className="size-4 text-primary" aria-label="Checked" />}
                                        <Button asChild size="icon" className="size-8" title="View Deck">
                                            <Link to={'/e/' + e.event.event_id + '/deck?id=' + p.user_id}>
                                                <Search className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => onRemovePlayer(p.user_id, p.player_name)}
                                            title="Remove Player"
                                            disabled={isRemoving(p.user_id)}
                                        >
                                            {isRemoving(p.user_id) ? <Spinner className="size-4 text-current" /> : <Trash2 className="size-4" />}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                            {filteredPlayers.length === 0 && (
                                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    {players.length <= 0 ? "No players have joined this tournament yet" : "No players match your filter"}
                                </li>
                            )}
                        </ul>
                    </Card>
                </div>

                {/* ----- Tournament column ----- */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Tournament</h2>

                    {/* Invite link */}
                    <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                        <div className="min-w-0 flex-1 truncate text-sm">
                            <span className="font-semibold">Invite Link:</span> {inviteLink}
                        </div>
                        <Button onClick={copyToClipboard} size="icon" title="Copy to clipboard">
                            {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
                        </Button>
                        <Button asChild size="icon" title="Show QR code">
                            <Link to={`/e/${e.event.event_id}/qr`} target="_blank" rel="noopener noreferrer">
                                <QrCode className="size-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Tournament info */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Tournament Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-semibold">Format:</div>
                                <div className="text-muted-foreground">{e.event.format_name}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Participants:</div>
                                <div className="text-muted-foreground">{players.length} / {e.event.max_players}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Tournament Date:</div>
                                <div className="text-muted-foreground">{new Date(e.event.event_date + "T00:00:00").toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Expiration Date:</div>
                                <div className="text-muted-foreground">
                                    {(() => {
                                        const deletionDate = new Date(e.event.event_date + "T00:00:00");
                                        deletionDate.setDate(deletionDate.getDate() + 7);
                                        return deletionDate.toLocaleDateString();
                                    })()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className={cn("flex items-center gap-1.5 font-medium", isOpen ? "text-primary" : "text-destructive")}>
                                    {isOpen ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
                                    {isOpen ? "Open" : "Closed"}
                                </span>
                                <Button
                                    type="button"
                                    variant={isOpen ? "outline" : "default"}
                                    size="sm"
                                    onClick={toggleEventState}
                                    disabled={e.event.role === "judge" && !isOpen}
                                >
                                    {isOpen ? "Close tournament" : "Reopen tournament"}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {isOpen
                                    ? "Players can submit and modify decks when the tournament is open."
                                    : "Players cannot submit or modify decks when the tournament is closed."}
                            </p>
                            {e.event.role === "judge" && !isOpen && (
                                <Alert variant="warning"><AlertDescription>Only the tournament owner can reopen this tournament.</AlertDescription></Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Utilities */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Utilities</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div>
                                <Button type="button" onClick={handleDownloadDecklists}>
                                    <Download className="size-4" /> Download All Decklists
                                </Button>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Download all decklists as a single text file for offline use or printing.
                                </p>
                            </div>
                            <div>
                                <Button asChild>
                                    <Link to={`/e/${e.event.event_id}/sync/eventlink`}>Eventlink Sync</Link>
                                </Button>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Cross reference submissions with eventlink player list.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger zone */}
                    <Card className="border-destructive/40">
                        <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
                        <CardContent>
                            {e.event.role === "owner" ? (
                                <>
                                    <p className="mb-3 text-sm text-muted-foreground">
                                        Deleting a tournament will permanently remove all related data including decks and user registrations.
                                    </p>
                                    <Button type="button" variant="destructive" onClick={handleDeleteEvent}>
                                        Delete Tournament
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="mb-3 text-sm text-muted-foreground">
                                        Leaving the event will remove you as a judge. You will no longer have access to manage this tournament.
                                    </p>
                                    <Button type="button" variant="destructive" onClick={onDisassociateSelf}>
                                        Leave Event
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Judges */}
                    {(e.event.role === "owner") && (
                        <div>
                            <h2 className="mb-3 text-xl font-semibold">Judges</h2>

                            <form onSubmit={(ev) => { clearErrors(); handleSubmit(onAddJudge)(ev); }} className="mb-3">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <Input id="player_name" type="text" placeholder="Judge Name" required aria-invalid={!!errors.player_name} {...register("player_name")} />
                                        {errors.player_name && <p className="mt-1 text-sm text-destructive">{errors.player_name.message}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <Input id="email" type="text" placeholder="Email Address" required aria-invalid={!!errors.email} {...register("email")} />
                                        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
                                    </div>
                                    <Button type="submit" disabled={addJudgeMutation.isPending}>
                                        {addJudgeMutation.isPending ? <Spinner className="size-4 text-current" /> : 'Add'}
                                    </Button>
                                </div>
                            </form>
                            <Card className="gap-0 py-0">
                                <ul className="divide-y">
                                    {judges.map((p) => (
                                        <li key={p.user_id} className="flex items-center justify-between gap-2 px-3 py-2">
                                            <span className="truncate">{p.player_name}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => onRemovePlayer(p.user_id, p.player_name)}
                                                title="Remove Judge"
                                                disabled={isRemoving(p.user_id)}
                                            >
                                                {isRemoving(p.user_id) ? <Spinner className="size-4 text-current" /> : <Trash2 className="size-4" />}
                                            </Button>
                                        </li>
                                    ))}
                                    {judges.length === 0 && (
                                        <li className="px-3 py-4 text-center text-sm text-muted-foreground">No judges yet.</li>
                                    )}
                                </ul>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    )
}
