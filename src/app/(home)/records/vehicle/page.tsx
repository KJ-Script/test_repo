import { serverApi } from "@/app/_trpc/server";
import VehicleContent from "@/components/pages/vehicle/Vehicle";
import VehicleTableSkeleton from "@/components/pages/vehicle/sekeletons/VehicleTableSkeleton";
import { Suspense } from "react";

const Vehicle = async () => {
  return (
    <Suspense fallback={<VehicleTableSkeleton />}>
      <VehicleContent />
    </Suspense>
  );
};

export default Vehicle;
