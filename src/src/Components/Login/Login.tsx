import { useState } from 'react'
import { useForm, SubmitHandler } from "react-hook-form";
import { useDecklistStore, ValidationError } from '../../store/deckliststore';

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
    catch(err) {
      if (err instanceof ValidationError) {
        if (err.Errors.errors.email) {
          setError("email", { type: 'custom', message: err.Errors.errors.email[0] });
        }
      }
      else {
        throw err;
      }
    }
  }

  return (
    <> 
      <div className="py-3 py-md-5">
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
              <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-5">
                      <h3>Log in</h3>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row gy-3 gy-md-4 overflow-hidden">
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" id="email" placeholder="name@example.com" required {...register("email")} />
                      {errors.email && <p>{errors.email?.message}</p>}
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn btn-lg btn-primary" type="submit">Log in now</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
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

  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      let result = await continueLogin(pendingLoginEmail!, data.code);
      if (!result.success) {
        setError("code", { type: 'custom', message: "Invalid code" });
      }
    }
    catch(err) {
      if (err instanceof ValidationError) {
        if (err.Errors.errors.code) {
          setError("code", { type: 'custom', message: err.Errors.errors.code[0] });
        }
      }
      else {
        throw err;
      }
    }
  }

  return (
    <>
      <div className="py-3 py-md-5">
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
              <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-5">
                      <h3>Verify</h3>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row gy-3 gy-md-4 overflow-hidden">
                    <div className="col-12">
                      <label htmlFor="code" className="form-label">Enter code sent to your email</label>
                      <input type="number" className="form-control" id="code" placeholder="000000" required {...register("code")} />
                      {errors.code && <p>{errors.code?.message}</p>}
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn btn-lg btn-primary" type="submit">Log in now</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
