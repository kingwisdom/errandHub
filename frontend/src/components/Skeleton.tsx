export function CardSkeleton() {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-16" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/5 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/5" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden animate-pulse">
      <div className="border-b border-border bg-gray-50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-b border-border last:border-0 p-4">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
