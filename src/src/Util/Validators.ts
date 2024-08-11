import { FieldValues, UseFormSetError, Path } from "react-hook-form";
import { ValidationError } from "../store/deckliststore";

export function HandleValidation<T extends FieldValues>(setError: UseFormSetError<T>, e: any) {    
    if (e instanceof ValidationError)
    {
        for(let key in e.ValidationError.errors) {
            const message = e.ValidationError.errors[key][0];
            console.log(key, message);
            setError(key as Path<T>,  { type: 'custom', message: message })
        }
    }
    else {
        throw e;
    } 
}