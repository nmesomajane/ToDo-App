// components/TaskList.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const STATUS_BADGE = {
  pending:   'bg-zinc-700 text-zinc-300',
  overdue:   'bg-red-900 text-red-300',
  completed: 'bg-green-900 text-green-300',
};

const STATUS_LABEL = {
  pending:   'Pending',
  overdue:   'Overdue',
  completed: 'Done',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function TaskList({ filter, onUpdate }) {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
   
    axiosInstance.get('/tasks')
      .then(({ data }) => { if (!cancelled) setTasks(data.tasks ?? []); })
      .catch(() => { if (!cancelled) setError('Could not load tasks. Please refresh.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const toggleComplete = async (task) => {
  try {
    const newCompleted = !task.completed;
    console.log('Toggling task:', task.title, '| sending completed:', newCompleted); // debug

    const { data } = await axiosInstance.patch(`/tasks/${task._id}`, {
      completed: newCompleted,  // ← must be a boolean, not a string
    });

    setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
    onUpdate?.();
  } catch {
    alert('Failed to update task. Please try again.');
  }
};

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      onUpdate?.();
    } catch {
      alert('Failed to delete task. Please try again.');
    }
  };

  const filtered = tasks.filter((t) => filter === 'all' || t.status === filter);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm text-center py-4">{error}</p>;
  }

  if (filtered.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-8">
        {filter === 'all' ? 'No tasks yet. Add one above.' : `No ${filter} tasks.`}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {filtered.map((task) => (
        <li
          key={task._id}
          className={`rounded-xl border p-4 flex items-start gap-3 transition-opacity
            ${task.status === 'completed' ? 'opacity-60' : ''}
            ${task.status === 'overdue'
              ? 'border-red-800 bg-red-950/30'
              : 'border-zinc-800 bg-zinc-900'
            }`}
        >
          {/* Checkbox */}
          <button
            onClick={() => toggleComplete(task)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center
              justify-center transition-colors
              ${task.completed
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-zinc-600 hover:border-zinc-400'
              }`}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && (
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm leading-snug
              ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.dueDate && (
                <span className={`text-xs ${task.status === 'overdue' ? 'text-red-400' : 'text-zinc-500'}`}>
                  Due {formatDate(task.dueDate)}
                </span>
              )}
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5
                rounded-full ${STATUS_BADGE[task.status] ?? STATUS_BADGE.pending}`}>
                {STATUS_LABEL[task.status] ?? task.status}
              </span>
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => deleteTask(task._id)}
            className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none"
            aria-label="Delete task"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}