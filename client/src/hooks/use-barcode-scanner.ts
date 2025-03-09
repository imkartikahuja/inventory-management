import { useState, useEffect } from 'react';

interface BarcodeScannerOptions {
  // Time window in ms to consider rapid keypresses as scanner input
  scannerDelay?: number;
  // Minimum length of a valid barcode
  minLength?: number;
  // Called when a valid barcode is scanned
  onScan: (barcode: string) => void;
}

export function useBarcodeScannerInput({
  scannerDelay = 50,
  minLength = 4,
  onScan
}: BarcodeScannerOptions) {
  const [buffer, setBuffer] = useState<string>('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      const currentTime = Date.now();
      
      // If it's been too long since the last keypress, reset the buffer
      if (currentTime - lastKeyTime > scannerDelay && buffer.length > 0) {
        setBuffer('');
      }
      
      // Update the time of last keypress
      setLastKeyTime(currentTime);

      // If it's a printable character, add it to the buffer
      if (e.key.length === 1) {
        setBuffer(prev => prev + e.key);
      }
      
      // If Enter is pressed and we have enough characters, trigger the scan
      if (e.key === 'Enter' && buffer.length >= minLength) {
        onScan(buffer);
        setBuffer('');
        // Prevent form submission
        e.preventDefault();
      }
    }

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [buffer, lastKeyTime, scannerDelay, minLength, onScan]);

  return {
    isScanning: buffer.length > 0,
    currentBuffer: buffer
  };
}
