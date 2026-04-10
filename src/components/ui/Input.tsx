"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-body font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl bg-surface-low px-4 py-3.5
              font-body text-on-surface text-base
              outline-none ring-2 ring-transparent
              placeholder:text-outline-variant
              focus:ring-primary-container focus:bg-surface-lowest
              transition-all duration-200
              ${icon ? "pl-12" : ""}
              ${error ? "ring-error" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-sm text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
