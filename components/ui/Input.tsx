export function Input({
  className = '',
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <input
      className={`block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
}
