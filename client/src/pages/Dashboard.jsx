import { AlertCircle, CheckCircle2, ListTodo, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

import api from '../api/axios.js';
import { Loading } from '../components/Loading.jsx';
import { Select } from '../components/Input.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, overdueTasks: 0 });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ project: '', user: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMeta = async () => {
      const [projectRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projectRes.data);
      setUsers(userRes.data);
    };
    loadMeta().catch((err) => setError(apiErrorMessage(err)));
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      const params = {};
      if (filters.project) params.project = filters.project;
      if (filters.user) params.user = filters.user;

      try {
        const { data } = await api.get('/tasks/stats', { params });
        setStats(data || { totalTasks: 0, completedTasks: 0, overdueTasks: 0 });
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [filters]);

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Monitor task health and team productivity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            label=""
            className="w-full sm:w-48"
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </Select>
          <Select
            label=""
            className="w-full sm:w-48"
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </Select>
        </div>
      </section>

      {error && (
        <div className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger border border-danger/20">
          {error}
        </div>
      )}

      {loading ? (
        <Loading label="Loading overview data" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats (Left 2/3) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-foreground-muted">
                <ListTodo size={16} />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Total Tasks</h3>
              </div>
              <p className="text-4xl font-bold text-foreground">{stats.totalTasks}</p>
            </div>
            
            <div className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-foreground-muted">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Completed</h3>
              </div>
              <p className="text-4xl font-bold text-foreground">{stats.completedTasks}</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-foreground-muted">
                <AlertCircle size={16} className="text-danger" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Attention Required (Overdue)</h3>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-foreground">{stats.overdueTasks}</p>
                <p className="text-sm text-foreground-muted pb-1">tasks need your attention</p>
              </div>
            </div>
          </div>

          {/* Right Column (Health) */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-foreground-muted pb-4 border-b border-border">
              <Activity size={16} />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Task Health</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Completion Rate</span>
                <span className="font-semibold text-foreground">{completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="mt-auto pt-6">
              <p className="text-xs text-foreground-muted leading-relaxed">
                Task health is calculated based on the ratio of completed tasks to total assigned tasks within the current filter scope.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
