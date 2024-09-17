import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

const CountsAreaChartSkeleton = () => {
  return (
    <Skeleton>
      <Card className="w-full h-[50vh] border rounded-lg my-2">
        <Loader2 className="animate-spin" />
      </Card>
    </Skeleton>
  );
};

export default CountsAreaChartSkeleton;
