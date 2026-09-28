import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveTransaction } from '../utils/storage';
import type { SnailPayResponse, StoredTransaction } from '../types';

interface Props {
  onClose: () => void;
}

type FormState = {
  card_number: string;
  expiration_date: string;
  cvv: string;
  cardholder_name: string;
  amount: string;
};

type ResultState = {
  type: 'success' | 'error';
  message: string;
  detail?: string;
  reference?: string;
  authCode?: string | null;
} | null;

const INITIAL: FormState = {
  card_number: '',
  expiration_date: '',
  cvv: '',
  cardholder_name: '',
  amount: '',
};

const SnailPayModal: React.FC<Props> = ({ onClose }) => {
  const { session, applyBalanceIncrease } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    // Auto-format expiration date
    if (name === 'expiration_date') {
      value = value.replace(/[^\d/]/g, '');
      if (value.length === 2 && !value.includes('/')) value = value + '/';
    }
    // Card number — only digits
    if (name === 'card_number') {
      value = value.replace(/\D/g, '').slice(0, 16);
    }
    // CVV — only digits, max 3
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!/^\d{16}$/.test(form.card_number)) return 'El número de tarjeta debe tener 16 dígitos.';
    if (!/^\d{2}\/\d{2}$/.test(form.expiration_date)) return 'La fecha de vencimiento debe ser MM/AA.';
    if (!/^\d{3}$/.test(form.cvv)) return 'El CVV debe tener 3 dígitos.';
    if (!form.cardholder_name.trim()) return 'El nombre del titular es requerido.';
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return 'Ingresa un monto válido mayor que cero.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResult(null);
    const validationErr = validate();
    if (validationErr) { setResult({ type: 'error', message: validationErr }); return; }
    if (!session) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/snailpay/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: form.card_number,
          expiration_date: form.expiration_date,
          cvv: form.cvv,
          cardholder_name: form.cardholder_name,
          amount: parseFloat(form.amount),
          payer_id: session.userId,
          payer_email: session.email,
        }),
      });

      const data: SnailPayResponse = await res.json();

      // Guardar transacción en localStorage (incluyendo datos ficticios de tarjeta requeridos)
      const tx: StoredTransaction = {
        id: data.id,
        amount: data.transaction_amount,
        status: data.status,
        status_detail: data.status_detail,
        date_created: data.date_created,
        authorization_code: data.authorization_code,
        reference: data.reference,
        card_number_last4: data.card_number_last4 ?? form.card_number.slice(-4),
        cvv_hint: '***', // CVV ficticio — nunca guardamos el real
      };
      saveTransaction(session.userId, tx);

      if (data.status === 'approved') {
        applyBalanceIncrease(session.userId, data.transaction_amount);
        setResult({
          type: 'success',
          message: `✅ ¡Recarga aprobada por $${data.transaction_amount.toFixed(2)}!`,
          detail: data.status_detail,
          reference: data.reference,
          authCode: data.authorization_code,
        });
        setForm(INITIAL);
      } else {
        setResult({
          type: 'error',
          message: `❌ ${data.status === 'error' ? 'Error del sistema' : 'Pago rechazado'}`,
          detail: data.status_detail,
          reference: data.reference,
        });
      }
    } catch {
      setResult({
        type: 'error',
        message: '❌ No se pudo conectar con SnailPay. Verifica que el servidor esté activo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Cargar saldo con SnailPay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-brand">
              <span className="snail-icon">🐌</span>
              <span className="modal-brand-name">SnailPay</span>
            </div>
            <p className="modal-subtitle">Pasarela de pago segura</p>
          </div>
          <button id="btn-close-modal" className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {result && (
            <div className={`alert ${result.type}`} role="alert">
              <strong>{result.message}</strong>
              {result.detail && <p className="alert-detail">{result.detail}</p>}
              {result.reference && <p className="alert-ref">Ref: {result.reference}</p>}
              {result.authCode && <p className="alert-ref">Auth: {result.authCode}</p>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="sp-cardnumber">Número de tarjeta</label>
            <input
              id="sp-cardnumber"
              name="card_number"
              type="text"
              inputMode="numeric"
              value={form.card_number}
              onChange={handleChange}
              placeholder="1234 1234 1234 1234"
              maxLength={16}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sp-expiry">Vencimiento</label>
              <input
                id="sp-expiry"
                name="expiration_date"
                type="text"
                value={form.expiration_date}
                onChange={handleChange}
                placeholder="MM/AA"
                maxLength={5}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sp-cvv">CVV</label>
              <input
                id="sp-cvv"
                name="cvv"
                type="password"
                inputMode="numeric"
                value={form.cvv}
                onChange={handleChange}
                placeholder="•••"
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sp-name">Nombre del titular</label>
            <input
              id="sp-name"
              name="cardholder_name"
              type="text"
              value={form.cardholder_name}
              onChange={handleChange}
              placeholder="Nombre como aparece en la tarjeta"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sp-amount">Monto a recargar ($)</label>
            <input
              id="sp-amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="500.00"
              required
            />
          </div>

          <button id="btn-pay" type="submit" className="btn-primary btn-pay" disabled={loading}>
            {loading ? 'Procesando…' : 'Pagar con SnailPay'}
          </button>
        </form>

        <div className="modal-hint">
          <details>
            <summary>🔑 Datos de prueba</summary>
            <table className="test-data-table">
              <tbody>
                <tr><td>Tarjeta</td><td><code>1234 1234 1234 1234</code></td></tr>
                <tr><td>Vencimiento</td><td><code>12/26</code></td></tr>
                <tr><td>CVV</td><td><code>543</code></td></tr>
                <tr><td>Nombre</td><td>Cualquier valor</td></tr>
                <tr><td>Monto</td><td>Mayor que $0</td></tr>
              </tbody>
            </table>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SnailPayModal;
