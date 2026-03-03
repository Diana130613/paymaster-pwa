import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Payment, PaymentFormData } from '../types';

// Интерфейс хранилища
interface PaymentStore {
  // Состояния
  pendingPayments: Payment[];
  history: Payment[];
  isOnline: boolean;
  
  // Методы
  setOnline: (status: boolean) => void;
  addToPending: (payment: Payment) => void;
  removeFromPending: (id: string) => void;
  addToHistory: (payment: Payment) => void;
  syncPayments: () => Promise<void>;
  loadFromStorage: () => void;
}

// Создаём хранилище
const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      // Начальные состояния
      pendingPayments: [],
      history: [],
      isOnline: navigator.onLine,

      // Методы
      setOnline: (status) => set({ isOnline: status }),

      addToPending: (payment) => {
        set((state) => ({
          pendingPayments: [payment, ...state.pendingPayments]
        }));
        // Сохраняем в localStorage
        localStorage.setItem('pending_' + payment.id, JSON.stringify(payment));
      },

      removeFromPending: (id) => {
        set((state) => ({
          pendingPayments: state.pendingPayments.filter(p => p.id !== id)
        }));
        localStorage.removeItem('pending_' + id);
      },

      addToHistory: (payment) => {
        set((state) => ({
          history: [payment, ...state.history].slice(0, 50)
        }));
      },

      syncPayments: async () => {
        const { pendingPayments, removeFromPending, addToHistory } = get();
        
        for (const payment of pendingPayments) {
          try {
            // Имитация отправки на сервер
            await new Promise(resolve => setTimeout(resolve, 500));
            await removeFromPending(payment.id);
            addToHistory({ ...payment, status: 'sent' });
            console.log('Платеж отправлен:', payment.id);
          } catch (error) {
            console.error('Ошибка отправки:', error);
          }
        }
      },

      loadFromStorage: () => {
        // Загружаем ожидающие платежи из localStorage
        const pending: Payment[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('pending_')) {
            const payment = localStorage.getItem(key);
            if (payment) {
              pending.push(JSON.parse(payment));
            }
          }
        }
        set({ pendingPayments: pending });
      }
    }),
    {
      name: 'payment-storage', // имя для localStorage
      partialize: (state) => ({ 
        history: state.history.slice(0, 50) // сохраняем только историю
      })
    }
  )
);

export default usePaymentStore;
