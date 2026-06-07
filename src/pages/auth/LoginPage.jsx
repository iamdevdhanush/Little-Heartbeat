import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';
import { setLoggedIn } from '../../services/storageService.js';
import { showAlert } from '../../utils/webAlert.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { alertProps, showAlert: showA } = useAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showA('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    await setLoggedIn(true);
    setLoading(false);
    navigate('/setup');
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-circle animate-heartbeat">💗</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: -0.5 }}>
          Little Heartbeat
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Your caring pregnancy companion</p>
      </div>

      <div className="card-lg" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back 🌸</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>Log in to continue your journey</p>

        <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" type="email" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" type="password" />

        <Button title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

        <button
          style={{ width: '100%', background: 'none', border: 'none', padding: '16px 0 0', fontSize: 14, color: 'var(--color-primary)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          onClick={() => {}}
        >
          Forgot password?
        </button>
      </div>

      <div className="flex items-center justify-center gap-xs" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>New here?</span>
        <Link to="/signup" style={{ fontSize: 15, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
          Create an account
        </Link>
      </div>

      <button
        style={{ background: 'none', border: 'none', width: '100%', padding: 12, fontSize: 13, color: 'var(--color-text-muted)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
        onClick={handleLogin}
      >
        ✨ Continue without account (Demo)
      </button>

      <Alert {...alertProps} />
    </div>
  );
}
