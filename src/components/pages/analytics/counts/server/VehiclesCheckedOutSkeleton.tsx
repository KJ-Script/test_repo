import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation2 } from "lucide-react";
import React from "react";

const VehiclesCheckedOutSkeleton = () => {
  return (
    <Skeleton>
      <Card className="w-[400px]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Navigation2 />
            <div className="flex flex-col">
              <span className="font-bold"></span>
              <span className="text-gray-500">Routes Covered</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Skeleton>
  );
};

export default VehiclesCheckedOutSkeleton;
