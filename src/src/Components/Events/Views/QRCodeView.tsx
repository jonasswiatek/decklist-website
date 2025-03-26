import React from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { BsArrowLeft } from 'react-icons/bs';

const QRCodeView: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const inviteUrl = `${window.location.origin}/e/${eventId}`;
  
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Event QR Code</h2>
            <a href={`/e/${eventId}`} className="btn btn-outline-secondary">
              <BsArrowLeft className="me-2" /> Back to Event
            </a>
          </div>
        </div>
        <div className="card-body text-center">
          <div className="mb-4">
            <p className="lead">Scan this QR code to join the event:</p>
            <div className="d-flex justify-content-center">
              <div style={{ background: 'white', padding: '20px', border: '1px solid #ddd' }}>
                <QRCodeCanvas 
                  value={inviteUrl} 
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-light rounded">
            <p className="mb-1"><strong>Event Link:</strong></p>
            <p className="mb-0 text-break">{inviteUrl}</p>
          </div>
          <div className="mt-4">
            <button 
              className="btn btn-primary" 
              onClick={() => navigator.clipboard.writeText(inviteUrl)}
            >
              Copy Link to Clipboard
            </button>
            <a 
              href={`/e/${eventId}`} 
              className="btn btn-secondary ms-3"
            >
              Return to Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeView;
