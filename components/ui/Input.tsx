"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="field-shell">
          <input
            ref={ref}
            className={`w-full bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-light/50
            outline-none rounded-md file:mr-3 file:rounded file:border-0 file:bg-indigo-50
            file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-600 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-clay-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
