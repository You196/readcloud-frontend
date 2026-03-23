import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function Auth({ type }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, password, displayName } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = type === 'login' 
      ? { email, password } 
      : { email, password, displayName };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        login(data, data.token);
        navigate('/library', { replace: true });
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>ReadCloud</h1>
          <p>{type === 'login' ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          {type === 'register' && (
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="displayName"
                value={displayName}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : type === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {type === 'login' ? (
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
