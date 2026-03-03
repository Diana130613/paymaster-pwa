import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { PaymentFormData, QRData } from '../types';
import usePaymentStore from '../store/paymentStore';
import QRScanner from './QRScanner';
import './PaymentForm.css';

const PaymentForm: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);
  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      type: 'juridical',
      recipient: '',
      inn: '',
      kpp: '',
      bik: '',
      account: '',
      amount: '',
      personalAccount: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const paymentType = watch('type');
  const { addToPending, addToHistory, isOnline } = usePaymentStore();

  const onSubmit = async (data: PaymentFormData) => {
    const payment = {
      id: `pmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      amount: parseFloat(data.amount) || 0,
      status: isOnline ? 'sent' : 'pending',
      timestamp: Date.now()
    } as any;

    if (isOnline) {
      await new Promise(resolve => setTimeout(resolve, 500));
      addToHistory(payment);
      alert('✅ Платеж успешно отправлен!');
      reset();
    } else {
      addToPending(payment);
      alert('📱 Платеж сохранен офлайн. Будет отправлен при подключении к сети');
      reset();
    }
  };

  const handleQRScan = (qrData: QRData) => {
    setValue('personalAccount', qrData.personalAccount);
    setValue('amount', qrData.amount);
    setValue('recipient', qrData.recipient);
    setValue('type', 'housing');
    setShowScanner(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="payment-form">
        <h2>💳 Прием платежа</h2>

        <div className="form-group">
          <label>Тип платежа *</label>
          <select {...register('type', { required: true })}>
            <option value="juridical">🏢 Юрлицу</option>
            <option value="budget">🏛️ В бюджет</option>
            <option value="housing">🏠 ЖКХ</option>
            <option value="individual">👤 Физлицу</option>
          </select>
        </div>

        <div className="form-group">
          <label>Получатель *</label>
          <input 
            {...register('recipient', { required: 'Обязательное поле' })}
            placeholder="Наименование организации"
          />
          {errors.recipient && <span className="error">{errors.recipient.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>ИНН</label>
            <Controller
              control={control}
              name="inn"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="000000000000"
                  definitions={{
                    '0': /[0-9]/
                  }}
                  placeholder="10 или 12 цифр"
                  className="form-control"
                />
              )}
            />
          </div>

          <div className="form-group">
            <label>КПП</label>
            <Controller
              control={control}
              name="kpp"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="000000000"
                  definitions={{
                    '0': /[0-9]/
                  }}
                  placeholder="9 цифр"
                  className="form-control"
                />
              )}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>БИК</label>
            <Controller
              control={control}
              name="bik"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="000000000"
                  definitions={{
                    '0': /[0-9]/
                  }}
                  placeholder="9 цифр"
                  className="form-control"
                />
              )}
            />
          </div>

          <div className="form-group">
            <label>Счет</label>
            <Controller
              control={control}
              name="account"
              render={({ field }) => (
                <IMaskInput
                  {...field}
                  mask="0000 0000 0000 0000 0000"
                  definitions={{
                    '0': /[0-9]/
                  }}
                  placeholder="20 цифр"
                  className="form-control"
                />
              )}
            />
          </div>
        </div>

        {paymentType === 'housing' && (
          <div className="form-group">
            <label>Лицевой счет</label>
            <div className="qr-input-group">
              <Controller
                control={control}
                name="personalAccount"
                render={({ field }) => (
                  <IMaskInput
                    {...field}
                    mask="00000000000000000000"
                    definitions={{
                      '0': /[0-9]/
                    }}
                    placeholder="20-значный номер"
                    className="form-control"
                  />
                )}
              />
              <button 
                type="button" 
                onClick={() => setShowScanner(true)}
                className="qr-btn"
              >
                📷 Сканировать QR
              </button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Сумма (₽) *</label>
          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Обязательное поле' }}
            render={({ field }) => (
              <IMaskInput
                {...field}
                mask="0000000.00"
                definitions={{
                  '0': /[0-9]/
                }}
                placeholder="0.00"
                className="form-control"
              />
            )}
          />
          {errors.amount && <span className="error">{errors.amount.message}</span>}
        </div>

        <div className="form-group">
          <label>Дата платежа</label>
          <input 
            type="date" 
            {...register('date')}
          />
        </div>

        <button type="submit" className="submit-btn">
          {isOnline ? '💳 Принять платеж' : '📱 Сохранить офлайн'}
        </button>
      </form>

      {showScanner && (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default PaymentForm;
