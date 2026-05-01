import { Calendar, Clock, Plus, Trash2, User, X, MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import api from '../api/axios.js';
import { Button } from '../components/Button.jsx';
import { Input, Select, Textarea } from '../components/Input.jsx';
import { Loading } from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage, formatDate, isOverdue } from '../utils/formatters.js';

const statuses = [
  { value: 'todo', label: 'To Do', color: 'text-foreground-muted', bg: 'bg-surface-hover', border: 'border-border' },
  { value: 'in-progress', label: 'In Progress', color: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/20' },
  { value: 'done', label: 'Done', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
];

const today = new Date().toISOString().slice(0, 10);

const TaskBoard = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ project: '', user: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: today,
    project: '',
    assignedUser: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    const params = {};
    if (filters.project) params.project = filters.project;
    if (filters.user) params.user = filters.user;

    try {
      const requests = [api.get('/tasks', { params }), api.get('/projects')];
      if (isAdmin) requests.push(api.get('/users'));

      const [taskRes, projectRes, userRes] = await Promise.all(requests);
      setTasks(taskRes.data);
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
  }, [filters.project, filters.user]);

  const usersByProject = useMemo(() => {
    const project = projects.find((item) => item._id === form.project);
    return project ? project.members : users;
  }, [form.project, projects, users]);

  const createTask = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title || !form.project || !form.assignedUser || !form.dueDate) {
      setError('Title, project, assigned user, and due date are required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/tasks', form);
      setForm({ title: '', description: '', status: 'todo', dueDate: today, project: '', assignedUser: '' });
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (task, status) => {
    await api.put(`/tasks/${task._id}`, { status });
    await loadData();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    await loadData();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Task Board</h1>
          <p className="mt-1 text-sm text-foreground-muted">Manage task workflow across columns.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select label="" className="w-40" value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </Select>
          {isAdmin && (
            <Select label="" className="w-40" value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })}>
              <option value="">All users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </Select>
          )}
          {isAdmin && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              New Task
            </Button>
          )}
        </div>
      </div>

      {error && !isModalOpen ? <p className="mt-6 rounded-md bg-danger/10 px-4 py-3 text-sm font-medium text-danger border border-danger/20">{error}</p> : null}

      {loading ? (
        <div className="mt-6"><Loading label="Loading tasks" /></div>
      ) : (
        <div className="flex-1 overflow-x-auto mt-6 pb-4">
          <div className="flex gap-6 min-w-max h-full items-start">
            {statuses.map((status) => (
              <section key={status.value} className="w-[320px] flex flex-col h-full max-h-full bg-surface rounded-xl border border-border">
                <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
                      {status.label}
                    </div>
                    <span className="text-xs font-medium text-foreground-muted">
                      {tasks.filter((task) => task.status === status.value).length}
                    </span>
                  </div>
                  <button className="text-foreground-muted hover:text-foreground">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {tasks
                    .filter((task) => task.status === status.value)
                    .map((task) => {
                      const overdue = isOverdue(task);
                      return (
                        <article key={task._id} className="group relative rounded-lg border border-border bg-background p-4 shadow-sm hover:border-border-strong transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-sm font-semibold text-foreground leading-snug">{task.title}</h3>
                            {isAdmin && (
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground-muted hover:text-danger" onClick={() => deleteTask(task._id)}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="mb-3 text-xs text-foreground-muted line-clamp-2">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-2 text-[10px] font-medium mb-3">
                            <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-muted uppercase tracking-wide">
                              {task.project?.name || 'No Project'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                                <span className="text-[10px] font-bold text-foreground">
                                  {task.assignedUser?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-1 text-[11px] font-medium ${overdue && task.status !== 'done' ? 'text-danger' : 'text-foreground-muted'}`}>
                              <Calendar size={12} />
                              {formatDate(task.dueDate)}
                            </div>
                          </div>
                          
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-[2px] flex items-center justify-center transition-opacity rounded-lg pointer-events-none group-hover:pointer-events-auto">
                            <Select
                              label=""
                              className="w-3/4 shadow-xl border-border-strong pointer-events-auto"
                              value={task.status}
                              onChange={(e) => updateStatus(task, e.target.value)}
                            >
                              <option disabled value="">Move to...</option>
                              {statuses.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                              ))}
                            </Select>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Modal Overlay for Form */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-foreground-muted hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 rounded-md bg-danger/10 p-3 text-sm font-medium text-danger border border-danger/20">
                  {error}
                </div>
              )}
              
              <form id="task-form" onSubmit={createTask} className="flex flex-col gap-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Project" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value, assignedUser: '' })}>
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </Select>
                  <Select label="Assignee" value={form.assignedUser} onChange={(e) => setForm({ ...form, assignedUser: e.target.value })}>
                    <option value="">Select user</option>
                    {usersByProject.map((user) => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </Select>
                </div>
                <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface-hover/30 shrink-0">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" form="task-form" disabled={saving}>
                {saving ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
