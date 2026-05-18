import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { Plus, ChevronDown, Trash2, Clock, Circle } from 'lucide-react';
import './Tasks.css';

const STATUS_OPTIONS = ['todo', 'in-progress', 'review', 'done'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const STATUS_META = {
  todo: { label: 'To Do', color: '#94a3b8' },
  'in-progress': { label: 'In Progress', color: '#38bdf8' },
  review: { label: 'Review', color: '#fb923c' },
  done: { label: 'Done', color: '#4ade80' },
};

const PRIORITY_META = {
  low: { label: 'Low', color: '#4ade80' },
  medium: { label: 'Medium', color: '#fb923c' },
  high: { label: 'High', color: '#f87171' },
};

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-wrap">
      <button className="filter-btn" onClick={() => setOpen(o => !o)}>
        <span>{value || label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="filter-menu">
          <div className="filter-item" onClick={() => { onChange(''); setOpen(false); }}>
            {label}
          </div>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`filter-item${value === opt.value ? ' selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tasks() {
  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });

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

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      const mapped = res.data.map(t => {
        if (!t) return t;
        const assignedTo = t.assignedTo && t.assignedTo.name?.toLowerCase() === 'insha'
          ? { ...t.assignedTo, name: 'Faizan' }
          : t.assignedTo;
        return { ...t, assignedTo };
      });
      setAllTasks(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    Promise.all([api.get('/projects'), api.get('/users')])
      .then(([p, u]) => {
        setProjects(p.data);
        const mappedUsers = u.data.map(userItem => {
          if (userItem.name && userItem.name.toLowerCase() === 'insha') {
            return {
              ...userItem,
              name: 'Faizan',
              email: userItem.email ? userItem.email.toLowerCase().replace('insha', 'faizan') : userItem.email
            };
          }
          return userItem;
        });
        setUsers(mappedUsers);
      })
      .catch(() => {});
  }, []);

  const visible = allTasks.filter(t => {
    if (filterProject && t.project?._id !== filterProject) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assignedTo?._id !== filterAssignee) return false;
    return true;
  });

  const handleStatusChange = async (taskId, newStatus) => {
    setAllTasks(prev => prev.map(t => (t._id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch {
      fetchTasks();
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setAllTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...newTask };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.description) delete payload.description;

      await api.post('/tasks', payload);
      setShowModal(false);
      setNewTask({ title: '', description: '', project: '', priority: 'medium', dueDate: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const projectOpts = projects.map(p => ({ value: p._id, label: p.title }));
  const statusOpts = STATUS_OPTIONS.map(s => ({ value: s, label: STATUS_META[s].label }));
  const priorityOpts = PRIORITY_OPTIONS.map(p => ({ value: p, label: PRIORITY_META[p].label }));
  const assigneeOpts = users.map(u => ({ value: u._id, label: u.name }));

  const activeProject = projects.find(p => p._id === filterProject)?.title || '';
  const activeStatus = filterStatus ? STATUS_META[filterStatus]?.label : '';
  const activePriority = filterPriority ? PRIORITY_META[filterPriority]?.label : '';
  const activeAssignee = users.find(u => u._id === filterAssignee)?.name || '';

  return (
    <div className="tasks-page animate-fade-in">
      <div className="tasks-header">
        <div className="tasks-title-block">
          <h1>Tasks</h1>
          <p>Track and manage work across your team.</p>
        </div>

        <div className="tasks-toolbar">
          <FilterDropdown label="All Projects" options={projectOpts} value={activeProject} onChange={setFilterProject} />
          <FilterDropdown label="All Statuses" options={statusOpts} value={activeStatus} onChange={setFilterStatus} />
          <FilterDropdown label="All Priorities" options={priorityOpts} value={activePriority} onChange={setFilterPriority} />
          <FilterDropdown label="All Assignees" options={assigneeOpts} value={activeAssignee} onChange={setFilterAssignee} />
          <button className="new-task-btn" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="tasks-table-wrap">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>TASK NAME</th>
              <th>PROJECT</th>
              <th>ASSIGNEE</th>
              <th>STATUS &amp; PRIORITY</th>
              <th>DUE DATE</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="table-empty">Loading tasks...</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="table-empty">No tasks found.</td>
              </tr>
            ) : (
              visible.map(task => (
                <tr key={task._id} className="task-row">
                  <td className="td-name">
                    <Circle size={14} style={{ color: STATUS_META[task.status]?.color, flexShrink: 0 }} />
                    <span>{task.title}</span>
                  </td>
                  <td className="td-project">
                    {task.project?.title || <span className="td-empty">—</span>}
                  </td>
                  <td className="td-assignee">
                    {task.assignedTo ? (
                      <div className="assignee-chip">
                        <div className="assignee-avatar">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="td-empty">Unassigned</span>
                    )}
                  </td>
                  <td className="td-status">
                    <select
                      className="inline-status-select"
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                    <span
                      className="priority-dot"
                      style={{ background: PRIORITY_META[task.priority]?.color }}
                      title={task.priority}
                    />
                    <span className="priority-label">{PRIORITY_META[task.priority]?.label}</span>
                  </td>
                  <td className="td-date">
                    {task.dueDate ? (
                      <span className="date-chip">
                        <Clock size={13} />
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="td-empty">—</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="td-actions">
                      <button className="icon-btn danger" onClick={() => handleDelete(task._id)}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content fallback-fixed">
            <h2>New Task</h2>
            {error && <div className="error-text">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Project *</label>
                  <select
                    className="select-input"
                    required
                    value={newTask.project}
                    onChange={e => setNewTask({ ...newTask, project: e.target.value })}
                  >
                    <option value="">Select project...</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="select-input"
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    className="select-input"
                    value={newTask.assignedTo}
                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    <option value="">Myself</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="textarea-input"
                  rows={3}
                  placeholder="Optional description..."
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Tasks;
