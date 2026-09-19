import { LabelHTMLAttributes } from "react";

export default function Label({
  className = "",
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-ink-light ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
