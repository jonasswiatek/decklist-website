import React from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { EventDetails, getEvent } from '../../../model/api/apimodel';
import { useQuery } from 'react-query';
import { LoadingScreen } from '../../Login/LoadingScreen';

export const QRCodeView: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const inviteLink = `${window.location.origin}/e/${eventId}`;

    const { data, error, isLoading } = useQuery<EventDetails>({
        queryKey: [`event-${eventId}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getEvent(eventId!),
    });

    if (isLoading) {
        return <LoadingScreen />
    }

    if(error === "error") {
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
            padding: '20px'
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
                            height: 99%;
                        }
                        .no-print { 
                            display: none !important; 
                        }
                        .qr-code-container { 
                            height: 100% !important;
                            width: 100% !important;
                            padding: 10px !important;
                            margin: 0 !important;
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                        }
                        h1 { 
                            margin-top: 10px !important;
                            margin-bottom: 15px !important;
                            font-size: 20px !important;
                        }
                        .qr-wrapper {
                            padding: 15px !important;
                            box-shadow: none !important;
                            border: 1px solid #ccc !important;
                            max-width: 300px !important;
                            margin: 0 auto !important;
                        }
                    }
                `}
            </style>
            
            <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>{data.event_name}</h1>
            
            <div className="qr-wrapper" style={{ 
                border: '1px solid #ccc', 
                padding: '30px', 
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#f5f5f5',
                maxWidth: '100%',
                textAlign: 'center'
            }}>
                <QRCode 
                    value={inviteLink} 
                    size={220}
                    level="H"
                    renderAs="svg"
                    includeMargin={true}
                    bgColor="#f5f5f5"
                />
                
                <div style={{ marginTop: '15px', wordBreak: 'break-all' }}>
                    <p style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}><strong>Scan to register your decklist</strong></p>
                    <p style={{ fontSize: '12px', color: '#333', marginTop: '0' }}>{inviteLink}</p>
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
