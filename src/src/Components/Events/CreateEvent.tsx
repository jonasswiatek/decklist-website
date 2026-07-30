import { useForm } from "react-hook-form";
import { HandleValidation } from '../../Util/Validators';
import { useNavigate } from "react-router-dom";
import { ReactElement } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFormatsQuery } from '../../Hooks/useFormatsQuery';
import { useCreateEventMutation } from '../../Hooks/useEventMutations';
import { PageContainer } from '@/Components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Spinner } from '@/Components/ui/spinner';

const selectClasses = "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_option]:bg-popover [&_option]:text-popover-foreground [&_optgroup]:bg-popover [&_optgroup]:text-popover-foreground";

export function CreateEvent(): ReactElement {
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<Inputs>();
  const navigate = useNavigate();

  const { data: formats, isLoading: formatsLoading, isError: isFormatsError } = useFormatsQuery();

  const mutation = useCreateEventMutation({
    onSuccess: (data) => {
      navigate('/e/' + data.event_id);
    },
    onError: (e) => HandleValidation(setError, e),
  });

  const onSubmit = (data: Inputs) => {
    clearErrors();
    mutation.mutate({
      body: {
        event_name: data.event_name.trim(),
        format: data.format,
        event_date: data.event_date.toString(),
      },
    });
  };

  type Inputs = {
    event_name: string,
    format: string
    event_date: Date;
  };

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 1);
  const minDateString = minDate.toISOString().split('T')[0];

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <PageContainer size="sm">
      <Button variant="link" className="mb-3 h-auto p-0 text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
        <ArrowLeft className="size-4" /> Back to Events
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event_name">Tournament Name</Label>
              <Input
                id="event_name"
                type="text"
                placeholder="Modern RCQ"
                required
                aria-invalid={!!errors.event_name}
                {...register("event_name")}
              />
              {errors.event_name && <p className="text-sm text-destructive">{errors.event_name?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Tournament Date</Label>
              <Input
                id="event_date"
                type="date"
                required
                aria-invalid={!!errors.event_date}
                {...register("event_date")}
                min={minDateString}
                max={maxDateString}
              />
              {errors.event_date && <p className="text-sm text-destructive">{errors.event_date?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              {formatsLoading ? (
                <div className="rounded-md border p-2 text-center">
                  <span className="text-sm text-muted-foreground">Loading formats...</span>
                </div>
              ) : isFormatsError ? (
                <Alert variant="destructive">
                  <AlertDescription>Error loading formats. Please refresh the page.</AlertDescription>
                </Alert>
              ) : (
                <select
                  id="format"
                  className={selectClasses}
                  aria-invalid={!!errors.format}
                  {...register("format")}
                >
                  {formats?.formats.map(format => (
                    <option key={format.format} value={format.format}>{format.name}</option>
                  ))}
                </select>
              )}
              {errors.format && <p className="text-sm text-destructive">{errors.format?.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending || formatsLoading || !!isFormatsError}
            >
              {mutation.isPending ? (<><Spinner className="size-4 text-current" />Creating...</>) : 'Create Tournament'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
