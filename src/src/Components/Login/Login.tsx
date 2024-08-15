import { useForm, SubmitHandler } from "react-hook-form";
import { AuthState, useDecklistStore } from '../../store/deckliststore';
import { HandleValidation } from "../../Util/Validators";
import { useState } from "react";
import React from "react";

export function LoginScreen() {
  const { authState, logout } = useDecklistStore();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  let component;
  if (authState == AuthState.Authorized) {
    component = <>
      <p>
        <button onClick={() => logout()}>
          Log out
        </button>
      </p>
    </>;
  }
  else {
    if (currentEmail === null)
      component = <StartLogin onStarted={(email) => setCurrentEmail(email)} />
    else
      component = <ContinueLogin email={currentEmail} />
  }

  return component
}

type LoginProps = {
  onStarted: (email: string) => void;
}

export const StartLogin: React.FC<LoginProps> = ({onStarted}) => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();
  const { startLogin } = useDecklistStore();
  
  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      await startLogin(data.email);
      onStarted(data.email);
    }
    catch(e) {
      HandleValidation(setError, e);
    }
  }

  type Inputs = {
    email: string
  };

  return (
    <> 
      <div className="py-3 py-md-5">
        <div className="container">
          <div className="row">
            <div className="col">
              <h3>Log in</h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col">
                    <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" id="email" placeholder="name@example.com" required {...register("email")} />
                    {errors.email && <p>{errors.email?.message}</p>}
                  </div>
                  <div className="col">
                    <button className="btn btn-lg btn-primary" type="submit">Log in now</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type ContinueLoginProps = {
  email: string
}

export const ContinueLogin: React.FC<ContinueLoginProps> = ({email}) => {
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
      <div className="py-3 py-md-5">
        <div className="container">
          <div className="row">
            <div className="col">
              <h3>Verify</h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col">
                    <label htmlFor="code" className="form-label">Enter code sent to your email</label>
                    <input type="number" className="form-control" id="code" placeholder="000000" required {...register("code")} />
                    {errors.code && <p>{errors.code?.message}</p>}
                  </div>
                  <div className="col">
                    <button className="btn btn-lg btn-primary" type="submit">Verify</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
