import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';

const Dashboard = () => {
  const {  logout }    = useAuth();
  const navigate             = useNavigate();
  const [tasks, setTasks]   = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  //Fetch tasks 
  const fetchTasks = async () => {
    try {
      setError('');
      const res = await axiosInstance.get('/api/tasks');
      setTasks(res.data.tasks || []);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  const loadTasks = async () => {
    await fetchTasks();
  };

  loadTasks();
}, []);

  //Add task 
  const handleAdd = async ({ title, description }) => {
    const res = await axiosInstance.post('/api/tasks', { title, description });
    setTasks((prev) => [res.data.task, ...prev]);
  };

  //Change status 
  const handleStatusChange = async (id, status) => {
    const res = await axiosInstance.patch(`/api/tasks/${id}`, { status });
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
  };

  //Delete (soft) 
  const handleDelete = async (id) => {
    await axiosInstance.delete(`/api/tasks/${id}`);
    // Remove from list immediately — deleted tasks are hidden
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  //Handle logout 
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  //Filter tasks client-side 
  const filteredTasks = useMemo(() => {
    if (filter === 'all')       return tasks;
    if (filter === 'pending')   return tasks.filter((t) => t.status === 'pending');
    if (filter === 'completed') return tasks.filter((t) => t.status === 'completed');
    return tasks;
  }, [tasks, filter]);

  //Counts for FilterBar badges ─
  const counts = useMemo(() => ({
    all:       tasks.length,
    pending:   tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }), [tasks]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/*Navbar  */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-white">TaskFlow</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-zinc-500 hover:text-white transition px-3 py-1.5
                       border border-zinc-800 hover:border-zinc-600 rounded-lg"
          >
            Sign out
          </button>
        </div>
      </header>

      {/*Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {counts.pending} task{counts.pending !== 1 ? 's' : ''} remaining
          </p>
        </div>

        {/* Add task form */}
        <TaskForm onAdd={handleAdd} />

        {/* Filter bar */}
        <FilterBar active={filter} onChange={setFilter} counts={counts} />

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center
                            justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">
              {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;