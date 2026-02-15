import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function WeekendsLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}
