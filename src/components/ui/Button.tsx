import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "cobalt" | "secondary" | "tertiary" | "subtle";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon,
  className = "",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`signet-btn signet-btn--${variant} signet-btn--${size} ${className}`}
      style={style}
      {...props}
    >
      {icon && <span className="signet-btn__icon">{icon}</span>}
      {children && <span className="signet-btn__text">{children}</span>}
    </button>
  );
}
