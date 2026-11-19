export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-sm border border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}
