import { useForm, SubmitHandler } from "react-hook-form";
import { AuthState, useDecklistStore } from '../../store/deckliststore';
import { HandleValidation } from "../../Util/Validators";
import { useState } from "react";
import React from "react";
import { GoogleLogin } from "@react-oauth/google";

export function LoginScreen() {
  const { authState, logout, googleLogin } = useDecklistStore();

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
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body">
              <LoginForm />
              
              <p className="small text-muted text-center mt-3 mb-0">
                By logging in, you agree to our <a href="/help/privacy">Privacy Policy</a>
              </p>
              
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
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mt-3 mt-md-0">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">Please consider Google Login</h5>
              <p className="card-text">
                Sending emails isn't free, so unless you absolutely can't make yourself do it, pleaes use Google Login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LoginForm: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();
  const { startLogin, continueLogin } = useDecklistStore();
  
  type Inputs = {
    email: string;
    code?: string;
  };
  
  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      if (!isVerifying) {
        await startLogin(data.email);
        setEmail(data.email);
        setIsVerifying(true);
      } else {
        await continueLogin(email, data.code!);
      }
    }
    catch(e) {
      HandleValidation(setError, e);
    }
  }

  return (
    <>
      <h3 className="card-title mb-4">{isVerifying ? "Verify Your Email" : "Log in"}</h3>
      {isVerifying && <p className="text-muted mb-4">A verification code has been sent to <strong>{email}</strong></p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          {!isVerifying ? (
            <div className="input-group">
              <label htmlFor="email" className="form-label d-none">Email <span className="text-danger">*</span></label>
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                id="email" 
                placeholder="name@example.com" 
                required 
                disabled={isVerifying}
                defaultValue={email}
                {...register("email")} 
              />
              <button className="btn btn-primary" type="submit">
                Continue
              </button>
              {errors.email && <div className="invalid-feedback">{errors.email?.message}</div>}
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  value={email}
                  disabled
                />
              </div>
              <div className="input-group">
                <label htmlFor="code" className="form-label d-none">Verification Code</label>
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
                <button className="btn btn-primary" type="submit">
                  Verify
                </button>
                {errors.code && <div className="invalid-feedback">{errors.code?.message}</div>}
              </div>
            </>
          )}
        </div>
      </form>
    </>
  )
}
