import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, Trash2, LogOut } from 'lucide-react';
import api from '../api/axios';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const user = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.name && u.name.toLowerCase() === 'insha') {
        u.name = 'Faizan';
        if (u.email && u.email.toLowerCase().includes('insha')) {
          u.email = u.email.toLowerCase().replace('insha', 'faizan');
        }
      }
      return u;
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/users/${user._id}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <h2 className="profile-name">{user?.name || 'Unknown User'}</h2>

        <div className="profile-info">
          <div className="info-row">
            <Mail size={16} />
            <span>{user?.email || '—'}</span>
          </div>
          <div className="info-row">
            <Shield size={16} />
            <span className={`role-chip role-${user?.role}`}>{user?.role || 'member'}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="btn-cancel"
            style={{ width: '100%', textAlign: 'center' }}
            onClick={handleLogout}
          >
            <LogOut size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Sign Out
          </button>
          <button
            className="btn-submit"
            style={{ width: '100%', background: 'var(--color-danger)' }}
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Delete Account
          </button>
        </div>
      </div>

      {showConfirm && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowConfirm(false)}>
          <div className="modal-content fallback-fixed">
            <h2>Delete Account?</h2>
            <p className="confirm-text">
              This will permanently delete your account and cannot be undone.
            </p>
            {error && <div className="error-text">{error}</div>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn-submit"
                style={{ background: 'var(--color-danger)' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Profile;
