import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { registerUser } from '../utils/storage';

interface Props {
  onSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterForm: React.FC<Props> = ({ onSuccess, onLoginClick }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'El nombre completo es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Correo electrónico inválido.';
    if (password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
    if (password !== confirm) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    const result = await registerUser(fullName.trim(), email.trim(), password);
    setLoading(false);
    if (!result.success) { setError(result.error ?? 'Error al registrar.'); return; }
    onSuccess();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-title">Crear cuenta</h2>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="reg-fullname">Nombre completo</label>
        <input
          id="reg-fullname"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ana García López"
          required
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-email">Correo electrónico</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ana@ejemplo.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-password">Contraseña</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-confirm">Confirmar contraseña</label>
        <input
          id="reg-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repite tu contraseña"
          required
          autoComplete="new-password"
        />
      </div>

      <button id="btn-register" type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Registrando…' : 'Crear cuenta'}
      </button>

      <p className="auth-switch">
        ¿Ya tienes cuenta?{' '}
        <button type="button" className="link-btn" onClick={onLoginClick}>
          Inicia sesión
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
