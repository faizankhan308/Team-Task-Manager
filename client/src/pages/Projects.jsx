import { Pencil, Plus, Trash2, X, Users, FolderKanban } from 'lucide-react';
import { useEffect, useState } from 'react';

import api from '../api/axios.js';
import { Button } from '../components/Button.jsx';
import { Input, Textarea } from '../components/Input.jsx';
import { Loading } from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

const emptyForm = { name: '', description: '', members: [] };

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const requests = [api.get('/projects')];
      if (isAdmin) requests.push(api.get('/users'));

      const [projectRes, userRes] = await Promise.all(requests);
      setProjects(projectRes.data);
      setUsers(userRes?.data || []);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleMember = (id) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id)
        ? current.members.filter((memberId) => memberId !== id)
        : [...current.members, id]
    }));
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description || '',
      members: project.members.map((member) => member._id)
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Project name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
      } else {
        await api.post('/projects', form);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all related tasks?')) return;
    await api.delete(`/projects/${projectId}`);
    await loadData();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-foreground-muted">Manage your workspaces and teams.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            New Project
          </Button>
        )}
      </div>

      {error && !isModalOpen ? (
        <div className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger border border-danger/20">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Loading label="Loading projects" />
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-foreground-muted">
            <thead className="bg-surface-hover/50 text-xs uppercase text-foreground">
              <tr className="border-b border-border">
                <th className="px-6 py-4 font-semibold">Project Name</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                <th className="px-6 py-4 font-semibold">Members</th>
                {isAdmin && <th className="px-6 py-4 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-foreground-muted">
                    <FolderKanban className="mx-auto h-8 w-8 opacity-20 mb-3" />
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className="group hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-surface border border-border text-foreground font-semibold shrink-0">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-[300px] truncate">
                      {project.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-foreground-muted" />
                        <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => startEdit(project)} className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface rounded transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteProject(project._id)} className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Overlay for Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                {editingId ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button onClick={resetForm} className="text-foreground-muted hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 rounded-md bg-danger/10 p-3 text-sm font-medium text-danger border border-danger/20">
                  {error}
                </div>
              )}
              
              <form id="project-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input label="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                
                <div>
                  <span className="mb-2 block text-xs font-semibold text-foreground-muted">Assign Members</span>
                  <div className="grid gap-2 sm:grid-cols-2 max-h-[200px] overflow-y-auto p-1">
                    {users.map((user) => {
                      const isSelected = form.members.includes(user._id);
                      return (
                        <label key={user._id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm transition-colors ${isSelected ? 'border-foreground bg-surface-hover' : 'border-border bg-surface hover:border-border-strong'}`}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border bg-surface text-foreground focus:ring-foreground focus:ring-offset-background"
                            checked={isSelected}
                            onChange={() => toggleMember(user._id)}
                          />
                          <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-foreground-muted'}`}>{user.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface-hover/30 shrink-0">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" form="project-form" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
