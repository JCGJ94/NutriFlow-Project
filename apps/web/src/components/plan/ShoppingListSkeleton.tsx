import { Skeleton } from '@/components/ui/Skeleton';

export function ShoppingListSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20 pt-24 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-4">
             <div className="flex gap-4 items-center mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-64 h-8 rounded-lg" />
             </div>
             <Skeleton className="w-32 h-4 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-10 rounded-xl" />
            <Skeleton className="w-24 h-10 rounded-xl" />
          </div>
        </div>
        <Skeleton className="w-full h-2 rounded-full mt-4" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="w-full max-w-xl mx-auto h-14 rounded-full" />
        
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="break-inside-avoid bg-white dark:bg-surface-900 rounded-3xl p-4 shadow-sm border border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 pb-4 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="w-32 h-6 rounded-md" />
                        <Skeleton className="w-20 h-3 rounded-md" />
                    </div>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map(j => (
                        <Skeleton key={j} className="w-full h-12 rounded-2xl" />
                    ))}
                </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
