import * as React from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  left?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, left, id, ...rest }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-muted pl-1">
            {label}
          </label>
        )}
        <div className={cn(
          "flex items-center rounded-2xl border bg-surface transition-colors",
          error
            ? "border-danger/60"
            : "border-border focus-within:border-brand/60",
        )}>
          {left && <span className="pl-4 text-text-muted">{left}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent px-4 py-3 text-[15px] text-white placeholder:text-text-dim outline-none",
              className,
            )}
            {...rest}
          />
        </div>
        {(hint || error) && (
          <p className={cn("pl-1 text-xs", error ? "text-danger" : "text-text-muted")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...rest }, ref) => {
    const autoId = React.useId();
    const textareaId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-text-muted pl-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          className={cn(
            "rounded-2xl border bg-surface px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-text-dim",
            error
              ? "border-danger/60"
              : "border-border focus:border-brand/60",
            className,
          )}
          {...rest}
        />
        {error && <p className="pl-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
