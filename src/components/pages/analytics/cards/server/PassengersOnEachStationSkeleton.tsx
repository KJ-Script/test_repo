import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

const PassengersOnEachStationSkeleton = () => {
  return (
    <Skeleton className="w-full col-span-4 lg:col-span-3">
      <Card className="lg:col-span-3  space-y-4">
        <CardHeader>
          <CardTitle>Passengers On Each Station</CardTitle>
        </CardHeader>
        <CardContent className="h-[50vh]">
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    </Skeleton>
  );
};

export default PassengersOnEachStationSkeleton;
