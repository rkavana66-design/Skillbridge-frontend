"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "outline" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-900 disabled:shadow-none disabled:opacity-50",
  outline:
    "bg-transparent text-indigo-300 border border-indigo-400/40 hover:bg-white/5 disabled:text-indigo-800 disabled:border-indigo-900",
  danger:
    "bg-clay-500 text-white hover:bg-clay-400 disabled:bg-clay-900 disabled:opacity-50",
  ghost:
    "bg-transparent text-ink hover:bg-white/5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", fullWidth, loading, className = "", children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium
        transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
