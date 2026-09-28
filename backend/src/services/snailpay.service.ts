import { SnailPayChargeRequest, SnailPayChargeResponse } from '../types/snailpay.types';
import { generateId, generateAuthCode, generateReference } from '../utils/generateId';

// ─── Tarjeta autorizada ──────────────────────────────────────────────────────
const APPROVED_CARD = '1234123412341234';
const APPROVED_EXPIRY = '12/26';
const APPROVED_CVV = '543';

// ─── Flag para simular error del sistema ─────────────────────────────────────
let systemErrorMode = false;

export const setSystemErrorMode = (value: boolean): void => {
  systemErrorMode = value;
};

export const getSystemErrorMode = (): boolean => systemErrorMode;

// ─── Lógica principal de cobro ────────────────────────────────────────────────
export const processCharge = (data: SnailPayChargeRequest): SnailPayChargeResponse => {
  const now = new Date().toISOString();
  const reference = generateReference();
  const id = generateId();

  // 2.3.3 — Error del sistema
  if (systemErrorMode) {
    return {
      id,
      status: 'error',
      status_detail: 'SYSTEM_ERROR: SnailPay service is temporarily unavailable. Please try again later.',
      transaction_amount: data.amount,
      date_created: now,
      authorization_code: null,
      reference,
      payer_id: data.payer_id,
      payer_email: data.payer_email,
      card_number_last4: data.card_number.slice(-4),
    };
  }

  // Validaciones básicas
  if (!data.cardholder_name || data.cardholder_name.trim() === '') {
    return buildRejected(id, now, reference, data, 'INVALID_CARDHOLDER: Cardholder name cannot be empty.');
  }

  if (data.amount <= 0 || isNaN(data.amount)) {
    return buildRejected(id, now, reference, data, 'INVALID_AMOUNT: Transaction amount must be greater than zero.');
  }

  const cardNormalized = data.card_number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cardNormalized)) {
    return buildRejected(id, now, reference, data, 'INVALID_CARD: Card number must be exactly 16 digits.');
  }

  // 2.3.1 — Cobro exitoso
  if (
    cardNormalized === APPROVED_CARD &&
    data.expiration_date === APPROVED_EXPIRY &&
    data.cvv === APPROVED_CVV
  ) {
    return {
      id,
      status: 'approved',
      status_detail: 'APPROVED: Transaction successfully processed.',
      transaction_amount: data.amount,
      date_created: now,
      authorization_code: generateAuthCode(),
      reference,
      payer_id: data.payer_id,
      payer_email: data.payer_email,
      card_number_last4: cardNormalized.slice(-4),
    };
  }

  // 2.3.2 — Errores de transacción específicos
  if (cardNormalized !== APPROVED_CARD) {
    return buildRejected(id, now, reference, data, 'CARD_DECLINED: The card number provided was not recognized.');
  }

  if (data.expiration_date !== APPROVED_EXPIRY) {
    return buildRejected(id, now, reference, data, 'EXPIRED_CARD: The expiration date is invalid or the card has expired.');
  }

  if (data.cvv !== APPROVED_CVV) {
    return buildRejected(id, now, reference, data, 'INVALID_CVV: The security code provided does not match our records.');
  }

  // Fallback
  return buildRejected(id, now, reference, data, 'REJECTED: Transaction rejected due to unknown reason.');
};

const buildRejected = (
  id: string,
  now: string,
  reference: string,
  data: SnailPayChargeRequest,
  detail: string
): SnailPayChargeResponse => ({
  id,
  status: 'rejected',
  status_detail: detail,
  transaction_amount: data.amount,
  date_created: now,
  authorization_code: null,
  reference,
  payer_id: data.payer_id,
  payer_email: data.payer_email,
  card_number_last4: data.card_number.slice(-4),
});
