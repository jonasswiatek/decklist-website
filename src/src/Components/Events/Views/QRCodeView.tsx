import React from 'react';
import { useParams } from 'react-router-dom';
import { LoadingScreen } from '../../Login/LoadingScreen';
import { useEventDetailsQuery } from '../../../Hooks/useEventDetailsQuery';
import { QRCodeSVG } from 'qrcode.react';

export const QRCodeView: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const inviteLink = `${window.location.origin}/e/${eventId}`;

    const { data, error, isLoading } = useEventDetailsQuery(eventId!);

    if (isLoading) {
        return <LoadingScreen />
    }

    if(error) {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Error. Try again later.</p>
                    </div>
                </div>
            </>
        )
    }

    if(!data) {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Can't find this tournament. Check that the code you entered is correct.</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="qr-code-container" style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '20px',
            width: '100%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
            <style>
                {`
                    @media print {
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            height: 100% !important;
                            width: 100% !important;
                            overflow: hidden !important;
                        }
                        .no-print { 
                            display: none !important; 
                        }
                        .qr-code-container { 
                            height: 100vh !important;
                            width: 100% !important;
                            padding: 10px !important;
                            margin: 0 !important;
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            position: fixed !important;
                            top: 0 !important;
                            left: 0 !important;
                            transform: none !important;
                            display: flex !important;
                            flex-direction: column !important;
                            justify-content: center !important;
                            align-items: center !important;
                        }
                        .event-title { 
                            margin-top: 0 !important;
                            margin-bottom: 20px !important;
                            font-size: 28px !important;
                            display: block !important;
                            visibility: visible !important;
                            color: black !important;
                            z-index: 100 !important;
                            position: relative !important;
                            text-align: center !important;
                            transform: scale(1.4) !important;
                        }
                        .qr-wrapper {
                            padding: 25px !important;
                            box-shadow: none !important;
                            border: 1px solid #ccc !important;
                            max-width: 420px !important;
                            margin: 0 auto !important;
                            transform: scale(1.4) !important;
                            margin-top: 20px !important;
                        }
                        .qr-wrapper p {
                            font-size: 1.4em !important;
                        }
                        .qr-wrapper p:last-child {
                            font-size: 0.9em !important;
                        }
                        
                        /* This forces the title and QR wrapper to be separate */
                        .event-title-container {
                            margin-bottom: 30px !important;
                            width: 100% !important;
                            text-align: center !important;
                        }
                        .qr-wrapper-container {
                            margin-top: 30px !important;
                        }
                    }
                `}
            </style>
            
            <div className="event-title-container">
                <h1 className="event-title" style={{ marginBottom: '30px', textAlign: 'center' }}>{data.event_name}</h1>
            </div>
            
            <div className="qr-wrapper-container">
                <div className="qr-wrapper" style={{ 
                    border: '1px solid #ccc', 
                    padding: '30px', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#f5f5f5',
                    maxWidth: '100%',
                    textAlign: 'center'
                }}>
                    <QRCodeSVG 
                        value={inviteLink} 
                        size={220}
                        level="H"
                        bgColor="#f5f5f5"
                        className="qr-code"
                    />
                    
                    <div style={{ marginTop: '15px', wordBreak: 'break-all' }}>
                        <p style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}><strong>Scan to register your decklist</strong></p>
                        <p style={{ fontSize: '12px', color: '#333', marginTop: '0' }}>{inviteLink}</p>
                    </div>
                </div>
            </div>
            
            <div className="no-print" style={{ marginTop: '30px' }}>
                <button 
                    onClick={() => window.print()} 
                    className="btn btn-primary"
                >
                    Print QR Code
                </button>
                <button 
                    onClick={() => window.close()} 
                    className="btn btn-secondary ms-2"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
