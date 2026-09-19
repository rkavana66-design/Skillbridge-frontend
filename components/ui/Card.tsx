import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Card({
  title,
  subtitle,
  action,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-indigo-100 bg-white shadow-card p-6 transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-ink-light">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
