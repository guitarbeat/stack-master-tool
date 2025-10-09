import { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { Camera, X, QrCode } from 'lucide-react';

interface QrCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QrCodeScanner({ onScan, onClose }: QrCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsScanning(true);
        scanForQrCode();
      }
    } catch (err) {
      setError('Camera access denied or not available. Please enter the meeting code manually.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const scanForQrCode = () => {
    // For now, we'll show the camera interface but note that full QR scanning
    // would require additional libraries like @zxing/library or react-qr-reader
    // This provides the UI framework for when a proper scanning library is added
  };

  const handleManualEntry = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          <span className="font-medium">Scan QR Code</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualEntry}
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-sm bg-black/70 rounded-lg">
              <QrCode className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">QR Code Scanner</h3>
              <p className="text-sm mb-4">
                QR scanning functionality is coming soon! For now, please use the manual entry option.
              </p>
              <Button
                onClick={handleManualEntry}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                Enter Code Manually
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-6 max-w-sm">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Camera Not Available</p>
              <p className="text-sm opacity-80 mb-4">{error}</p>
              <Button onClick={handleManualEntry} className="w-full">
                Enter Code Manually
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
