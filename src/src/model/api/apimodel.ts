
export type Event = {
    event_name: string;
    event_id: string;
    format: string;
    role: string;
    created: Date;
}

export type LoginStartResponse = {
    success: boolean,
    notification: string
}

export type LoginContinueResponse = {
    success: boolean,
    error_type: string
}