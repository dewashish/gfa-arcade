type Variant = "primary" | "secondary" | "tertiary" | "error" | "surface";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-container/20 text-primary",
  secondary: "bg-secondary-container/30 text-on-secondary-container",
  tertiary: "bg-tertiary-container/20 text-tertiary",
  error: "bg-error-container text-on-error-container",
  surface: "bg-surface-high text-on-surface-variant",
};

export function Badge({ variant = "primary", children, icon, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full
        text-sm font-body font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      {children}
    </span>
  );
}
