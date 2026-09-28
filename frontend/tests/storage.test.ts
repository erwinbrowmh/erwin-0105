import { describe, it, expect, beforeEach } from 'vitest';

// ─── Helper: mock localStorage ─────────────────────────────────────────────
const mockStorage: Record<string, string> = {};

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
  },
  writable: true,
});

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234',
    subtle: {
      digest: async (_algo: string, data: Uint8Array): Promise<ArrayBuffer> => {
        // Simple mock: return hash based on input length
        const buf = new Uint8Array(32).fill(data.length % 256);
        return buf.buffer;
      },
    },
  },
  writable: true,
});

import { registerUser, loginUser, getBalance, updateBalance, getSession, saveSession, clearSession } from '../src/utils/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('storage — registro', () => {
  it('registra un usuario nuevo correctamente', async () => {
    const result = await registerUser('Ana García', 'ana@test.com', 'password123');
    expect(result.success).toBe(true);
  });

  it('no permite registrar el mismo correo dos veces', async () => {
    await registerUser('Ana García', 'ana@test.com', 'password123');
    const result = await registerUser('Ana García 2', 'ana@test.com', 'otra');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('storage — login', () => {
  it('permite login con credenciales correctas', async () => {
    await registerUser('Ana García', 'ana@test.com', 'password123');
    const result = await loginUser('ana@test.com', 'password123');
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('ana@test.com');
  });

  it('rechaza login con contraseña incorrecta', async () => {
    await registerUser('Ana García', 'ana@test.com', 'password123');
    const result = await loginUser('ana@test.com', 'wrongpassword');
    expect(result.success).toBe(false);
  });

  it('rechaza login con correo no registrado', async () => {
    const result = await loginUser('noexiste@test.com', 'password123');
    expect(result.success).toBe(false);
  });

  it('es insensible a mayúsculas en el correo', async () => {
    await registerUser('Ana García', 'ana@test.com', 'password123');
    const result = await loginUser('ANA@TEST.COM', 'password123');
    expect(result.success).toBe(true);
  });
});

describe('storage — saldo', () => {
  it('saldo inicial de un usuario es 0', () => {
    const balance = getBalance('new-user-id');
    expect(balance).toBe(0);
  });

  it('actualiza y recupera el saldo correctamente', () => {
    updateBalance('user-123', 500.75);
    expect(getBalance('user-123')).toBe(500.75);
  });
});

describe('storage — sesión', () => {
  it('guarda y recupera la sesión', () => {
    const session = { userId: 'u1', email: 'test@x.com', fullName: 'Test User' };
    saveSession(session);
    expect(getSession()).toEqual(session);
  });

  it('elimina la sesión correctamente', () => {
    saveSession({ userId: 'u1', email: 'test@x.com', fullName: 'Test' });
    clearSession();
    expect(getSession()).toBeNull();
  });
});
