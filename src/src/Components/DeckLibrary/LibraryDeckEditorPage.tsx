import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { DecklistGroup, Format, saveLibraryDeckRequest } from '../../model/api/apimodel';
import { User, ArrowLeft, Trash2, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { getDecklistPlaceholder } from '../../Util/DecklistPlaceholders';
import { DecklistTextarea } from '../Common/DecklistTextarea';
import { DecklistTable } from '../Events/DecklistTable';
import { LoadingScreen } from '../Login/LoadingScreen';
import { withValidation } from '../../Util/Validators';
import { useQueryClient } from '@tanstack/react-query';
import { useFormatsQuery } from '../../Hooks/useFormatsQuery';
import { useLibraryDeckQuery } from '../../Hooks/useLibraryDeckQuery';
import { libraryDecksQueryKey } from '../../Hooks/useLibraryDecksQuery';
import { useDeleteLibraryDeckMutation } from '../../Hooks/useDeckMutations';
import { PageContainer } from '@/Components/layout/PageContainer';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Spinner } from '@/Components/ui/spinner';

const selectClasses = "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_option]:bg-popover [&_option]:text-popover-foreground [&_optgroup]:bg-popover [&_optgroup]:text-popover-foreground";

export const LibraryDeckEditorPage: React.FC = () => {
  const { deck_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const importedDeck = location.state?.importedDeck;

  const { data, isLoading, refetch, isError } = useLibraryDeckQuery(deck_id);
  const queryClient = useQueryClient();
  const { data: formats, isLoading: formatsLoading, isError: isFormatsError } = useFormatsQuery();

  const deleteDeckMutation = useDeleteLibraryDeckMutation({
    onSuccess: () => navigate('/library'),
  });

  if (isLoading || formatsLoading) {
    return <LoadingScreen />
  }

  if (isError) {
    return (
      <PageContainer size="sm">
        <Alert variant="warning">
          <AlertTitle>Deck not found</AlertTitle>
          <AlertDescription>No deck found.</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (isError || isFormatsError) {
    return (
      <PageContainer size="sm">
        <Alert variant="destructive">
          <AlertTitle>Error loading deck</AlertTitle>
          <AlertDescription>Please try again later.</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  const handleDeckUpdate = async (deck_name: string, format: string, decklist_text: string) => {
    const result = await saveLibraryDeckRequest({
      deck_id: deck_id,
      deck_name: deck_name,
      format: format,
      decklist_text: decklist_text,
    });

    queryClient.invalidateQueries({ queryKey: libraryDecksQueryKey, refetchType: 'none' });
    if (deck_id) {
      refetch();
    }
    else {
      navigate('/library/deck/' + result.deck_id);
    }
  };

  const handleDeleteDeck = () => {
    deleteDeckMutation.mutate({
      params: { path: { deckId: deck_id! } },
    });
  };

  return (
    <PageContainer size="lg">
      <Button variant="link" className="mb-3 h-auto p-0 text-muted-foreground hover:text-foreground" onClick={() => navigate('/library')}>
        <ArrowLeft className="size-4" /> Back to Library
      </Button>
      <LibraryDeckEditor
        deck_name={data?.deck_name}
        format={data?.format ?? importedDeck?.format}
        formats={formats!.formats}
        groups={data?.groups}
        deck_warnings={data?.deck_warnings}
        decklist_text={data?.decklist_text ?? importedDeck?.decklist_text}
        onDeckUpdate={handleDeckUpdate}
        onDeleteDeck={handleDeleteDeck}
      />
    </PageContainer>
  );
}

type LibraryDeckEditorProps = {
  deck_name?: string;
  format?: string;
  formats: Format[];
  groups?: DecklistGroup[];
  deck_warnings?: string[];
  decklist_text?: string;
  onDeckUpdate: (deck_name: string, format: string, decklist_text: string) => void;
  onDeleteDeck: () => void;
}

const LibraryDeckEditor: React.FC<LibraryDeckEditorProps> = (props) => {
  interface Inputs {
    deck_name: string;
    format: string;
    decklist_text: string;
  }

  const [decklistStyle, setDecklistStyle] = useState<string | undefined>(undefined);

  const { register, handleSubmit, clearErrors, watch, setError, reset, formState: { errors, isDirty, isSubmitting } } = useForm<Inputs>({
    defaultValues: {
      deck_name: props.deck_name,
      format: props.format,
      decklist_text: props.decklist_text
    }
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'format') {
        const style = props.formats.find(format => format.format === value.format)?.decklist_style;
        setDecklistStyle(style);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, props.formats]);

  useEffect(() => {
    if (props.format) {
      const style = props.formats.find(format => format.format === props.format)?.decklist_style;
      setDecklistStyle(style);
    }
  }, [props.format, props.formats]);

  const onSubmitDecklist = withValidation(setError, async (data: Inputs) => {
    await props.onDeckUpdate(data.deck_name, data.format, data.decklist_text);
    reset(data);
  });

  const handleDeleteDeck = async () => {
    if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      props.onDeleteDeck();
    }
  };

  const mainboardCount = props.groups
    ? props.groups
      .filter(group => group.group_name !== "Sideboard")
      .flatMap(group => group.cards)
      .reduce((sum, card) => sum + card.quantity, 0)
    : 0;

  const sideboardCount = props.groups
    ? props.groups
      .find(group => group.group_name === "Sideboard")?.cards
      .reduce((sum, card) => sum + card.quantity, 0) || 0
    : 0;

  return (
    <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmitDecklist)(e); }}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                id="deck_name"
                className="pl-9"
                placeholder="Deck Name"
                required
                aria-invalid={!!errors.deck_name}
                {...register("deck_name", { value: props.deck_name })}
              />
            </div>
            {props.groups && (
              <Button type="button" variant="destructive" size="icon" onClick={handleDeleteDeck} title="Delete Deck">
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          {errors.deck_name && <p className="mt-1 text-sm text-destructive">{errors.deck_name.message}</p>}

          <div className="relative mt-2">
            <FileText className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              id="format"
              className={`${selectClasses} pl-9`}
              aria-invalid={!!errors.format}
              {...register("format")}
            >
              <option value="" defaultChecked>Select a format</option>
              {props.formats.map(format => (
                <option key={format.format} value={format.format}>{format.name}</option>
              ))}
            </select>
          </div>
          {errors.format && <p className="mt-1 text-sm text-destructive">{errors.format?.message}</p>}

          {decklistStyle && (<>
            <div className="mt-3">
              <div className="mb-1 text-right text-sm">
                <a
                  href={`/help/decklist#${decklistStyle.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  See formatting guide
                </a>
              </div>
              <DecklistTextarea
                id="decklist_text"
                placeholder={getDecklistPlaceholder(decklistStyle)}
                required
                aria-invalid={!!errors.decklist_text}
                registration={register("decklist_text", { value: props.decklist_text })}
                style={{ width: '100%', height: 400 }}
                knownCards={props.groups ? new Set(props.groups.flatMap(g => g.cards.map(c => c.card_name.toLowerCase()))) : undefined}
              />
              {errors.decklist_text && <p className="mt-1 text-sm text-destructive">{errors.decklist_text.message}</p>}
            </div>
            <div className="mt-2 flex min-h-[44px] items-center justify-between gap-2">
              <div className="flex gap-3 text-sm text-muted-foreground">
                {decklistStyle.toLowerCase() === "commander" ? (
                  <span className="whitespace-nowrap">Deck: {mainboardCount}</span>
                ) : (
                  <>
                    <span className="whitespace-nowrap">Main: {mainboardCount}</span>
                    <span className="whitespace-nowrap">Side: {sideboardCount}</span>
                  </>
                )}
              </div>
              {isDirty && (
                <Button type="submit" id="submit-button" className="whitespace-nowrap" disabled={isSubmitting}>
                  {isSubmitting ? (<><Spinner className="size-4 text-current" />Saving</>) : 'Save Decklist'}
                </Button>
              )}
            </div>
          </>)}

          {props.deck_warnings && props.deck_warnings.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <AlertTitle>Deck Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {props.deck_warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-2 lg:col-span-2">
          {props.groups && <DecklistTable cardGroups={props.groups} allowChecklist={false} />}
        </div>
      </div>
    </form>
  );
}
