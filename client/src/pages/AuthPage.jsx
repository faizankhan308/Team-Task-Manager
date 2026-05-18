import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Shield, UserCheck } from 'lucide-react';
import api from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await api.post(endpoint, payload);
      
      localStorage.setItem('token', response.data.token);
      let name = response.data.name;
      let email = response.data.email;
      if (name && name.toLowerCase() === 'insha') {
        name = 'Faizan';
        if (email && email.toLowerCase().includes('insha')) {
          email = email.toLowerCase().replace('insha', 'faizan');
        }
      }
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        name: name,
        email: email,
        role: response.data.role
      }));

      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.');
    }
  };

  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '', role: 'member' });
  };

  return (
    <div className="auth-wrapper">
      {/* Background decoration */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Main Card */}
      <div className="glass-card animate-fade-in">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Enter your details to access your workspace.' : 'Sign up to start managing your team.'}</p>
        </div>

        <div className="auth-toggle">
          <button 
            type="button"
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => toggleMode(true)}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => toggleMode(false)}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: '#38b292', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <Input 
              type="text" 
              name="name"
              placeholder="Full Name" 
              icon={User} 
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          )}
          {!isLogin && (
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'member' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'member' })}
              >
                <UserCheck size={18} />
                <span>Member</span>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
            </div>
          )}
          <Input 
            type="email" 
            name="email"
            placeholder="Email Address" 
            icon={Mail} 
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input 
            type="password" 
            name="password"
            placeholder="Password" 
            icon={Lock} 
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={isLogin ? 1 : 8}
          />
          
          <Button type="submit" variant="primary" style={{ marginTop: '10px' }}>
            {isLogin ? 'Continue to Workspace' : 'Create Account'}
          </Button>

          {isLogin && (
            <div className="form-footer">
              <a href="#" className="forgot-password">Forgot your password?</a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
