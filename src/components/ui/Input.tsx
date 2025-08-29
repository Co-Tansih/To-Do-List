import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="block text-sm font-semibold text-gray-200"
      >
        {label}
      </label>
      <input
        id={id}
        className={`
          block w-full rounded-xl border-0 py-3 px-4 
          bg-white/10 backdrop-blur-sm
          ${error 
            ? 'text-red-300 ring-2 ring-red-500/50 placeholder:text-red-400/70 focus:ring-red-400' 
            : 'text-white shadow-sm ring-1 ring-white/20 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 hover:ring-white/30'
          }
          transition-all duration-200 ease-in-out
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-300 flex items-center gap-2" id={`${id}-error`}>
          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;