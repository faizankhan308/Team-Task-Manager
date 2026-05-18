import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FolderOpen, ListTodo, Clock, AlertTriangle, Circle } from 'lucide-react';
import './Dashboard.css';

const STATUS_META = {
  todo: { label: 'To Do', color: '#94a3b8' },
  'in-progress': { label: 'In Progress', color: '#38bdf8' },
  review: { label: 'Review', color: '#fb923c' },
  done: { label: 'Done', color: '#4ade80' },
};

function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    tasksDueToday: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([api.get('/projects'), api.get('/tasks')]);
        const tasks = taskRes.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueToday = tasks.filter(t => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime() && t.status !== 'done';
        }).length;

        const overdue = tasks.filter(t => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() < today.getTime() && t.status !== 'done';
        }).length;

        setStats({
          totalProjects: projRes.data.length,
          totalTasks: tasks.length,
          tasksDueToday: dueToday,
          overdueTasks: overdue,
        });

        setRecentTasks(tasks.filter(t => t.status !== 'done').slice(0, 6));
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, bg: 'rgba(56,189,248,0.1)', color: '#38bdf8' },
    { label: 'Due Today', value: stats.tasksDueToday, icon: Clock, bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
    { label: 'Overdue', value: stats.overdueTasks, icon: AlertTriangle, bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
  ];

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Welcome back, {user.name?.split(' ')[0] || 'there'} 👋
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map(card => (
              <div className="stat-card" key={card.label}>
                <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                  <card.icon size={20} />
                </div>
                <div className="stat-info">
                  <h3>{card.label}</h3>
                  <p className="stat-value">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="recent-section">
            <div className="recent-section-header">
              <h2>Active Tasks</h2>
            </div>
            <table className="recent-table">
              <thead>
                <tr>
                  <th>TASK NAME</th>
                  <th>PROJECT</th>
                  <th>STATUS</th>
                  <th>DUE DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      All caught up — no pending tasks.
                    </td>
                  </tr>
                ) : (
                  recentTasks.map(task => (
                    <tr key={task._id}>
                      <td>
                        <div className="task-name-cell">
                          <Circle size={12} style={{ color: STATUS_META[task.status]?.color, flexShrink: 0 }} />
                          {task.title}
                        </div>
                      </td>
                      <td>
                        {task.project ? (
                          <span className="project-tag">{task.project.title}</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-sub)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${task.status}`}>
                          {STATUS_META[task.status]?.label}
                        </span>
                      </td>
                      <td>
                        {task.dueDate ? (
                          <div className="date-cell">
                            <Clock size={12} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-sub)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
