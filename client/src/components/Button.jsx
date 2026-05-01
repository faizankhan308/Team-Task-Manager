export const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const styles = {
    primary: 'bg-foreground text-background hover:opacity-90 disabled:bg-border-strong disabled:text-foreground-muted',
    secondary: 'bg-transparent text-foreground border border-border hover:bg-surface-hover',
    danger: 'bg-danger text-danger-foreground hover:opacity-90 disabled:bg-border-strong disabled:text-foreground-muted'
  };

  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
