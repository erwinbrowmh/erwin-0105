import { describe, it, expect, beforeEach } from 'vitest';
import { processCharge, setSystemErrorMode } from '../src/services/snailpay.service';
import { SnailPayChargeRequest } from '../src/types/snailpay.types';

const BASE_REQUEST: SnailPayChargeRequest = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Ana García',
  amount: 500,
  payer_id: 'user-001',
  payer_email: 'ana@example.com',
};

beforeEach(() => {
  setSystemErrorMode(false);
});

describe('SnailPay — Cobro exitoso', () => {
  it('retorna status "approved" con los datos correctos', () => {
    const result = processCharge(BASE_REQUEST);
    expect(result.status).toBe('approved');
    expect(result.authorization_code).not.toBeNull();
    expect(result.transaction_amount).toBe(500);
    expect(result.payer_id).toBe('user-001');
    expect(result.payer_email).toBe('ana@example.com');
  });

  it('incluye card_number_last4 con los últimos 4 dígitos', () => {
    const result = processCharge(BASE_REQUEST);
    expect(result.card_number_last4).toBe('1234');
  });
});

describe('SnailPay — Error de transacción', () => {
  it('retorna "rejected" con número de tarjeta incorrecto', () => {
    const result = processCharge({ ...BASE_REQUEST, card_number: '9999999999999999' });
    expect(result.status).toBe('rejected');
    expect(result.authorization_code).toBeNull();
    expect(result.status_detail).toContain('CARD_DECLINED');
  });

  it('retorna "rejected" con CVV incorrecto', () => {
    const result = processCharge({ ...BASE_REQUEST, cvv: '000' });
    expect(result.status).toBe('rejected');
    expect(result.status_detail).toContain('INVALID_CVV');
  });

  it('retorna "rejected" con fecha de vencimiento incorrecta', () => {
    const result = processCharge({ ...BASE_REQUEST, expiration_date: '01/20' });
    expect(result.status).toBe('rejected');
    expect(result.status_detail).toContain('EXPIRED_CARD');
  });

  it('retorna "rejected" con monto inválido (cero)', () => {
    const result = processCharge({ ...BASE_REQUEST, amount: 0 });
    expect(result.status).toBe('rejected');
    expect(result.status_detail).toContain('INVALID_AMOUNT');
  });

  it('retorna "rejected" con nombre de tarjetahabiente vacío', () => {
    const result = processCharge({ ...BASE_REQUEST, cardholder_name: '' });
    expect(result.status).toBe('rejected');
    expect(result.status_detail).toContain('INVALID_CARDHOLDER');
  });
});

describe('SnailPay — Error del sistema', () => {
  it('retorna "error" cuando el modo de error está activado', () => {
    setSystemErrorMode(true);
    const result = processCharge(BASE_REQUEST);
    expect(result.status).toBe('error');
    expect(result.authorization_code).toBeNull();
    expect(result.status_detail).toContain('SYSTEM_ERROR');
  });

  it('no aprueba cobros durante el error del sistema', () => {
    setSystemErrorMode(true);
    const result = processCharge(BASE_REQUEST);
    expect(result.status).not.toBe('approved');
  });
});
