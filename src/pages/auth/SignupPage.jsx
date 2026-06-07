import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';
import { setLoggedIn } from '../../services/storageService.js';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { alertProps, showAlert } = useAlert();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
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
        <div className="auth-logo-circle">💗</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: -0.5 }}>
          Little Heartbeat
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Start your pregnancy journey</p>
      </div>

      <div className="card-lg" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create your account 🌷</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>Join thousands of mothers using Little Heartbeat</p>

        <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" type="email" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" type="password" />
        <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat your password" type="password" />

        <Button title="Create Account" onPress={handleSignup} loading={loading} style={{ marginTop: 8 }} />
      </div>

      <div className="flex items-center justify-center gap-xs">
        <span style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>Already have an account?</span>
        <Link to="/" style={{ fontSize: 15, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
          Log In
        </Link>
      </div>

      <Alert {...alertProps} />
    </div>
  );
}
