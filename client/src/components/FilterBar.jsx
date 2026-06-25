

const FILTERS = [
  { value: 'all',       label: 'All'       },
  { value: 'pending',   label: 'Pending'   },
  { value: 'overdue',   label: 'Overdue'   },
  { value: 'completed', label: 'Completed' },
];

export default function FilterBar({ filter, onChange }) {
  return (
    <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors
            ${filter === value
              ? 'bg-zinc-100 text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-200'
            }
            ${value === 'overdue' && filter !== value ? 'hover:text-red-400' : ''}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}