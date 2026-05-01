export const Input = ({ label, error, ...props }) => (
  <label className="block w-full">
    <span className="mb-1.5 block text-xs font-semibold text-foreground-muted">{label}</span>
    <input
      className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:border-border-strong focus:bg-surface-hover"
      {...props}
    />
    {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : null}
  </label>
);

export const Textarea = ({ label, error, ...props }) => (
  <label className="block w-full">
    <span className="mb-1.5 block text-xs font-semibold text-foreground-muted">{label}</span>
    <textarea
      className="focus-ring min-h-[120px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:border-border-strong focus:bg-surface-hover resize-y"
      {...props}
    />
    {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : null}
  </label>
);

export const Select = ({ label, children, error, ...props }) => (
  <label className="block w-full">
    <span className="mb-1.5 block text-xs font-semibold text-foreground-muted">{label}</span>
    <select
      className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:border-border-strong focus:bg-surface-hover"
      {...props}
    >
      {children}
    </select>
    {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : null}
  </label>
);
