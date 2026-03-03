import React, { useEffect, useRef } from 'react';
import { QRData } from '../types';
import './QRScanner.css';

interface QRScannerProps {
  onScan: (data: QRData) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Имитация сканирования через 2 секунды (для демо)
        const timer = setTimeout(() => {
          onScan({
            personalAccount: '12345678901234567890',
            amount: '3250.50',
            recipient: 'Мосэнергосбыт'
          });
        }, 2000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Ошибка камеры:', error);
        alert('Не удалось получить доступ к камере');
        onClose();
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="qr-modal">
      <div className="qr-modal-content">
        <button className="qr-close" onClick={onClose}>×</button>
        <h3>Сканируйте QR-код</h3>
        <video ref={videoRef} className="qr-video" />
        <p>Наведите камеру на QR-код в квитанции</p>
        <p className="qr-hint">(Демо: автоматически через 2 сек)</p>
      </div>
    </div>
  );
};

export default QRScanner;
