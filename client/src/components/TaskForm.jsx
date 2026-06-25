
import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function TaskForm({ onAdd }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const [error,       setError]       = useState('');


  const todayISO = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!dueDate)      { setError('Please set a due date.'); return; }
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/tasks', {
        title:       title.trim(),
        description: description.trim(),
        dueDate,
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setExpanded(false);
      onAdd?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      {/* ── Always-visible title row ── */}
      <div className="flex items-center gap-3">
        {/* Coloured dot placeholder (mimics a future colour picker) */}
        <div className="mt-1 w-4.5 h-4.5 rounded-full border-2 border-dashed
          border-zinc-600 shrink-0" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Task title…"
          maxLength={200}
          className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm
            outline-none leading-snug"
        />

        {expanded && (
          <button
            type="submit"
            disabled={loading || !title.trim() || !dueDate}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg
              bg-zinc-100 text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-white transition-colors"
          >
            {loading ? 'Adding…' : 'Add'}
          </button>
        )}
      </div>

      {/* ── Expanded fields ── */}
      {expanded && (
        <div className="mt-3 space-y-3 pl-7.5">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            maxLength={1000}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
              text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none
              focus:border-zinc-500 transition-colors"
          />

          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500 shrink-0" htmlFor="due-date">
              Due date
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              min={todayISO}
              onChange={(e) => { setDueDate(e.target.value); setError(''); }}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5
                text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors
                scheme-dark"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setExpanded(false); setError(''); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
}