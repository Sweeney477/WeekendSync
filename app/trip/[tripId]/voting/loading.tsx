import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function VotingLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Card className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
