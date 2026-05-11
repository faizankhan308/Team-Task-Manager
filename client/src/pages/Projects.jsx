import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { Plus, Trash2, UserPlus, Calendar, Users } from 'lucide-react';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const isAdmin = user.role === 'admin';

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    api.get('/users').then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...newProject };
      if (!payload.deadline) delete payload.deadline;
      const res = await api.post('/projects', payload);
      setProjects(prev => [res.data, ...prev]);
      setShowModal(false);
      setNewProject({ title: '', description: '', deadline: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    if (!memberUserId) return;
    try {
      const res = await api.post(`/projects/${selectedProject._id}/members`, { userId: memberUserId });
      setProjects(prev => prev.map(p => p._id === res.data._id ? res.data : p));
      setSelectedProject(res.data);
      setMemberUserId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (projId, uid) => {
    try {
      const res = await api.delete(`/projects/${projId}/members/${uid}`);
      setProjects(prev => prev.map(p => p._id === res.data._id ? res.data : p));
      setSelectedProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const canManage = (proj) =>
    isAdmin || proj.owner?._id === user._id;

  return (
    <div className="projects-page animate-fade-in">

      {/* Header */}
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p className="projects-subtitle">Manage your team's projects and workflows.</p>
        </div>
        {isAdmin && (
          <button className="new-project-btn" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="projects-card">
          <p className="projects-empty">Loading...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="projects-card">
          <p className="projects-empty">No projects found. Create one to get started.</p>
        </div>
      ) : (
        <div className="projects-card">
          <table className="projects-table">
            <thead>
              <tr>
                <th>PROJECT</th>
                <th>STATUS</th>
                <th>MEMBERS</th>
                <th>DEADLINE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => {
                if (!proj || !proj.title) return null;
                return (
                <tr key={proj._id} className="project-row">
                  <td>
                    <div className="proj-name-cell">
                      <div className="proj-icon">{proj.title.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="proj-title">{proj.title}</div>
                        {proj.description && (
                          <div className="proj-desc">
                            {proj.description.length > 60
                              ? proj.description.slice(0, 60) + '…'
                              : proj.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-${proj.status || 'active'}`}>{proj.status || 'active'}</span>
                  </td>
                  <td>
                    <div className="member-stack">
                      {proj.members?.slice(0, 4).map(m => {
                        if (!m) return null;
                        return (
                          <div key={typeof m === 'string' ? m : m._id} className="member-chip" title={typeof m === 'string' ? 'Member' : (m.name || 'Member')}>
                            {typeof m === 'string' ? 'M' : ((m.name || 'M').charAt(0).toUpperCase())}
                          </div>
                        );
                      })}
                      {proj.members?.length > 4 && (
                        <div className="member-chip more">+{proj.members.length - 4}</div>
                      )}
                    </div>
                  </td>
                  <td className="proj-date">
                    {proj.deadline
                      ? new Date(proj.deadline).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    {canManage(proj) && (
                      <div className="proj-actions">
                        <button
                          className="icon-btn"
                          title="Manage members"
                          onClick={() => {
                            setSelectedProject(proj);
                            setMemberUserId('');
                            setError('');
                            setShowMemberModal(true);
                          }}
                        >
                          <UserPlus size={15} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Delete project"
                          onClick={() => handleDelete(proj._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content fallback-fixed">
            <h2>New Project</h2>
            {error && <div className="error-text">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  placeholder="Project name"
                  value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="textarea-input"
                  rows={3}
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  className="form-input"
                  type="date"
                  value={newProject.deadline}
                  onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Manage Members Modal */}
      {showMemberModal && selectedProject && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="modal-content fallback-fixed">
            <h2>Members — {selectedProject.title}</h2>
            <div className="form-group">
              <label>Current Members</label>
              <div className="members-list">
                {selectedProject.members?.map(m => (
                  <div key={m._id} className="member-row">
                    <div className="member-avatar-sm">{m.name.charAt(0).toUpperCase()}</div>
                    <span className="member-name">{m.name}</span>
                    <span className="member-email">{m.email}</span>
                    {canManage(selectedProject) && m._id !== selectedProject.owner?._id && (
                      <button
                        className="icon-btn danger"
                        onClick={() => handleRemoveMember(selectedProject._id, m._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {error && <div className="error-text">{error}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Add Member</label>
                <select
                  className="select-input"
                  required
                  value={memberUserId}
                  onChange={e => setMemberUserId(e.target.value)}
                >
                  <option value="">Select a user...</option>
                  {allUsers
                    .filter(u => !selectedProject.members?.some(m => m._id === u._id))
                    .map(u => (
                      <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
                    ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowMemberModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn-submit">Add Member</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Projects;
