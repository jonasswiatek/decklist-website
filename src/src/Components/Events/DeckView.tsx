import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../../Util/ToastContext';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { EventDetails, getDecklistRequest, getLibraryDeckRequest } from '../../model/api/apimodel';
import { DecklistTable } from './DecklistTable';
import { useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';
import { ArrowLeft, User, Trash2, FileText, Printer, History } from 'lucide-react';
import { getDecklistPlaceholder } from '../../Util/DecklistPlaceholders';
import { DecklistTextarea } from '../Common/DecklistTextarea';
import { LoadingScreen } from '../Login/LoadingScreen';
import { useEventDetailsQuery } from '../../Hooks/useEventDetailsQuery';
import { useEventListQuery } from '../../Hooks/useEventListQuery';
import { useLibraryDecksQuery } from '../../Hooks/useLibraryDecksQuery';
import { useDecklistQuery } from '../../Hooks/useDecklistQuery';
import { useDecklistRevisionsQuery } from '../../Hooks/useDecklistRevisionsQuery';
import { useSubmitDeckMutation, useDeleteDeckMutation, useSetDeckCheckedMutation } from '../../Hooks/useDeckMutations';
import { PageContainer } from '@/Components/layout/PageContainer';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Spinner } from '@/Components/ui/spinner';
import { cn } from '@/lib/utils';

export function DeckView() {
    const { event_id } = useParams();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const { data, isError, isLoading } = useEventDetailsQuery(event_id!);

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    if (isError) {
        return (
            <PageContainer>
                <p className="text-muted-foreground">Error. Try again later.</p>
            </PageContainer>
        )
    }

    return (<DeckEditor event={data!} user_id={id} />)
}

type DeckEditorProps = {
    event: EventDetails,
    user_id?: string | null,
}

const selectClasses = "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_option]:bg-popover [&_option]:text-popover-foreground [&_optgroup]:bg-popover [&_optgroup]:text-popover-foreground";

