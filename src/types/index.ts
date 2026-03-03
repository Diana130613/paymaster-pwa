// Типы платежей
export type PaymentType = 'juridical' | 'budget' | 'housing' | 'individual';

// Интерфейс платежа
export interface Payment {
  id: string;
  type: PaymentType;
  recipient: string;
  inn?: string;
  kpp?: string;
  bik?: string;
  account?: string;
  amount: number;
  personalAccount?: string;
  date: string;
  status: 'pending' | 'sent' | 'error';
  timestamp: number;
}

// Данные формы
export interface PaymentFormData {
  type: PaymentType;
  recipient: string;
  inn: string;
  kpp: string;
  bik: string;
  account: string;
  amount: string;
  personalAccount: string;
  date: string;
}

// Данные из QR-кода
export interface QRData {
  personalAccount: string;
  amount: string;
  recipient: string;
}
