import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

type AuthView = 'login' | 'register';

const App: React.FC = () => {
  const { session } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [registered, setRegistered] = useState(false);

  if (session) return <Dashboard />;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="snail-logo-big">🐌</span>
          <h1 className="auth-brand">SnailRace</h1>
          <p className="auth-tagline">La emoción de las carreras más lentas del mundo</p>
        </div>

        {registered && view === 'login' && (
          <div className="alert success">
            ✅ Cuenta creada exitosamente. ¡Inicia sesión!
          </div>
        )}

        {view === 'login' ? (
          <LoginForm onRegisterClick={() => { setRegistered(false); setView('register'); }} />
        ) : (
          <RegisterForm
            onSuccess={() => { setRegistered(true); setView('login'); }}
            onLoginClick={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
};

export default App;
