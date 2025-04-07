import { FieldValues, UseFormSetError, Path } from "react-hook-form";
import { ValidationError } from "../model/api/apimodel";

export function HandleValidation<T extends FieldValues>(setError: UseFormSetError<T>, e: unknown) {
    if (e instanceof ValidationError)
    {
        const errors = e as ValidationError
        for(const key in errors.ValidationError.errors) {
            const val = errors.ValidationError.errors[key];
            if (!val)
                continue;

            const message = val[0];
            console.log(key, message, val);
            setError(key as Path<T>,  { type: 'custom', message: message })
        }
    }
    else {
        throw e;
    } 
}