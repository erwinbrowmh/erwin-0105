import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '../types';
import { getSession, saveSession, clearSession, getBalance, updateBalance } from '../utils/storage';

interface AuthContextType {
  session: Session | null;
  balance: number;
  login: (session: Session) => void;
  logout: () => void;
  refreshBalance: (userId: string) => void;
  applyBalanceIncrease: (userId: string, amount: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(getSession);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (session) {
      setBalance(getBalance(session.userId));
    }
  }, [session]);

  const login = (s: Session) => {
    saveSession(s);
    setSession(s);
    setBalance(getBalance(s.userId));
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setBalance(0);
  };

  const refreshBalance = (userId: string) => {
    setBalance(getBalance(userId));
  };

  const applyBalanceIncrease = (userId: string, amount: number) => {
    const current = getBalance(userId);
    const newBalance = current + amount;
    updateBalance(userId, newBalance);
    setBalance(newBalance);
  };

  return (
    <AuthContext.Provider value={{ session, balance, login, logout, refreshBalance, applyBalanceIncrease }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
