import { useState } from "react";

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // New state for due date
const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.trim(),
      });
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
      {/* Collapsed — always visible */}
      {/* Task Input */}
  <div className="space-y-3">

  {/* Task title */}
  <div className="flex items-center gap-3">
    <div className="mt-1 w-[18px] h-[18px] rounded-full border-2 border-dashed border-zinc-600 shrink-0" />

    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onFocus={() => setExpanded(true)}
      placeholder="Task title *"
      maxLength={200}
      required
      className="flex-1 bg-transparent text-sm text-white 
                 placeholder-zinc-600 focus:outline-none"
    />
  </div>


  {expanded && (
    <>
      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add description (optional)"
        rows={3}
        maxLength={1000}
        className="w-full bg-transparent text-sm text-zinc-400
                   placeholder-zinc-700 focus:outline-none 
                   resize-none pl-7"
      />


      {/* Due date */}
      <div className="flex items-center gap-3 pl-7">

        <label className="text-xs text-zinc-500">
          Due date *
        </label>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
          className="bg-zinc-900 border border-zinc-700 
                     rounded-md px-3 py-1 text-xs 
                     text-zinc-300 focus:outline-none"
        />

      </div>


      <hr className="border-zinc-800 my-3" />


      {/* Actions */}
      <div className="flex justify-end gap-2">

        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setTitle("");
            setDescription("");
            setDueDate("");
          }}
          className="px-3 py-1 text-xs text-zinc-400
                     border border-zinc-700 rounded-md
                     hover:bg-zinc-800"
        >
          Cancel
        </button>


        <button
          type="submit"
          disabled={!title || !dueDate}
          className="px-3 py-1 text-xs font-medium
                     bg-blue-600 text-white rounded-md
                     hover:bg-blue-500
                     disabled:opacity-50"
        >
          Add task
        </button>

      </div>

    </>
  )}

</div>
    </form>
  );
};

export default TaskForm;
