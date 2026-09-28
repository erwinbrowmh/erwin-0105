import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { loginUser } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import type { Session } from '../types';

interface Props {
  onRegisterClick: () => void;
}

const LoginForm: React.FC<Props> = ({ onRegisterClick }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Completa todos los campos.'); return; }
    setLoading(true);
    const result = await loginUser(email.trim(), password);
    setLoading(false);
    if (!result.success || !result.user) { setError(result.error ?? 'Error al iniciar sesión.'); return; }
    const session: Session = {
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
    };
    login(session);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-title">Iniciar sesión</h2>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ana@ejemplo.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          required
          autoComplete="current-password"
        />
      </div>

      <button id="btn-login" type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Entrando…' : 'Iniciar sesión'}
      </button>

      <p className="auth-switch">
        ¿No tienes cuenta?{' '}
        <button type="button" className="link-btn" onClick={onRegisterClick}>
          Regístrate
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
