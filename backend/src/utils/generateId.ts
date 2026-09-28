import { randomUUID } from 'crypto';

export const generateId = (): string => randomUUID();

export const generateAuthCode = (): string =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

export const generateReference = (): string =>
  `SNP-${Date.now()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
