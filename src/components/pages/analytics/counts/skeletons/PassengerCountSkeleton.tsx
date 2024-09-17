import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon } from "lucide-react";
import React from "react";

const PassengerCountSkeleton = () => {
  return (
    <Skeleton>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <UserIcon />
            <div className="flex flex-col">
              <span className="font-bold"></span>
              <span className="text-gray-500">Passengers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Skeleton>
  );
};

export default PassengerCountSkeleton;
