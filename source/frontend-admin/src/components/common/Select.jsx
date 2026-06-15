import { useState, useRef, useEffect } from 'react';

const Select = ({ value, onChange, options, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (val) => { onChange(val); setOpen(false); };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-[#d3e7cf] dark:border-[#3a5c35] bg-white dark:bg-[#1c3019] text-[#101b0d] dark:text-white py-2 pl-4 pr-3 text-sm font-medium shadow-sm hover:border-primary transition-colors outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer whitespace-nowrap"
      >
        {selected?.label}
        <span
          className={`material-symbols-outlined text-[18px] text-[#599a4c] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute right-0 z-50 mt-1 min-w-full w-max rounded-xl border border-[#d3e7cf] dark:border-[#3a5c35] bg-white dark:bg-[#1c3019] shadow-lg py-1 overflow-hidden">
          {options.map(o => {
            const isActive = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className={`w-full text-left flex items-center justify-between gap-6 px-4 py-2.5 text-sm transition-colors
                    ${isActive
                      ? 'bg-[#e9f3e7] dark:bg-[#2A3C25] text-[#2E7D32] dark:text-primary font-semibold'
                      : 'text-[#101b0d] dark:text-white hover:bg-[#f3faf2] dark:hover:bg-[#253d20]'
                    }`}
                >
                  {o.label}
                  {isActive && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
