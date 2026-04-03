import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeGenerator({ batchId }) {
  const [showModal, setShowModal] = useState(false);

  // The base URL for tracing that the QR code will point to
  // Adjust this domain depending on where you host the app
  const traceUrl = `http://localhost:3000/trace/${batchId}`;

  const toggleModal = () => setShowModal(!showModal);

  const printLabel = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    // Using simple HTML string for the print window
    const printContent = `
      <html>
        <head>
          <title>Print Label</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .label-container { text-align: center; padding: 2rem; border: 2px dashed #000; }
            .label-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .label-id { font-size: 18px; margin-bottom: 20px; color: #555; }
            svg { width: 250px; height: 250px; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="label-title">AgriChain Produce Tracking</div>
            <div class="label-id">Batch ID: #${batchId}</div>
            <div id="qr-mount-point"></div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    
    // Copy the SVG into the print window
    const svgElement = document.getElementById(`qr-code-${batchId}`);
    if (svgElement) {
      printWindow.document.getElementById('qr-mount-point').innerHTML = svgElement.outerHTML;
    }
    
    printWindow.document.close();
  };

  return (
    <>
      <button 
        onClick={toggleModal}
        style={{
          background: 'linear-gradient(to right, #4ade80, #3b82f6)',
          color: 'white',
          border: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        🖨️ Generate QR Label
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            color: 'white',
            padding: '2rem',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{marginTop: 0, color: '#4ade80'}}>Scan to Trace</h2>
            <p style={{color: '#94a3b8', marginBottom: '1.5rem'}}>
              Attach this QR code to the product batch for logistics and tracking.
            </p>
            
            <div style={{
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '1.5rem'
            }}>
              <QRCodeSVG 
                id={`qr-code-${batchId}`}
                value={traceUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Batch ID: #{batchId}
            </div>

            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <button 
                onClick={printLabel}
                style={{
                  background: '#3b82f6', color: 'white', border: 'none',
                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'
                }}
              >
                Print
              </button>
              <button 
                onClick={toggleModal}
                style={{
                  background: 'transparent', color: '#94a3b8', border: '1px solid #475569',
                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
