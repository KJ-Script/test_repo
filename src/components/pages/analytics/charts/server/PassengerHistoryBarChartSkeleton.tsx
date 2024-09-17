import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

const PassengerHistoryBarChartSkeleton = () => {
  return (
    <Skeleton className="w-full">
      <Card className="w-full border rounded-lg my-2 p-3 h-[55vh]">
        <Loader2 className="animate-spin" />
      </Card>
    </Skeleton>
  );
};

export default PassengerHistoryBarChartSkeleton;
