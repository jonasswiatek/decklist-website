
export type Event = {
    event_name: string;
    event_id: string;
    format: string;
    role: string;
    event_date: Date;
}

export type LoginStartResponse = {
    success: boolean,
    notification: string
}

export type LoginContinueResponse = {
    success: boolean,
    error_type: string
}

export type ValidationErrorResponse = {
    title: string,
    status: number,
    errors: any
}