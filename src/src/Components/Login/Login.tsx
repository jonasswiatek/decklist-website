import { useForm, SubmitHandler } from "react-hook-form";
import { AuthState, useDecklistStore } from '../../store/deckliststore';
import { HandleValidation } from "../../Util/Validators";
import { useState } from "react";
import React from "react";
import { GoogleLogin } from "@react-oauth/google";

export function LoginScreen() {
  const { authState, logout, googleLogin } = useDecklistStore();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  if (authState == AuthState.Authorized) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">Account</h3>
                <p>You are currently logged in.</p>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              {currentEmail === null ? (
                <>
                  <StartLogin onStarted={(email) => setCurrentEmail(email)} />
                  
                  <div className="d-flex align-items-center my-4">
                    <hr className="flex-grow-1" />
                    <span className="mx-3 text-muted">OR</span>
                    <hr className="flex-grow-1" />
                  </div>
                  
                  <div className="d-grid gap-2">
                    <div className="d-flex justify-content-center">
                      <GoogleLogin
                        onSuccess={credentialResponse => {
                          googleLogin(credentialResponse.credential!);
                          console.log(credentialResponse);
                        }}
                        onError={() => {
                          console.log('Login Failed');
                        }}
                        useOneTap
                        shape="rectangular"
                        text="signin_with"
                        locale="en"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <ContinueLogin email={currentEmail} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type LoginProps = {
  onStarted: (email: string) => void;
}

const StartLogin: React.FC<LoginProps> = ({onStarted}) => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();
  const { startLogin } = useDecklistStore();
  
  type Inputs = {
    email: string
  };
  
  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      await startLogin(data.email);
      onStarted(data.email);
    }
    catch(e) {
      HandleValidation(setError, e);
    }
  }

  return (
    <>
      <h3 className="card-title mb-4">Log in</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
          <input 
            type="email" 
            className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
            id="email" 
            placeholder="name@example.com" 
            required 
            {...register("email")} 
          />
          {errors.email && <div className="invalid-feedback">{errors.email?.message}</div>}
        </div>
        <div className="d-grid gap-2">
          <button className="btn btn-primary" type="submit">Continue</button>
        </div>
      </form>
    </>
  )
}

type ContinueLoginProps = {
  email: string
}

const ContinueLogin: React.FC<ContinueLoginProps> = ({email}) => {
  type Inputs = {
    code: string;
  };
  
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();
  const { continueLogin } = useDecklistStore();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      await continueLogin(email, data.code);
    }
    catch(e) {
      HandleValidation(setError, e);
    }
  }

  return (
    <>
      <h3 className="card-title mb-4">Verify Your Email</h3>
      <p className="text-muted mb-4">A verification code has been sent to <strong>{email}</strong></p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="code" className="form-label">Verification Code</label>
          <input 
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*" 
            className={`form-control ${errors.code ? 'is-invalid' : ''}`} 
            id="code" 
            placeholder="000000" 
            required 
            {...register("code")} 
          />
          {errors.code && <div className="invalid-feedback">{errors.code?.message}</div>}
        </div>
        <div className="d-grid gap-2">
          <button className="btn btn-primary" type="submit">Verify</button>
        </div>
      </form>
    </>
  )
}
