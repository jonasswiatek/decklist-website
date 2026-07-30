import React from 'react';
import { useParams } from 'react-router-dom';
import { LoadingScreen } from '../../Login/LoadingScreen';
import { useEventDetailsQuery } from '../../../Hooks/useEventDetailsQuery';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/Components/ui/button';

export const QRCodeView: React.FC = () => {
    const { event_id } = useParams<{ event_id: string }>();
    const inviteLink = `${window.location.origin}/e/${event_id}`;

    const { data, isError, isLoading } = useEventDetailsQuery(event_id!);

    if (isLoading) {
        return <LoadingScreen />
    }

    if (isError) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
                <p className="text-muted-foreground">Error. Try again later.</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
                <p className="text-muted-foreground">Can't find this tournament. Check that the code you entered is correct.</p>
            </div>
        )
    }

    return (
        <div className="qr-code-container flex min-h-svh w-full flex-col items-center justify-center gap-8 bg-background p-5">
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

            <div className="event-title-container text-center">
                <h1 className="event-title text-3xl font-bold tracking-tight sm:text-4xl">{data.event_name}</h1>
            </div>

            <div className="qr-wrapper-container">
                <div className="qr-wrapper max-w-full rounded-xl border border-[#ccc] bg-[#f5f5f5] p-8 text-center shadow-lg">
                    <QRCodeSVG
                        value={inviteLink}
                        size={260}
                        level="H"
                        bgColor="#f5f5f5"
                        className="qr-code"
                    />

                    <div className="mt-4 break-all">
                        <p className="mb-1 font-bold text-[#333]"><strong>Scan to register your decklist</strong></p>
                        <p className="mt-0 text-xs text-[#333]">{inviteLink}</p>
                    </div>
                </div>
            </div>

            <div className="no-print flex gap-2">
                <Button onClick={() => window.print()}>Print QR Code</Button>
                <Button variant="secondary" onClick={() => window.close()}>Close</Button>
            </div>
        </div>
    );
};
