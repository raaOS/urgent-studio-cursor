'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  showValidation?: boolean;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  className,
  type,
  label,
  error,
  success,
  hint,
  showValidation = false,
  validationRules,
  value,
  onChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState<string>(value as string || '');
  const [validationError, setValidationError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const validateInput = useCallback((inputValue: string): void => {
    if (!validationRules || !showValidation) return;

    let errorMessage = '';

    if (validationRules.required && !inputValue.trim()) {
      errorMessage = 'Field ini wajib diisi';
    } else if (validationRules.minLength && inputValue.length < validationRules.minLength) {
      errorMessage = `Minimal ${validationRules.minLength} karakter`;
    } else if (validationRules.maxLength && inputValue.length > validationRules.maxLength) {
      errorMessage = `Maksimal ${validationRules.maxLength} karakter`;
    } else if (validationRules.pattern && !validationRules.pattern.test(inputValue)) {
      errorMessage = 'Format tidak valid';
    } else if (validationRules.custom) {
      const customError = validationRules.custom(inputValue);
      if (customError) errorMessage = customError;
    }

    setValidationError(errorMessage);
    setIsValid(!errorMessage && inputValue.length > 0);
  }, [validationRules, showValidation]);

  useEffect(() => {
    validateInput(internalValue);
  }, [internalValue, validationRules, showValidation, validateInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);
  };

  const displayError = error || validationError;
  const displaySuccess = success || (isValid && showValidation);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {validationRules?.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "flex h-10 w-full rounded-md border-2 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            displayError 
              ? "border-destructive focus-visible:border-destructive" 
              : displaySuccess 
                ? "border-accent focus-visible:border-accent"
                : "border-foreground focus-visible:border-primary",
            isFocused && "shadow-neo-sm",
            className
          )}
          value={internalValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Validation Icons */}
        {showValidation && internalValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {displayError ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : isValid ? (
              <Check className="h-4 w-4 text-accent" />
            ) : null}
          </div>
        )}
      </div>

      {/* Messages */}
      {displayError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {displayError}
        </p>
      )}
      
      {displaySuccess && !displayError && (
        <p className="text-sm text-accent flex items-center gap-1">
          <Check className="h-3 w-3" />
          {typeof displaySuccess === 'string' ? displaySuccess : 'Valid'}
        </p>
      )}
      
      {hint && !displayError && !displaySuccess && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
};

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                index < currentStep
                  ? "bg-accent text-accent-foreground border-accent"
                  : index === currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-muted"
              )}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 mx-2",
                  index < currentStep ? "bg-accent" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{steps[currentStep]}</p>
        <p className="text-xs text-muted-foreground">
          Langkah {currentStep + 1} dari {steps.length}
        </p>
      </div>
    </div>
  );
};

export default EnhancedInput;