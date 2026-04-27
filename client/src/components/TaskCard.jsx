const STATUS_STYLES = {
  pending:   'bg-amber-400/10 text-amber-400 border-amber-400/20',
  completed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  deleted:   'bg-red-400/10 text-red-400 border-red-400/20',
};

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const isPending   = task.status === 'pending';
  const isCompleted = task.status === 'completed';

  return (
    <div className={`group bg-zinc-900 border rounded-xl p-4 transition-all duration-200
                     hover:border-zinc-600
                     ${isCompleted ? 'border-zinc-800 opacity-70' : 'border-zinc-800'}`}>
      <div className="flex items-start justify-between gap-3">

        {/* Left — checkbox + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <button
            onClick={() => onStatusChange(task._id, isPending ? 'completed' : 'pending')}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center
                        transition-all duration-200
                        ${isCompleted
                          ? 'bg-emerald-400 border-emerald-400'
                          : 'border-zinc-600 hover:border-amber-400'}`}
          >
            {isCompleted && (
              <svg className="w-3 h-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Title + description */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate transition-all
                           ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{task.description}</p>
            )}
            <p className="text-xs text-zinc-600 mt-1.5">
              {new Date(task.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right — status badge + delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[task.status]}`}>
            {task.status}
          </span>
          <button
            onClick={() => onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400
                       transition-all duration-200 p-1 rounded"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                   4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;