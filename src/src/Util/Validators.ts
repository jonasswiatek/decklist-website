import { FieldValues, UseFormSetError, Path, SubmitHandler } from "react-hook-form";
import { ValidationError, ValidationErrorResponse } from "../model/api/apimodel";

function isValidationErrorResponse(e: unknown): e is ValidationErrorResponse {
    return typeof e === "object" && e !== null && "errors" in e && typeof (e as ValidationErrorResponse).errors === "object";
}

export function HandleValidation<T extends FieldValues>(setError: UseFormSetError<T>, e: unknown) {
    // Raw ProblemDetails object (from useMutation onError)
    if (isValidationErrorResponse(e)) {
        const errors = e.errors;
        if (errors) {
            for (const key in errors) {
                const val = errors[key];
                if (!val) continue;
                const message = val[0];
                setError(key as Path<T>, { type: 'custom', message: message });
            }
        }
        return;
    }

    // Wrapped in ValidationError class (from manual API calls)
    if (e instanceof ValidationError) {
        const errors = e.ValidationError.errors;
        if (errors) {
            for (const key in errors) {
                const val = errors[key];
                if (!val) continue;
                const message = val[0];
                setError(key as Path<T>, { type: 'custom', message: message });
            }
        }
        return;
    }

    throw e;
}

export function withValidation<T extends FieldValues>(
    setError: UseFormSetError<T>,
    handler: SubmitHandler<T>,
): SubmitHandler<T> {
    return async (data, event) => {
        try {
            await handler(data, event);
        } catch (e) {
            HandleValidation(setError, e);
        }
    };
}
