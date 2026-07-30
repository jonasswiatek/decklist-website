import { ReactElement, useState, useEffect } from "react";
import { Spinner } from "@/Components/ui/spinner";

const LOADING_MESSAGES = [
    "Checking sleeves",
    "Passing turn",
    "Waiting for the next round to start",
    "Sideboarding",
    "Missing Triggers",
    "Holding priority",
    "Contemplating life choices",
    "Fetching for a Mountain",
    "Paying the one",
    "Drawing for turn",
    "Thoughtseize?",
    "Mulling to 5",
];

export const LoadingScreen = (): ReactElement => {
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
        setMessage(LOADING_MESSAGES[randomIndex]);
    }, []);

    return (
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4">
            <Spinner className="size-12 text-primary" />
            <p className="text-base font-medium text-muted-foreground">{message}</p>
        </div>
    );
};
