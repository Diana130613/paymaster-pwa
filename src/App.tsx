import React, { useEffect, useState } from 'react';
import PaymentForm from './components/PaymentForm';
import OfflineQueue from './components/OfflineQueue';
import usePaymentStore from './store/paymentStore';
import './App.css';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const { isOnline, setOnline, loadFromStorage, pendingPayments, syncPayments } = usePaymentStore();

  useEffect(() => {
    // Загружаем сохранённые платежи
    loadFromStorage();

    // Слушаем события онлайн/офлайн
    const handleOnline = () => {
      setOnline(true);
      syncPayments();
    };
    
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA установка
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Установка:', outcome);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PayMaster Касса</h1>
        {showInstallBtn && (
          <button onClick={handleInstall} className="install-btn">
            📱 Установить приложение
          </button>
        )}
      </header>

      <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢 Онлайн' : '🔴 Офлайн'}
      </div>

      <div className="container">
        <PaymentForm />
        {pendingPayments.length > 0 && <OfflineQueue />}
      </div>
    </div>
  );
}

export default App;
