import { useForm } from "react-hook-form";
import { withValidation } from "../../Util/Validators";
import { useState, useEffect } from "react";
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { useAuthQuery } from "../../Hooks/useAuthQuery";
import { useStartLoginMutation, useContinueLoginMutation, useGoogleLoginMutation } from "../../Hooks/useAuthMutations";
import { PageContainer } from "@/Components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Spinner } from "@/Components/ui/spinner";

export function LoginScreen() {
  const { authorized } = useAuthQuery();
  const queryClient = useQueryClient();
  const googleLoginMutation = useGoogleLoginMutation({
    onSuccess: () => {
      queryClient.resetQueries();
    },
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get('return') || '/';

  const handleGoogleLogin = (credentialResponse: string) => {
    googleLoginMutation.mutate({ body: { token: credentialResponse } }, {
      onSuccess: () => navigate(returnTo),
    });
  }

  if (authorized) {
    return <Navigate to={returnTo} replace />;
  }

  return (
    <PageContainer size="default">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-start">
        <Card>
          <CardContent className="pt-6">
            <LoginForm returnTo={returnTo} />

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By logging in, you agree to our{" "}
              <a href="/help/privacy" className="text-primary underline-offset-4 hover:underline">Privacy Policy</a>
            </p>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  handleGoogleLogin(credentialResponse.credential!);
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
                shape="rectangular"
                text="signin_with"
                theme="filled_black"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              You can't anonymously submit a decklist, because this would put unreasonable load on event staff if you submit what later turns out to be an incorrect decklist, or you later wish to change it prior to event start.
            </p>
            <p>
              Regardless of whether you log in with email or a Google account, we do not store any personal information — not even your email address is stored.
            </p>
            <p>
              I only need to be able to authenticate you later so you can view, alter or delete your decklist.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

const LoginForm: React.FC<{ returnTo: string }> = ({ returnTo }) => {
  const [email, setEmail] = useState("");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Inputs>();
  const queryClient = useQueryClient();
  const startLoginMutation = useStartLoginMutation();
  const continueLoginMutation = useContinueLoginMutation();
  const navigate = useNavigate();

  const startResult = startLoginMutation.data?.result;
  const isVerifying = startResult === "SENT_NEW_CODE" || startResult === "REUSE_EXISTING_CODE";
  const tooManyAttempts = continueLoginMutation.data?.error_type === "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE";

  type Inputs = {
    email: string;
    code?: string;
  };

  const onSubmit = withValidation(setError, async (data: Inputs) => {
    if (!isVerifying) {
      continueLoginMutation.reset();
      const response = await startLoginMutation.mutateAsync({ body: { email: data.email.trim() } });
      if (response.result === "TOO_MANY_ATTEMPTS") {
        setError("email", { type: "custom", message: "Too many login attempts. Please try again later." });
        return;
      }
      setEmail(data.email);
    } else {
      const response = await continueLoginMutation.mutateAsync({ body: { email: email.trim(), code: data.code!.trim() } });
      if (response.success) {
        queryClient.resetQueries();
        navigate(returnTo);
      }
    }
  });

  const handleStartOver = () => {
    startLoginMutation.reset();
    continueLoginMutation.reset();
  };

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!tooManyAttempts) {
      setCountdown(60);
      return;
    }
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [tooManyAttempts, countdown]);

  if (tooManyAttempts) {
    return (
      <div className="py-3 text-center">
        <div className="grid place-items-center">
          <div className="grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Lock className="size-7" />
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold">Too many attempts</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You've entered an incorrect code too many times.<br />Please wait before trying again.
        </p>
        {countdown > 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">You can start over in <strong className="text-foreground">{countdown}s</strong></p>
        ) : (
          <p className="mt-4 text-sm text-primary">You can start over now.</p>
        )}
        <Button variant="outline" className="mt-4" onClick={handleStartOver} disabled={countdown > 0}>Start over</Button>
      </div>
    );
  }

  const verificationMessage = startResult === "REUSE_EXISTING_CODE"
    ? <>A code was already sent to <strong className="text-foreground">{email}</strong>. Check your inbox.</>
    : <>A verification code has been sent to <strong className="text-foreground">{email}</strong></>;

  return (
    <div>
      <h3 className="text-xl font-semibold">{isVerifying ? "Verify your email" : "Log in"}</h3>
      {isVerifying && <p className="mt-2 text-sm text-muted-foreground">{verificationMessage}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        {!isVerifying ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                id="email"
                placeholder="name@example.com"
                required
                aria-invalid={!!errors.email}
                disabled={isVerifying || isSubmitting}
                defaultValue={email}
                {...register("email")}
              />
              <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                {isSubmitting ? (<><Spinner className="size-4 text-current" />Sending...</>) : 'Continue'}
              </Button>
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email?.message}</p>}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="code"
                  placeholder="000000"
                  required
                  aria-invalid={!!errors.code}
                  disabled={isSubmitting}
                  {...register("code")}
                />
                <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                  {isSubmitting ? (<><Spinner className="size-4 text-current" />Verifying...</>) : 'Verify'}
                </Button>
              </div>
              {errors.code && <p className="text-sm text-destructive">{errors.code?.message}</p>}
            </div>
          </>
        )}
      </form>
    </div>
  )
}
