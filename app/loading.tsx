import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col gap-6 py-6" role="status" aria-label="正在加载学习内容">
      <Skeleton className="h-12 w-3/4 max-w-lg" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-96 w-full" />
      <span className="sr-only">正在加载学习内容</span>
    </div>
  );
}
