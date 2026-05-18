import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Shield, UserRound, Trash2 } from 'lucide-react';
import './Team.css';

function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const currentUser = (() => {
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

  const isAdmin = currentUser.role === 'admin';
  const currentId = currentUser._id;

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const mapped = res.data.map(u => {
        if (u.name && u.name.toLowerCase() === 'insha') {
          return {
            ...u,
            name: 'Faizan',
            email: u.email ? u.email.toLowerCase().replace('insha', 'faizan') : u.email
          };
        }
        return u;
      });
      setUsers(mapped);
    } catch {
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, role: res.data.role } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name}? Their account will be deleted.`)) return;
    setUpdatingId(userId);
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="team-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Team Members</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Manage roles and access for your team.
          </p>
        </div>
        <div className="team-badge">
          <Users size={14} />
          <span>{users.length} members</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : (
        <div className="team-table-wrap">
          <table className="team-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>ROLE</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = u._id === currentId;
                return (
                  <tr key={u._id} className={isSelf ? 'is-self' : ''}>
                    <td>
                      <div className="member-cell">
                        <div className="team-avatar">{u.name.charAt(0).toUpperCase()}</div>
                        <div className="member-name-block">
                          <span className="member-name">
                            {u.name}
                            {isSelf && <span className="you-tag">you</span>}
                          </span>
                          <span className="member-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isAdmin && !isSelf ? (
                        <select
                          className="role-select"
                          value={u.role}
                          disabled={updatingId === u._id}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge role-${u.role}`}>
                          {u.role === 'admin' ? <Shield size={12} /> : <UserRound size={12} />}
                          {u.role}
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        {!isSelf && (
                          <button
                            className="icon-btn danger"
                            disabled={updatingId === u._id}
                            onClick={() => handleRemove(u._id, u.name)}
                            title={`Remove ${u.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Team;
