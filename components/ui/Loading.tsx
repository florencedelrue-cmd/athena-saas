export function LoadingSpinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div
      className={`${className} border-2 border-athenaBlue/20 border-t-athenaBlue rounded-full animate-spin`}
    />
  );
}

export function LoadingState({ message = "Laden..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <LoadingSpinner className="w-8 h-8" />
      <p className="text-sm text-slate-500 font-semibold">{message}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-slate-400 text-xs">{message}</div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-200 h-48 animate-pulse" />
      ))}
    </div>
  );
}
