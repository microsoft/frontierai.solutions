import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  className?: string;
}

export function Dropdown({ label, options, onSelect, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/[0.07] hover:ring-white/20 transition-all text-sm text-zinc-200 cursor-pointer"
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto rounded-lg bg-[#0a0a0a] border border-white/10 shadow-2xl"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-zinc-200 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 cursor-pointer"
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
