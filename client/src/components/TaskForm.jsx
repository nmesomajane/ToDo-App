import { useState } from "react";

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onAdd({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      <div className="flex gap-3">
        {/* Plus icon */}
        <div className="mt-2.5 w-5 h-5 rounded-full border-2 border-dashed border-zinc-600 shrink-0" />

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Add a new task..."
            maxLength={200}
            className="w-full bg-transparent text-white placeholder-zinc-600 text-sm
                       focus:outline-none"
          />

          {/* Description only shows when focused */}
          {expanded && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={2}
              maxLength={1000}
              className="w-full bg-transparent text-zinc-400 placeholder-zinc-700 text-xs
                         focus:outline-none resize-none"
            />
          )}
        </div>
      </div>

      {/* Action buttons — only show when expanded */}
      {expanded && (
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setTitle("");
              setDescription("");
            }}
            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40
                       disabled:cursor-not-allowed text-zinc-900 text-xs font-semibold
                       rounded-lg transition"
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </div>
      )}
    </form>
  );
};

export default TaskForm;
