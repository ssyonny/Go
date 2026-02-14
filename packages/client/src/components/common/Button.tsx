import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export default function Button({ variant = 'primary', fullWidth, className, style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    transition: 'background-color 0.2s, opacity 0.2s',
    ...style,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--color-primary)', color: '#fff' },
    secondary: { backgroundColor: 'var(--color-border)', color: 'var(--color-text)' },
    danger: { backgroundColor: 'var(--color-error)', color: '#fff' },
  };

  return <button style={{ ...baseStyle, ...variants[variant] }} {...props} />;
}
