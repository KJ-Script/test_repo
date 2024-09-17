import React from "react";
import { serverApi } from "@/app/_trpc/server";
import VehiclePerformanceTable from "./tables/VehiclePerformanceTable";

const VehiclePerformanceContent = async () => {
  let initialData: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getVehiclePerformance"]["query"]>
  > = [];

  try {
    initialData = await serverApi.queue.getVehiclePerformance.query({
      from: new Date(Date.now()),
      to: new Date(Date.now()),
    });
  } catch (e) {
    console.log(e);
  }
  return (
    <div className="w-full">
      <VehiclePerformanceTable initialData={initialData} />
    </div>
  );
};

export default VehiclePerformanceContent;
