// Types are interfaces only — exported as type imports
// This file must have a runtime export to avoid "export {}" from TypeScript erase
export const SNAILRACE_VERSION = '1.0.0';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  balance: number;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  fullName: string;
}

export type SnailPayStatus = 'approved' | 'rejected' | 'error';

export interface SnailPayResponse {
  id: string;
  status: SnailPayStatus;
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
  card_number_last4?: string;
}

export interface StoredTransaction {
  id: string;
  amount: number;
  status: SnailPayStatus;
  status_detail: string;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  card_number_last4: string;
  cvv_hint: string;
}

export interface BetStats {
  won: number;
  lost: number;
}

export interface SnailRaceStats {
  name: string;
  wins: number;
}
