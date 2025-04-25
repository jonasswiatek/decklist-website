import { ReactElement, useState, useEffect } from "react";

export const LoadingScreen = (): ReactElement => {
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const loadingMessages = [
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
            "Mulling to 5"
        ];
    
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        setMessage(loadingMessages[randomIndex]);
    }, [setMessage]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100%'
        }}>
            <div style={{
                border: '4px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '50%',
                borderTop: '4px solid #3498db',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
            }}></div>
            
            <p style={{
                marginTop: '20px',
                color: '#3498db',
                fontSize: '16px',
                fontWeight: 'medium'
            }}>
                {message}
            </p>
            
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};
