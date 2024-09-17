import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

const PassengerOnEachStationRadialSkeleton = () => {
  return (
    <Skeleton className="col-span-4 lg:col-span-4 space-y-4">
      <Card className="col-span-4 lg:col-span-4  space-y-4">
        <CardHeader></CardHeader>
        <CardContent className="h-[52vh]">
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    </Skeleton>
  );
};

export default PassengerOnEachStationRadialSkeleton;
