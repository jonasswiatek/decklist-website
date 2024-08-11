import { useForm, SubmitHandler } from "react-hook-form";
import { useDecklistStore } from '../../store/deckliststore';
import { HandleValidation } from "../../Util/Validators";
import { useNavigate } from "react-router-dom";

export function LoginScreen() {
  const { isLoggedIn, pendingLoginEmail, logout } = useDecklistStore();
  
  let component;
  if (isLoggedIn) {
    component = <>
      <p>
      <button onClick={() => logout()}> 
          Log out
        </button>
      </p>
    </>;
  }
  else {
    if (pendingLoginEmail === null)
      component = <StartLogin />
    else
      component = <ContinueLogin />
  }

  return component
}

export function StartLogin() {
  type Inputs = {
    email: string
  };
  
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();
  const { startLogin } = useDecklistStore();
  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      await startLogin(data.email);
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

export function ContinueLogin() {
  type Inputs = {
    code: string;
  };
  
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();
  const { pendingLoginEmail, continueLogin } = useDecklistStore();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      await continueLogin(pendingLoginEmail!, data.code);
      navigate("/events");
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
