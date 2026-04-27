const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

const FilterBar = ({ active, onChange, counts }) => {
  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs font-medium transition-all duration-200
                      ${
                        active === value
                          ? "bg-amber-400 text-zinc-900"
                          : "text-zinc-400 hover:text-white"
                      }`}
        >
          {label}
          {counts[value] !== undefined && (
            <span
              className={`text-xs rounded-full px-1.5 py-0.5
                              ${
                                active === value
                                  ? "bg-zinc-900/30 text-zinc-900"
                                  : "bg-zinc-800 text-zinc-500"
                              }`}
            >
              {counts[value]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
