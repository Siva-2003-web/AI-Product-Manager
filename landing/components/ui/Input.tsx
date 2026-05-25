import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text font-body"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 border rounded-btn text-base font-body text-text bg-white
            transition-all duration-200 placeholder:text-text-light
            focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 font-body">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
