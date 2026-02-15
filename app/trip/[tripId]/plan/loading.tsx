import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PlanLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
