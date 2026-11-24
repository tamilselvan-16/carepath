import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface PatientQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const PatientQRCode: React.FC<PatientQRCodeProps> = ({
  value,
  size = 110,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('Error generating QR Code:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className={`inline-flex p-1.5 bg-white rounded-xl shadow-xs border border-slate-200/80 ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};
