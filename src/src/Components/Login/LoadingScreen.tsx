import { ReactElement } from "react";

export const LoadingScreen = (): ReactElement => {
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
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading...</p>
        </div>
    );
};
