import type { User, Session, StoredTransaction } from '../types';

// ─── Keys ─────────────────────────────────────────────────────────────────────
const USERS_KEY = 'snail_users';
const SESSION_KEY = 'snail_session';
const BALANCE_KEY = (userId: string) => `snail_balance_${userId}`;
const TRANSACTIONS_KEY = (userId: string) => `snail_tx_${userId}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as User[];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// ─── Password hashing (simple SHA-256 using SubtleCrypto) ─────────────────────
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'El correo ya está registrado.' };
  }
  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: crypto.randomUUID(),
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  return { success: true };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, error: 'Correo o contraseña incorrectos.' };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { success: false, error: 'Correo o contraseña incorrectos.' };
  return { success: true, user };
};

// ─── Session ──────────────────────────────────────────────────────────────────
export const saveSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// ─── Balance ──────────────────────────────────────────────────────────────────
export const getBalance = (userId: string): number => {
  const stored = localStorage.getItem(BALANCE_KEY(userId));
  return stored ? parseFloat(stored) : 0;
};

export const updateBalance = (userId: string, newBalance: number): void => {
  localStorage.setItem(BALANCE_KEY(userId), String(newBalance));
  // También actualiza el objeto usuario
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx].balance = newBalance;
    saveUsers(users);
  }
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getTransactions = (userId: string): StoredTransaction[] => {
  try {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY(userId)) ?? '[]') as StoredTransaction[];
  } catch {
    return [];
  }
};

export const saveTransaction = (userId: string, tx: StoredTransaction): void => {
  const txs = getTransactions(userId);
  localStorage.setItem(TRANSACTIONS_KEY(userId), JSON.stringify([tx, ...txs]));
};
