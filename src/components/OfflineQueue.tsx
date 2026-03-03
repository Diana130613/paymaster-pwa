import React from 'react';
import usePaymentStore from '../store/paymentStore';
import './OfflineQueue.css';

const OfflineQueue: React.FC = () => {
  const { pendingPayments, syncPayments } = usePaymentStore();

  if (pendingPayments.length === 0) return null;

  return (
    <div className="offline-queue">
      <h3>📱 Ожидают отправки: {pendingPayments.length}</h3>
      <div className="queue-list">
        {pendingPayments.map(payment => (
          <div key={payment.id} className="queue-item">
            <span>{payment.recipient}</span>
            <span>{payment.amount} ₽</span>
            <span className="status pending">Ожидает</span>
          </div>
        ))}
      </div>
      <button onClick={syncPayments} className="sync-btn">
        🔄 Синхронизировать сейчас
      </button>
    </div>
  );
};

export default OfflineQueue;
