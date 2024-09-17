"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "lucide-react";

const VehiclesCheckedOut_Count = ({
  vehiclesOutCount,
}: {
  vehiclesOutCount: Awaited<
    ReturnType<
      (typeof serverApi)["analytics"]["getVehiclesCheckedOutCount"]["query"]
    >
  >;
}) => {
  const getTotalPassengersToday =
    clientApi.analytics.getVehiclesCheckedOutCount.useQuery(undefined, {
      initialData: vehiclesOutCount,
    });
  return (
    <Card className="flex-1">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <UserIcon />
          <div className="flex flex-col">
            <span className="font-bold">{getTotalPassengersToday.data}</span>
            <span className="text-gray-500">Vehicles </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehiclesCheckedOut_Count;
