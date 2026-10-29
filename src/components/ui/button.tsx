import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-clinic";

    const variantStyles = {
      primary:
        "bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover shadow-sm",
      secondary:
        "bg-brand-secondary text-brand-secondary-foreground hover:bg-brand-secondary-hover shadow-sm",
      outline:
        "border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-accent/20",
      ghost: "hover:bg-brand-accent/30 text-brand-text",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
