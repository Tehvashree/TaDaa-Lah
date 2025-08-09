import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        onScan(result.getText());
      }
    });

    return () => {
      codeReader.reset();
    };
  }, [onScan]);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} />
    </div>
  );
};

export default QRScanner;