export const DeckEditor: React.FC<DeckEditorProps> = (props) => {
    const isJudge = props.user_id != null;
    const isPlayer = !isJudge;
    const isOpen = props.event.status === "open" || isJudge;

    const [isEditing, setIsEditing] = useState(false); // New state to track if the judge is editing
    const [showRevisionsTable, setShowRevisionsTable] = useState(false); // State for revisions table visibility
    const [showRevisionId, setShowRevisionId] = useState<number | null>(null); // State for selected revision ID

    const navigate = useNavigate();
    const { showToast } = useToast();

    const { refetch: refetchEvent } = useEventDetailsQuery(props.event.event_id, false);
    const { data: decklistData, isError: isDecklistError, isLoading: decklistLoading, refetch: refetchDecklist } = useDecklistQuery(props.event.event_id, props.user_id);
    const { data: revisions, isLoading: revisionsLoading, refetch: refetchRevisions } = useDecklistRevisionsQuery(props.event.event_id, props.user_id, false);
    const { data: library, isError: isLibraryError, isLoading: libraryLoading } = useLibraryDecksQuery(isPlayer);
    const { data: events, isLoading: eventsLoading, refetch: refetchMyEvents } = useEventListQuery(isPlayer);

    type Inputs = {
        user_id?: string,
        player_name: string,
        deck_name?: string,
        decklist_text: string
    };

    const { register, setError, handleSubmit, clearErrors, reset, setValue, formState: { errors, isDirty } } = useForm<Inputs>();
    const submitMutation = useSubmitDeckMutation({
        onSuccess: () => {
            refetchDecklist();

            if (isPlayer) {
                refetchMyEvents();
            }
            else {
                refetchEvent();
            }

            reset(lastSubmittedData.current ?? undefined);

            showToast("Your deck has been submitted", "success");
        },
        onError: (e) => HandleValidation(setError, e),
    });
    const lastSubmittedData = useRef<Inputs | null>(null);
    const onSubmitDecklist = (data: Inputs) => {
        clearErrors();
        lastSubmittedData.current = data;
        submitMutation.mutate({
            params: { path: { event_id: props.event.event_id } },
            body: {
                user_id: props.user_id,
                player_name: data.player_name.trim(),
                deck_name: data.deck_name?.trim(),
                decklist_text: data.decklist_text,
            },
        });
    };

    const deleteDeckMutation = useDeleteDeckMutation({
        onSuccess: () => {
            refetchDecklist();
            if (isPlayer) {
                refetchMyEvents();
            }
            reset({ player_name: '', deck_name: '', decklist_text: '' });
        },
    });

    const handleDeleteDeck = () => {
        if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
            deleteDeckMutation.mutate({
                params: { path: { event_id: props.event.event_id } },
            });
        }
    };

    const handleImportDeck = async (selectedDeck: string) => {
        if (selectedDeck === 'none') {
            setValue("decklist_text", '', {
                shouldDirty: true,
                shouldValidate: true
            });
            return;
        }
        try {
            const [source, id] = selectedDeck.split(':');
            switch (source) {
                case 'saved': {
                    const savedDeck = await getLibraryDeckRequest({ deck_id: id });
                    setValue("deck_name", savedDeck.deck_name, {
                        shouldDirty: true,
                        shouldValidate: true
                    });

                    setValue("decklist_text", savedDeck.decklist_text, {
                        shouldDirty: true,
                        shouldValidate: true
                    });
                    break;
                }

                case 'event': {
                    const decklist = await getDecklistRequest(id);
                    if (!decklist) break;
                    setValue("deck_name", decklist.deck_name ?? '', {
                        shouldDirty: true,
                        shouldValidate: true
                    });

                    setValue("decklist_text", decklist.decklist_text, {
                        shouldDirty: true,
                        shouldValidate: true
                    });
                    break;
                }
            }
        } catch (e) {
            console.error("Failed to import deck", e);
            showToast("Failed to import deck", "danger");
        }
    };

    const handleBackToEvent = () => {
        navigate(`/e/${props.event.event_id}`);
    };

    const handleShowRevisions = () => {
        const newShowState = !showRevisionsTable;
        if (newShowState && !revisions) {
            refetchRevisions();
        }
        else {
            setShowRevisionId(null);
        }

        setShowRevisionsTable(newShowState);
    };

    const handleSelectRevision = (revisionId: number) => {
        console.log("Selected revision:", revisionId);
        setShowRevisionId(revisionId);
    };

    const handleDeckChecked = () => {
        refetchDecklist();
        refetchEvent();
    }

    if (decklistLoading || libraryLoading || eventsLoading) {
        return <LoadingScreen />
    }

    if (isDecklistError || isLibraryError) {
        return <PageContainer><p className="text-muted-foreground">Error, try later</p></PageContainer>
    }

    const selectedRevision = revisions?.revisions.find(revision => revision.revision_id === showRevisionId);
    const data = selectedRevision?.decklist ?? decklistData;
    const isViewingPreviousRevision = !(selectedRevision?.is_current ?? true);

    if (isJudge && !data) {
        return <PageContainer><p className="text-muted-foreground">No decklist found</p></PageContainer>
    }

    // Calculate mainboard and sideboard counts
    const mainboardCount = data?.groups
        ? data.groups
            .filter(group => group.group_name !== "Sideboard")
            .flatMap(group => group.cards)
            .reduce((sum, card) => sum + card.quantity, 0)
        : 0;

    const sideboardCount = data?.groups
        ? data.groups
            .find(group => group.group_name === "Sideboard")?.cards
            .reduce((sum, card) => sum + card.quantity, 0) || 0
        : 0;

    const hasSubmission = !!data;
    const inputDisabled = (isJudge && !isEditing) || !isOpen;
    const blurred = isJudge && !isEditing;
    const availableSavedDecks = library?.decks.filter(deck => deck.format === props.event.format) ?? [];
    const pastEvents = events?.filter(
        event => event.role === "player" &&
            event.format === props.event.format &&
            event.event_id !== props.event.event_id) ?? [];

    return (
        <PageContainer size="lg">
            {isJudge && (
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground" onClick={handleBackToEvent}>
                            <ArrowLeft className="size-4" /> Back
                        </Button>
                        {!showRevisionsTable && (
                            <FlagCheckedButton
                                eventId={props.event.event_id}
                                userId={props.user_id!}
                                isChecked={data?.is_deck_checked || false}
                                refetch={handleDeckChecked}
                            />
                        )}
                    </div>
                    {data?.player_name && (
                        <h3 className="mt-3 flex items-center gap-2 text-xl font-semibold">
                            <User className="size-5 text-muted-foreground" />
                            {data.player_name}
                        </h3>
                    )}
                </div>
            )}

            <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmitDecklist)(e); }}>
                <div className="grid gap-6 lg:grid-cols-3">

                    <div className="lg:col-span-1">
                        {!showRevisionsTable && (
                            <>
                                {!isOpen && !hasSubmission && (
                                    <Alert className="mb-3"><AlertDescription>This tournament is past its decklist submission deadline.</AlertDescription></Alert>
                                )}
                                {!isOpen && hasSubmission && (
                                    <Alert className="mb-3"><AlertDescription><b className="text-foreground">Your decklist is submitted</b>, but can no longer be modified because the submission deadline has passed.</AlertDescription></Alert>
                                )}
                                {!isJudge && isOpen && hasSubmission && (
                                    <Alert variant="success" className="mb-3"><AlertDescription><b>Your decklist is submitted</b>, and can be modified until the submission deadline.</AlertDescription></Alert>
                                )}
                            </>
                        )}
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <p className="text-sm"><strong>Format:</strong> {props.event.format_name}</p>
                            {data && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        title={showRevisionsTable ? "Hide Revisions" : "Show Revisions"}
                                        onClick={handleShowRevisions}
                                        disabled={revisionsLoading}
                                    >
                                        {revisionsLoading ? <Spinner className="size-4" /> : <History className="size-4" />}
                                    </Button>
                                    <Button asChild variant="outline" size="sm" title="Print Decklist">
                                        <Link
                                            to={`/e/${props.event.event_id}/deck/print${props.user_id ? `?id=${props.user_id}` : ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Printer className="size-4" /> Print
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                        {showRevisionsTable && revisions && revisions.revisions.length > 0 && (
                            <div className="mb-3">
                                <div className="overflow-hidden rounded-md border">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="px-2 py-1.5 text-left font-medium">Revision</th>
                                                <th className="px-2 py-1.5 text-left font-medium">By</th>
                                                <th className="px-2 py-1.5 text-left font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revisions.revisions.map((revision) => (
                                                <tr
                                                    key={revision.revision_id}
                                                    onClick={() => handleSelectRevision(revision.revision_id)}
                                                    className={cn(
                                                        "cursor-pointer border-t transition-colors hover:bg-muted/50",
                                                        revision.revision_id === showRevisionId && "bg-primary/15"
                                                    )}
                                                >
                                                    <td className="px-2 py-1.5">{new Date(revision.created_at).toLocaleString()} {revision.is_current ? "- latest" : ""}</td>
                                                    <td className="px-2 py-1.5">{revision.revised_by}</td>
                                                    <td className="px-2 py-1.5">{revision.revision_type}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Only the last 20 revisions are shown.</p>
                            </div>
                        )}
                        {showRevisionsTable && revisions && revisions.revisions.length === 0 && (
                            <p className="mb-3 text-muted-foreground">No revisions found for this decklist.</p>
                        )}
                        {!showRevisionsTable && (<>
                            <div className={cn("flex gap-2 transition", blurred && "pointer-events-none blur-sm opacity-60")}>
                                <div className="relative flex-1">
                                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        id="player_name"
                                        className="pl-9"
                                        placeholder="Your Name"
                                        required
                                        aria-invalid={!!errors.player_name}
                                        {...register("player_name", { value: data?.player_name ?? '' })}
                                        disabled={inputDisabled}
                                    />
                                </div>
                                {data && !isJudge && isOpen && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={handleDeleteDeck}
                                        disabled={deleteDeckMutation.isPending}
                                    >
                                        {deleteDeckMutation.isPending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                                    </Button>
                                )}
                            </div>
                            {errors.player_name && <p className="mt-1 text-sm text-destructive">{errors.player_name.message}</p>}

                            <div className={cn("relative mt-2 transition", blurred && "pointer-events-none blur-sm opacity-60")}>
                                <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    id="deck_name"
                                    className="pl-9"
                                    placeholder="Deck Name (Optional)"
                                    aria-invalid={!!errors.deck_name}
                                    {...register("deck_name", { value: data?.deck_name ?? '' })}
                                    disabled={inputDisabled}
                                />
                            </div>
                            {errors.deck_name && <p className="mt-1 text-sm text-destructive">{errors.deck_name.message}</p>}

                            <div className="relative mt-3">
                                {blurred && (
                                    <Button
                                        type="button"
                                        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Decklist
                                    </Button>
                                )}
                                <div className={cn(blurred && "pointer-events-none blur-sm opacity-60")}>
                                    {!isJudge && (
                                        <div className="mb-1 text-right text-sm">
                                            <a
                                                href={`/help/decklist#${props.event.decklist_style.toLowerCase()}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary underline-offset-4 hover:underline"
                                            >
                                                See formatting guide
                                            </a>
                                        </div>
                                    )}

                                    {!isJudge && (
                                        <div className="mb-2">
                                            <select
                                                className={selectClasses}
                                                onChange={(e) => {
                                                    const selectedDeckId = e.target.value;
                                                    if (selectedDeckId) {
                                                        handleImportDeck(selectedDeckId);
                                                    }
                                                }}
                                                disabled={(availableSavedDecks.length === 0 && pastEvents.length === 0) || inputDisabled}
                                            >
                                                <option key="none" value="none">
                                                    {availableSavedDecks.length === 0 && pastEvents.length === 0
                                                        ? "No saved decks for this format"
                                                        : "Import from..."}
                                                </option>
                                                {availableSavedDecks.length > 0 && (
                                                    <optgroup label="My Decks">
                                                        {availableSavedDecks.map(deck => (
                                                            <option key={`saved-${deck.deck_id}`} value={`saved:${deck.deck_id}`}>
                                                                {deck.deck_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                {pastEvents && pastEvents.length > 0 && (
                                                    <optgroup label="Other Events">
                                                        {pastEvents.map(event => (
                                                            <option key={`event-${event.event_id}`} value={`event:${event.event_id}`}>
                                                                {event.event_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        </div>
                                    )}

                                    <DecklistTextarea
                                        id="decklist_text"
                                        aria-invalid={!!errors.decklist_text}
                                        placeholder={getDecklistPlaceholder(props.event.decklist_style)}
                                        required
                                        registration={register("decklist_text", { value: data?.decklist_text })}
                                        style={{ height: 400 }}
                                        disabled={inputDisabled}
                                        knownCards={data?.groups ? new Set(data.groups.flatMap(g => g.cards.map(c => c.card_name.toLowerCase()))) : undefined}
                                    />
                                    {errors.decklist_text && (
                                        <p className="mt-1 text-sm text-destructive">{errors.decklist_text.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                    {props.event.decklist_style.toLowerCase() === "commander" ? (
                                        <span className="whitespace-nowrap">Deck: {mainboardCount}</span>
                                    ) : (
                                        <>
                                            <span className="whitespace-nowrap">Main: {mainboardCount}</span>
                                            <span className="whitespace-nowrap">Side: {sideboardCount}</span>
                                        </>
                                    )}
                                </div>
                                {isDirty && (
                                    <Button
                                        type="submit"
                                        id="submit-button"
                                        className="whitespace-nowrap"
                                        disabled={submitMutation.isPending}
                                    >
                                        {submitMutation.isPending ? (
                                            <><Spinner className="size-4 text-current" />Submitting</>
                                        ) : (
                                            data ? 'Resubmit Decklist' : 'Submit Decklist'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </>)}

                        {showRevisionsTable && isViewingPreviousRevision && (
                            <Alert variant="warning" className="mb-3"><AlertDescription>You're viewing a previous version of this decklist.</AlertDescription></Alert>
                        )}

                        {data?.deck_warnings && data.deck_warnings.length > 0 && (
                            <Alert variant="warning" className="mt-3">
                                <AlertTitle>Deck Warnings</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-4">
                                        {data.deck_warnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>


                    <div className="mt-2 lg:col-span-2">
                        {data && <DecklistTable cardGroups={data.groups} allowChecklist={isJudge} />}
                    </div>
                </div>
            </form>
        </PageContainer>
    )
}

const FlagCheckedButton: React.FC<{ eventId: string, userId: string, isChecked: boolean, refetch: () => void }> = ({ eventId, userId, isChecked, refetch }) => {
    const [localCheckedState, setLocalCheckedState] = useState(isChecked);

    useEffect(() => {
        setLocalCheckedState(isChecked);
    }, [isChecked]);

    const setCheckedMutation = useSetDeckCheckedMutation({
        onSuccess: () => refetch(),
    });

    const onSubmit = () => {
        const newCheckedState = !localCheckedState;
        setLocalCheckedState(newCheckedState);
        setCheckedMutation.mutate({
            params: { path: { event_id: eventId } },
            body: { user_id: userId, is_checked: newCheckedState },
        });
    };

    return (
        <Button
            type="button"
            onClick={onSubmit}
            variant={setCheckedMutation.isPending ? 'secondary' : (localCheckedState ? 'outline' : 'default')}
            disabled={setCheckedMutation.isPending}
        >
            {localCheckedState ? 'Mark as Unchecked' : 'Mark as Checked'}
        </Button>
    );
};
