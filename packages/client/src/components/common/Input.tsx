import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: 'var(--spacing-md)' }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '0.75rem',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-base)',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
