import { ReactElement } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { HandleValidation } from '../../Util/Validators';
import { useCreateTournamentMutation } from '../../Hooks/useTournamentMutations';
import { PageContainer } from "@/Components/layout/PageContainer";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Spinner } from "@/Components/ui/spinner";

// Define the expected input type for the form
type Inputs = {
  tournament_name: string;
};

export function CreateTournament(): ReactElement {
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<Inputs>();
  const navigate = useNavigate();

  const mutation = useCreateTournamentMutation({
    onSuccess: (data) => {
      navigate('/timers/' + data.tournament_id);
    },
    onError: (e) => HandleValidation(setError, e),
  });

  const onSubmit = (data: Inputs) => {
    clearErrors();
    mutation.mutate({
      body: {
        tournament_name: data.tournament_name,
      },
    });
  };

  return (
    <PageContainer size="sm">
      <div className="mb-4">
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={() => navigate('/timers')}
        >
          <ArrowLeft className="size-4" /> Back to Tournament Timers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Tournament Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root?.serverError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.root.serverError.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="tournament_name">Tournament Name</Label>
              <Input
                type="text"
                id="tournament_name"
                placeholder="Enter tournament name (e.g., Modern RCQ Q1)"
                aria-invalid={!!errors.tournament_name}
                {...register("tournament_name", { required: "Tournament name is required" })}
              />
              {errors.tournament_name && (
                <p className="text-sm text-destructive">{errors.tournament_name?.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="size-4 text-current" />
                  Creating...
                </>
              ) : 'Create Tournament Timer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
